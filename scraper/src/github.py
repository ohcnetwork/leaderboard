#!/usr/bin/env python3

import argparse
import json
import logging
import re
from datetime import datetime, timedelta
from os import getenv
from pathlib import Path
from urllib.parse import parse_qsl, urlparse
from zoneinfo import ZoneInfo

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(message)s",
)

logger = logging.getLogger(__name__)


user_blacklist = {
    "dependabot",
    "snyk-bot",
    "codecov-commenter",
}


def serializer(obj):
    return obj.timestamp() if isinstance(obj, datetime) else repr(obj)


class GitHubScraper:
    def __init__(
        self, org, token, data_dir, date, days_back=1, log_level=logging.INFO
    ):
        self.log = logging.getLogger("GitHubScraper")
        self.log.setLevel(log_level)
        self.org = org
        self.token = token
        self.start_date = (date - timedelta(days=int(days_back))).date()
        self.end_date = date.date()
        self.data = {}
        self.data_dir = data_dir
        self.headers = {
            "Authorization": f"token {self.token}",
            # https://docs.github.com/en/rest/overview/media-types
            "Accept": "application/vnd.github.v3.raw+json",
        }
        self.log.debug(
            f"Fetching events for {self.org} from {self.start_date} to {self.end_date}"
        )

    def append(self, user, event):
        self.log.debug(f"Appending event for {user}")
        try:
            self.data[user]["activity"].append(event)
            if event["time"] > self.data[user]["last_updated"]:
                self.data[user]["last_updated"] = event["time"]
        except KeyError:
            self.log.debug(f"Adding new user {user}")
            self.data[user] = {
                "last_updated": event["time"],
                "activity": [event],
                "open_prs": [],
                "authored_issue_and_pr":[],
            }

    def parse_event(self, event, event_time):
        user = event["actor"]["login"]
        try:
            _user = event["payload"]["pull_request"]["user"]["login"]
        except KeyError:
            _user = user
        if _user.endswith("[bot]") or _user in user_blacklist:
            self.log.debug(f"Skipping blacklisted user {_user}")
            return

        self.log.debug(f"Parsing event for {user}")
        self.log.debug(f"event_id: {event['id']}")
        # if event["type"] == "cross-referenced":
        #     print(event)
        if event["type"] == "IssueCommentEvent":
            if event["payload"]["action"] in ("created",):
                self.append(
                    event["actor"]["login"],
                    {
                        "type": f'comment_{event["payload"]["action"]}',
                        "title": f'{event["repo"]["name"]}#{event["payload"]["issue"]["number"]}',
                        "time": event_time,
                        "link": event["payload"]["comment"]["html_url"],
                        "text": event["payload"]["comment"]["body"],
                    },
                )

        elif event["type"] == "IssuesEvent":
            if event["payload"]["action"] in (
                "opened",
                "assigned",
                "closed",
            ):
                self.append(
                    user,
                    {
                        "type": f'issue_{event["payload"]["action"]}',
                        "title": f'{event["repo"]["name"]}#{event["payload"]["issue"]["number"]}',
                        "time": event_time,
                        "link": event["payload"]["issue"]["html_url"],
                        "text": event["payload"]["issue"]["title"],
                    },
                )

        elif event["type"] == "PullRequestEvent":
            if event["payload"]["action"] == "opened":
                self.append(
                    user,
                    {
                        "type": f'pr_{event["payload"]["action"]}',
                        "title": f'{event["repo"]["name"]}#{event["payload"]["pull_request"]["number"]}',
                        "time": event_time,
                        "link": event["payload"]["pull_request"]["html_url"],
                        "text": event["payload"]["pull_request"]["title"],
                    },
                )

            elif (
                event["payload"]["action"] == "closed"
                and event["payload"]["pull_request"]["merged"]
            ):
                self.append(
                    event["payload"]["pull_request"]["user"]["login"],
                    {
                        "type": "pr_merged",
                        "title": f'{event["repo"]["name"]}#{event["payload"]["pull_request"]["number"]}',
                        "time": event_time,
                        "link": event["payload"]["pull_request"]["html_url"],
                        "text": event["payload"]["pull_request"]["title"],
                    },
                )

                self.add_collaborations(event, event_time)

        elif event["type"] == "PullRequestReviewEvent":
            self.append(
                user,
                {
                    "type": "pr_reviewed",
                    "time": event_time,
                    "title": f'{event["repo"]["name"]}#{event["payload"]["pull_request"]["number"]}',
                    "link": event["payload"]["review"]["html_url"],
                    "text": event["payload"]["pull_request"]["title"],
                },
            )
    
    def add_collaborations(self, event, event_time):
        collaborators = set()
        
        commits = requests.get(
            event['payload']['pull_request']['commits_url'],
            headers=self.headers,
        ).json()

        for commit in commits:
            collaborators.add(commit['author']['login'])

            co_authors = re.findall('Co-authored-by: (.+) <(.+)>', commit['commit']['message'])
            if co_authors:
                for (name, email) in co_authors:
                    users = requests.get(
                        'https://api.github.com/search/users',
                        params={'q': email},
                        headers=self.headers
                    ).json()

                    if users['total_count'] > 0:
                        collaborators.add(users['items'][0]['login'])
                        continue

                    users = requests.get(
                        'https://api.github.com/search/users',
                        params={'q': name},
                        headers=self.headers
                    ).json()

                    if users['total_count'] == 1:
                        collaborators.add(users['items'][0]['login'])
            
        if len(collaborators) > 1:
            for user in collaborators:
                others = collaborators.copy()
                others.remove(user)
                self.append(
                    user,
                    {
                        "type": "pr_collaborated",
                        "title": f'{event["repo"]["name"]}#{event["payload"]["pull_request"]["number"]}',
                        "time": event_time,
                        "link": event["payload"]["pull_request"]["html_url"],
                        "text": event["payload"]["pull_request"]["title"],
                        "collaborated_with": list(others)
                    },
                )


    def fetch_events(self, page=1):
        self.log.info(f"Fetching events page:{page}")
        resp = requests.get(
            f"https://api.github.com/orgs/{self.org}/events?per_page=100&page={page}",
            headers=self.headers,
        )
        if resp.status_code == 422:
            self.log.warning("Last page reached")  # stop pagination
            return self.data
        resp.raise_for_status()
        events = resp.json()

        events_count = 0
        for event in events:
            event_time = datetime.strptime(
                event["created_at"], "%Y-%m-%dT%H:%M:%S%z")

            if event_time.date() > self.end_date:
                continue
            elif event_time.date() <= self.start_date:
                return self.data
            self.parse_event(event, event_time)
            events_count += 1
        self.log.info(f"Fetched {events_count} events")

        if has_next := resp.links.get("next", {}).get("url"):
            next_page = dict(parse_qsl(urlparse(has_next).query)).get("page", 99)
            return self.fetch_events(int(next_page))
        return self.data

    def fetch_open_pulls(self, user):
        self.log.debug(f"Fetching open pull requests for {user}")
        resp = requests.get(
            f"https://api.github.com/search/issues?q=is:pr+is:open+org:{self.org}+author:{user}",
            headers=self.headers,
        )
        if resp.status_code == 422:
            self.log.warning("Last page reached")  # stop pagination
            return self.data
        resp.raise_for_status()
        pulls = resp.json()["items"]

        for pr in pulls:
            today = datetime.now()
            pr_last_updated = datetime.strptime(pr['updated_at'], "%Y-%m-%dT%H:%M:%SZ")

            self.data[user]["open_prs"].append(
                {
                    "link": pr["html_url"],
                    "title": pr["title"],
                    "stale_for": (today.replace(tzinfo=None) - pr_last_updated.replace(tzinfo=None)).days,
                    "labels": [label["name"] for label in pr["labels"]],
                }
            )
        self.log.debug(f"Fetched {len(pulls)} open pull requests for {user}")

        return self.data

    def resolve_autonomy_responsibility(self, event, user):
        if event["event"] == "cross-referenced" and event["source"]["type"] == "issue":
            return event["source"]["issue"]["user"]["login"] == user
        return False

    def fetch_merge_events(self, user):
        self.log.debug(f"Merge events for {user}")
        # check for those issues which are closed today (reduce number of issues to be calculated)
        resp = requests.get(
            f"https://api.github.com/search/issues?q=is:issue+is:closed+org:{self.org}+author:{user}",
            headers=self.headers,
        )
        if resp.status_code == 422:
            self.log.warning("Last page reached")  # stop pagination
            return self.data
        resp.raise_for_status()
        issues = resp.json()["items"]
        merged_prs = []
        for issue in issues:
            timeline_events = requests.get(
                issue["timeline_url"],
                headers=self.headers,
            )
            if timeline_events.status_code != 200:
                return
            timeline_events.raise_for_status()
            events = timeline_events.json()
            for event in events:
                if self.resolve_autonomy_responsibility(event, user):
                    if 'pull_request' in event["source"]["issue"]:
                        pr = event["source"]["issue"]["pull_request"]
                        if pr["merged_at"]:
                            merged_prs.append(
                                {
                                    "issue_link": issue["html_url"],
                                    "pr_link": pr["html_url"]
                                }
                            )
        for pr in merged_prs:
            self.data[user]["authored_issue_and_pr"].append(pr)
        self.log.debug(f"Fetched {len(merged_prs)} merged pull requests and issues for {user}")
        return self.data

    def scrape(self):
        self.log.info(f"Scraping {self.org}")
        self.fetch_events(1)
        self.log.info(f"Scraping open pull requests for {len(self.data)} users")
        for user in self.data.keys():
            try:
                self.fetch_merge_events(user)
            except Exception as e:
                self.log.error(f"Error fetching merge events for {user}: {e}")
            try:
                self.fetch_open_pulls(user)
            except Exception as e:
                self.log.error(f"Error fetching open pulls for {user}: {e}")
        self.log.info(f"Scraped {self.org}")
        return self.data

    def load_user_data(self, user):
        file = self.data_dir / f"{user}.json"
        self.log.debug(f"Loading user data from {file}")
        try:
            with file.open() as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.log.debug(f"User data not found for {user}")
            return {"activity": []}

    def save_user_data(self, user, data):
        file = self.data_dir / f"{user}.json"
        self.log.debug(f"Saving user data to {file}")
        with file.open("w") as f:
            json.dump(data, f, indent=2, default=serializer)

    def merge_data(self):
        self.log.info("Updating data")
        for user in self.data.keys():
            self.log.debug(f"Merging user data for {user}")
            old_data = self.load_user_data(user)
            data = self.data.get(user)
            data["activity"].extend(old_data["activity"])
            self.save_user_data(user, data)
        self.log.info("Updated data")

    def run(self):
        self.scrape()
        self.merge_data()
        self.log.info("Done")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("org_name", help="GitHub organization")
    parser.add_argument("data_dir", help="Directory to store user data")
    parser.add_argument(
        "-d",
        "--date",
        required=False,
        help="Date to start scraping from (YYYY-MM-DD)",
        default=None,
    )
    parser.add_argument(
        "-n",
        "--num-days",
        required=False,
        help="Number of days to scrape",
        default=1,
    )
    parser.add_argument(
        "-l",
        "--log-level",
        required=False,
        dest="loglevel",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Set the logging level",
        default="INFO",
    )
    args = parser.parse_args()

    logger.setLevel(getattr(logging, args.loglevel))

    token = getenv("GITHUB_TOKEN")
    if not token:
        logger.error("GITHUB_TOKEN not found in environment")
        exit(1)

    if args.date is None:
        date = datetime.now(tz=ZoneInfo("UTC")) - timedelta(days=1)
    else:
        date = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=ZoneInfo("UTC"))

    scraper = GitHubScraper(
        args.org_name,
        token,
        Path(args.data_dir),
        date,
        days_back=args.num_days,
        log_level=getattr(logging, args.loglevel),
    )
    scraper.run()


if __name__ == "__main__":
    main()

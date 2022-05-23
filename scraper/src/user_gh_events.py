#!/usr/bin/env python3

import json
from datetime import datetime, timedelta
from sys import argv
from zoneinfo import ZoneInfo
from urllib.parse import urlparse, parse_qsl

import requests

token = "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"

users = (
    "Marmik2003",
    "naman114",
    "kunatastic",
    "GokulramGHV",
    "skks1212",
    "rithviknishad",
    "rabilrbl",
    "patelaryan7751",
    "Ashesh3",
    "sainAk",
    "siddnikh",
    "cp-Coder",
    "iamsdas",
    "Pranshu1902",
    "ishanExtreme",
    "Ritesh-Aggarwal",
    "anuran-roy",
    "Pragati1610",
    "gigincg",
    "vigneshhari",
    "tomahawk-pilot",
    "bodhish"
)


def add_event(data, user, event):
    try:
        data[user]["activity"].append(event)
        if event["time"] > data[user]["last_updated"]:
            data[user]["last_updated"] = event["time"]
    except KeyError:
        data[user] = {
            "last_updated": event["time"],
            "activity": [event],
            "open_prs": [],
        }


def add_open_pr(data, user, pr):
    try:
        data[user]["open_prs"].append(pr)
    except KeyError:
        data[user] = {"last_updated": 0, "activity": [], "open_prs": [pr]}


def fetch_repo_events(user, end_date, data=None, page=1):
    print(f"Fetching events for {user} page:{page}")
    # start_date = (end_date - timedelta(days=15)).date()
    start_date = datetime(2022, 5, 9).date()
    data = data or {}

    resp = requests.get(
        f"https://api.github.com/users/{user}/events/public?per_page=100&page={page}",
        headers={
            "Accept": "application/vnd.github.v3.raw+json",  # https://docs.github.com/en/rest/overview/media-types
            "Authorization": f"token {token}"
        },
    )

    if resp.status_code == 422:
        # stop pagination
        return data

    resp.raise_for_status()
    events = resp.json()

    if not events:
        return data

    for event in events:
        if not event["repo"]["name"].startswith("coronasafe"):
            continue
        event_time = datetime.strptime(
            event["created_at"], "%Y-%m-%dT%H:%M:%SZ"
        ).replace(tzinfo=ZoneInfo("UTC"))

        if event_time.date() > end_date.date():
            continue
        elif event_time.date() <= start_date:
            return data

        if event["type"] == "IssueCommentEvent":
            if event["payload"]["action"] in ("created",):
                add_event(
                    data,
                    event["actor"]["display_login"],
                    {
                        "type": f'comment_{event["payload"]["action"]}',
                        "title": f'{event["repo"]["name"]}#{event["payload"]["issue"]["number"]}',
                        "time": event_time,
                        "link": event["payload"]["comment"]["html_url"],
                        "text": event["payload"]["comment"]["body"],
                    },
                )

        elif event["type"] == "IssuesEvent":
            if event["payload"]["action"] in ("opened", "closed", "assigned"):
                add_event(
                    data,
                    event["actor"]["display_login"],
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
                add_event(
                    data,
                    event["actor"]["display_login"],
                    {
                        "type": f'pr_{event["payload"]["action"]}',
                        "title": f'{event["repo"]["name"]}#{event["payload"]["pull_request"]["number"]}',
                        "time": event_time,
                        "link": event["payload"]["pull_request"]["html_url"],
                        "text": event["payload"]["pull_request"]["title"],
                    },
                )
                if event["payload"]["pull_request"]["state"] == "open":
                    add_open_pr(
                        data,
                        event["actor"]["display_login"],
                        {
                            "link": event["payload"]["pull_request"]["html_url"],
                            "title": event["payload"]["pull_request"]["title"],
                        },
                    )

            elif (
                event["payload"]["action"] == "closed"
                and event["payload"]["pull_request"]["merged"]
            ):
                add_event(
                    data,
                    event["actor"]["display_login"],
                    {
                        "type": "pr_merged",
                        "title": f'{event["repo"]["name"]}#{event["payload"]["pull_request"]["number"]}',
                        "time": event_time,
                        "link": event["payload"]["pull_request"]["html_url"],
                        "text": event["payload"]["pull_request"]["title"],
                    },
                )

        elif event["type"] == "PullRequestReviewEvent":
            add_event(
                data,
                event["actor"]["display_login"],
                {
                    "type": "pr_reviewed",
                    "time": event_time,
                    "title": f'{event["repo"]["name"]}#{event["payload"]["pull_request"]["number"]}',
                    "link": event["payload"]["review"]["html_url"],
                    "text": event["payload"]["pull_request"]["title"],
                },
            )

    if has_next := resp.links.get("next", {}).get("url"):
        next_page = dict(parse_qsl(urlparse(has_next).query)).get("page", 99)
        return fetch_repo_events(user, end_date, data, int(next_page))
    return data


def serializer(title):
    return title.timestamp() if isinstance(title, datetime) else repr(title)


if __name__ == "__main__":

    # if len(argv) < 3:
    #     print("Usage:python3 events.py <date:YYYY-MM-DD> [<repo:owner/repo-name>]...")
    #     exit(1)

    # _date = datetime.strptime(argv[1], "%Y-%m-%d").replace(tzinfo=ZoneInfo("UTC"))

    # repos = argv[2:]

    data = {}
    # for repo in repos:
    #     data = fetch_repo_events(repo, _date, data)

    for user in users:
        data = fetch_repo_events(user, datetime.now(), data)

    with open("data/events_seed_data.json", "w") as f:
        json.dump(data, f, indent=2, default=serializer)

    print(len(data))

    print("Done")

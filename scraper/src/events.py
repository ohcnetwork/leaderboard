#!/usr/bin/env python3

import json
from datetime import date, datetime, timedelta
from sys import argv
from zoneinfo import ZoneInfo

import requests

allowed_events = (
    "IssueCommentEvent",  # counts PR comments as well
    "IssuesEvent",
    "PullRequestEvent",
    "PullRequestReviewEvent",
    "PullRequestReviewCommentEvent",
)


def add_event(data, user, event):
    try:
        data[user]["activity"].append(event)
        if event["time"] > data[user]["last_updated"]:
            data[user]["last_updated"] = event["time"]
    except KeyError:
        data[user] = {"last_updated": event["time"], "activity": [event]}


def fetch_repo_events(repo, date, data=None, page=1):
    print(f"Fetching events for {repo} {page}")
    prev_day = (date - timedelta(days=15)).date()
    data = data or {}

    resp = requests.get(
        f"https://api.github.com/repos/{repo}/events?per_page=50&page={page}"
    )
    resp.raise_for_status()
    events = resp.json()

    if not events:
        return data

    for event in events:
        event_time = datetime.strptime(
            event["created_at"], "%Y-%m-%dT%H:%M:%SZ"
        ).replace(tzinfo=ZoneInfo("UTC"))

        if event_time.date() > date.date():
            continue
        elif event_time.date() <= prev_day:
            return data

        if event["type"] == "IssueCommentEvent":
            if event["payload"]["action"] in ("created",):
                add_event(
                    data,
                    event["actor"]["display_login"],
                    {
                        "type": f'comment_{event["payload"]["action"]}',
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
                        "time": event_time,
                        "link": event["payload"]["pull_request"]["html_url"],
                        "text": event["payload"]["pull_request"]["title"],
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
                    "link": event["payload"]["review"]["html_url"],
                    "text": event["payload"]["pull_request"]["title"],
                },
            )

    if page > 10:
        # don't go too far
        return data
    return fetch_repo_events(repo, date, data, page + 1)


def serializer(obj):
    return obj.isoformat() if isinstance(obj, (datetime, date)) else repr(obj)


if __name__ == "__main__":

    if len(argv) < 3:
        print("Usage:python3 events.py <date:YYYY-MM-DD> [<repo:owner/repo-name>]...")
        exit(1)

    _date = datetime.strptime(argv[1], "%Y-%m-%d").replace(tzinfo=ZoneInfo("UTC"))

    repos = argv[2:]

    data = {}
    for repo in repos:
        data = fetch_repo_events(repo, _date, data)


    with open(f"data/events_{argv[1]}.json", "w") as f:
        json.dump(data, f, indent=2, default=serializer)

    print(len(data))

    print("Done")

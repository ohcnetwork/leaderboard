#!/usr/bin/env python3

import argparse
import json
import os
from datetime import datetime, timedelta

import requests
from requests.exceptions import RequestException

parser = argparse.ArgumentParser()
parser.add_argument("--lookback_days", type=int, help="Fetch the Last X days Data", default=0)
args = parser.parse_args()


SLACK_CHANNEL = os.environ.get("SLACK_CHANNEL", "C02U0A47JUQ")
SLACK_API_TOKEN = os.environ.get("SLACK_API_TOKEN", "")
if not SLACK_API_TOKEN:
    raise Exception("SLACK_API_TOKEN is not set")


MESSAGE_DUMP_FILE_NAME = "message_dump"


def generate_timestamp(date):
    return datetime.timestamp(date)


def parse_save_user_data(data: dict, date):
    user_dict = {}
    for message in data:
        if "user" not in message:
            continue
        user = message["user"]
        user_dict[user] = user_dict.get(user, []) + [message]
    for user in user_dict:
        save_user_data(user, user_dict[user], date)


def save_user_data(user, user_data, date):
    existing_user_data = get_file(user)
    existing_user_data[str(date)] = user_data
    dump_file(user, existing_user_data)


def save_data(data: dict, date):
    existing_user_data = get_file(MESSAGE_DUMP_FILE_NAME)
    existing_user_data[str(date)] = data
    dump_file(MESSAGE_DUMP_FILE_NAME, existing_user_data)


def get_slack_data(date):
    cursor = True
    request_body = {
        "channel": SLACK_CHANNEL,
        "latest": generate_timestamp(date + timedelta(days=1)),
        "oldest": generate_timestamp((date)),
        "limit": 200,
    }
    messages = []
    while cursor:
        response = requests.get(
            "https://slack.com/api/conversations.history",
            request_body,
            headers={"Authorization": f"Bearer {SLACK_API_TOKEN}"},
        )
        response.raise_for_status()
        response_body = response.json()
        if not response_body.get("ok", True):
            raise RequestException(f"Slack API Error:{response_body.get('error')}")
        if "next_cursor" in response_body.get("response_metadata", {}):
            cursor = response_body["response_metadata"]["next_cursor"]
        else:
            cursor = False
        request_body["cursor"] = cursor
        messages += response_body["messages"]
    return messages


def generate_cache(lookback):
    current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    for counter in range(lookback + 1):
        date = current_date - timedelta(days=counter)
        data = get_slack_data(date)
        parse_save_user_data(data, date)
        save_data(data, date)


def get_file(
    filename: str,
):
    try:
        with open(f"data/slack/{filename}.json", "r") as fp:
            return json.load(fp)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def dump_file(filename: str, data: dict):
    with open(f"data/slack/{filename}.json", "w") as fp:
        json.dump(data, fp, indent=4)


generate_cache(args.lookback_days)

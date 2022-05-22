import argparse
import json
import os
from datetime import datetime, timedelta

import requests

parser = argparse.ArgumentParser()

parser.add_argument("--lookback_days", type=int, help="Fetch the Last X days Data", default=0)

args = parser.parse_args()

lookback_days = args.lookback_days

slack_api_token = os.environ.get("SLACK_API_TOKEN", "xoxb-417332993380-3557088320245-YMXTOFTkCzl6QPMkXLUG2SfX")

slack_channel = os.environ.get("SLACK_CHANNEL", "C02U0A47JUQ")


def generate_timestamp(date):
    return datetime.timestamp(date) * 1


def parse_save_user_data(data: dict):
    pass


def save_data(data: dict):
    pass


def get_slack_data(date):
    cursor = True
    request_body = {
        "channel": slack_channel,
        "latest": generate_timestamp(date + timedelta(days=1)),
        "oldest": generate_timestamp((date)),
        "limit": 200,
    }
    messages = []
    while cursor:
        response = requests.get(
            "https://slack.com/api/conversations.history",
            request_body,
            headers={"Authorization": f"Bearer {slack_api_token}"},
        )
        if response.status_code != 200:
            raise Exception("Slack Connection Failed")
        response_body = response.json()
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
        print(current_date - timedelta(days=counter))
        data = get_slack_data((current_date - timedelta(days=counter)))
        parse_save_user_data(data)
        save_data(data)
    return


def get_file(filename: str, data: dict):
    with open(f"data/{filename}", "r") as fp:
        data = fp.read()
        if data:
            return json.loads(data)
        return {}


def dump_file(filename: str, data: dict):
    with open(f"data/{filename}", "w") as fp:
        fp.write(json.dumps(data, indent=4))


generate_cache(lookback_days)

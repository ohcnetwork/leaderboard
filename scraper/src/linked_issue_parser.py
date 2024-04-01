import re
from os import getenv
import requests

class LinkedIssueParser:
    def __init__(self,org:str, repo:str, pr_no:int, pr_body: str):
        self.repo = repo
        self.pr_no = pr_no
        self.pr_body = pr_body
        self.org = org

    # The logic here is as follows:
    #     Get a list of all events on a Pull Request of the type CONNECTED_EVENT and DISCONNECTED_EVENT
    #     Create a map, keyed by Issue number and keep a count of how may times the issue is CONNECTED and DISCONNECTED
    #     From that map, look for keys that have an odd-numbered count, as these are the events that have been CONNECTED that don't have a corresponding DISCONNECTED event.

    def parse_ui_linked_issues(self):
        query = """
        {{
        resource(url: "https://github.com/{org}/{repo}/pull/{pr_no}") {{
            ... on PullRequest {{
            timelineItems(itemTypes: [CONNECTED_EVENT, DISCONNECTED_EVENT], first: 100) {{
                nodes {{
                ... on ConnectedEvent {{
                    id
                    subject {{
                    ... on Issue {{
                        number
                    }}
                    }}
                }}
                ... on DisconnectedEvent {{
                    id
                    subject {{
                    ... on Issue {{
                        number
                    }}
                    }}
                }}
                }}
            }}
            }}
        }}
        }}
        """.format(org = self.org, repo = self.repo, pr_no = self.pr_no)
        gh_url = 'https://api.github.com/graphql'
        token = getenv('GITHUB_TOKEN')
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type':'application/json'
        }
        response = requests.post(gh_url,headers=headers,json={'query':query})
        if response.status_code != 200:
            return []
        data = response.json()
        issues = {}
        for node in data['data']['resource']['timelineItems']['nodes']:
            issue_number = node['subject']['number'] 
            if issue_number in issues:
                issues[issue_number] +=1
            else: 
                issues[issue_number] = 1

        linked_issues = []
        for issue, count in issues.items():
            if count % 2 != 0:
                linked_issues.append(f'https://github.com/{self.org}/{self.repo}/issues/{issue}')
        return linked_issues

    def get_concat_commit_messages(self):
        commit_url = f'https://api.github.com/repos/{self.org}/{self.repo}/pulls/{self.pr_no}/commits'
        resposne = requests.get(commit_url)
        if resposne.status_code != 200:
            return ""
        json_data = resposne.json()
        result = ""
        for commit in json_data:
            message = commit['commit']['message']
            result = f'{result} , {message}'
        return result

    def parse_desc_linked_issues(self):
        pattern_same_repo = r'\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)'
        pattern_other_repo = r'\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(\S+\/\S+)#(\d+)'
        commit_messages = self.get_concat_commit_messages()
        text = f'{self.pr_body} {commit_messages}'
        same_repo_linked_issues = re.findall(pattern_same_repo,text,re.IGNORECASE)
        other_repo_linked_issues = re.findall(pattern_other_repo,text,re.IGNORECASE)
        linked_issues = set([])
        for issue in same_repo_linked_issues:
            linked_issues.add(issue)
        for issue in other_repo_linked_issues:
            linked_issues.add(issue)
        linked_issues_url = []
        for issue in linked_issues:
            if isinstance(issue, str):
                linked_issues_url.append(f'https://github.com/{self.org}/{self.repo}/issues/{issue}')
            elif isinstance(issue, tuple):
                linked_issues_url.append(f'https://github.com/{issue[0]}/issues/{issue[1]}')
            continue
        return linked_issues_url


    def parse_linked_issues(self):
        linked_issues = []
        ui_linked_issues = self.parse_ui_linked_issues()
        desc_linked_issues = self.parse_desc_linked_issues()
        for issue in ui_linked_issues:
            linked_issues.append(issue)
        for issue in desc_linked_issues:
            linked_issues.append(issue)
        return linked_issues
    
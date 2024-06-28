import requests
from urllib.parse import urlparse


class GitHubService:
    def __init__(self, token):
        self.token = token
        self.api_base_url = "https://api.github.com"
        self.headers = {"Authorization": f"token {self.token}"}

    def get_repo_contents(self, repo_url):
        parsed_url = urlparse(repo_url)
        path_parts = parsed_url.path.strip("/").split("/")
        owner, repo = path_parts[0], path_parts[1]

        return self._get_contents(owner, repo)

    def _get_contents(self, owner, repo, path=""):
        url = f"{self.api_base_url}/repos/{owner}/{repo}/contents/{path}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()

        contents = response.json()
        all_contents = []

        if isinstance(contents, list):
            for item in contents:
                if item["type"] == "file":
                    all_contents.append(
                        {
                            "name": item["name"],
                            "path": item["path"],
                            "download_url": item["download_url"],
                            "type": "file",
                        }
                    )
                elif item["type"] == "dir":
                    all_contents.extend(self._get_contents(owner, repo, item["path"]))
        else:
            all_contents.append(
                {
                    "name": contents["name"],
                    "path": contents["path"],
                    "download_url": contents["download_url"],
                    "type": "file",
                }
            )

        return all_contents

    def get_file_content(self, download_url):
        response = requests.get(download_url, headers=self.headers)
        response.raise_for_status()
        return response.text

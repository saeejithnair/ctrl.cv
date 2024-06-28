import requests
from urllib.parse import urlparse


class GitHubService:
    def __init__(self, token):
        self.token = token
        self.api_base_url = "https://api.github.com"

    def get_repo_contents(self, repo_url):
        parsed_url = urlparse(repo_url)
        path_parts = parsed_url.path.strip("/").split("/")
        owner, repo = path_parts[0], path_parts[1]

        return self._get_contents(owner, repo)

    def _get_contents(self, owner, repo, path=""):
        url = f"{self.api_base_url}/repos/{owner}/{repo}/contents/{path}"
        headers = {"Authorization": f"token {self.token}"}
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        contents = response.json()
        all_contents = []

        for item in contents:
            if item["type"] == "file":
                all_contents.append(
                    {
                        "name": item["name"],
                        "path": item["path"],
                        "download_url": item["download_url"],
                    }
                )
            elif item["type"] == "dir":
                all_contents.extend(self._get_contents(owner, repo, item["path"]))

        return all_contents

import requests
from urllib.parse import urlparse
import base64
from functools import lru_cache


class GitHubService:
    def __init__(self, token):
        self.token = token
        self.api_base_url = "https://api.github.com"
        self.headers = {"Authorization": f"token {self.token}"}
        self.max_file_size = 1024 * 1024  # 1 MB limit

    @lru_cache(maxsize=100)
    def get_repo_contents(self, repo_url):
        parsed_url = urlparse(repo_url)
        path_parts = parsed_url.path.strip("/").split("/")
        owner, repo = path_parts[0], path_parts[1]

        commits_url = f"{self.api_base_url}/repos/{owner}/{repo}/commits"
        response = requests.get(commits_url, headers=self.headers)
        response.raise_for_status()
        latest_commit_sha = response.json()[0]["sha"]

        tree_url = f"{self.api_base_url}/repos/{owner}/{repo}/git/trees/{latest_commit_sha}?recursive=1"
        response = requests.get(tree_url, headers=self.headers)
        response.raise_for_status()
        tree = response.json()

        contents = []
        for item in tree["tree"]:
            if item["type"] == "blob" and item.get("size", 0) <= self.max_file_size:
                contents.append(
                    {
                        "name": item["path"].split("/")[-1],
                        "path": item["path"],
                        "sha": item["sha"],
                        "size": item.get("size", 0),
                        "type": "file",
                    }
                )

        return contents

    @lru_cache(maxsize=1000)
    def get_file_content(self, owner, repo, file_path, file_sha):
        url = f"{self.api_base_url}/repos/{owner}/{repo}/contents/{file_path}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        content = response.json()["content"]
        decoded_content = base64.b64decode(content)

        # Try to decode as UTF-8, if it fails, return as binary
        try:
            return decoded_content.decode("utf-8")
        except UnicodeDecodeError:
            return f"Binary file: {file_path} (size: {len(decoded_content)} bytes)"

    def get_repo_data(self, repo_url):
        parsed_url = urlparse(repo_url)
        path_parts = parsed_url.path.strip("/").split("/")
        owner, repo = path_parts[0], path_parts[1]

        contents = self.get_repo_contents(repo_url)

        file_contents = {}
        for file in contents:
            if file["type"] == "file":
                try:
                    content = self.get_file_content(
                        owner, repo, file["path"], file["sha"]
                    )
                    file_contents[file["path"]] = {
                        "content": content,
                        "type": (
                            "." + file["name"].split(".")[-1]
                            if "." in file["name"]
                            else ""
                        ),
                        "size": file["size"],
                    }
                except Exception as e:
                    file_contents[file["path"]] = {
                        "content": f"Error fetching file: {str(e)}",
                        "type": (
                            "." + file["name"].split(".")[-1]
                            if "." in file["name"]
                            else ""
                        ),
                        "size": file["size"],
                    }

        return file_contents

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

    def parse_github_url(self, repo_url):
        parsed_url = urlparse(repo_url)
        path_parts = parsed_url.path.strip("/").split("/")
        owner, repo = path_parts[0], path_parts[1]
        commit_hash = None
        if len(path_parts) > 4 and path_parts[2] == "tree":
            commit_hash = path_parts[4]
        return owner, repo, commit_hash

    @lru_cache(maxsize=100)
    def get_default_branch(self, owner, repo):
        url = f"{self.api_base_url}/repos/{owner}/{repo}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()["default_branch"]

    def get_repo_structure(self, repo_url, commit_hash=None):
        owner, repo, url_commit_hash = self.parse_github_url(repo_url)
        commit_hash = commit_hash or url_commit_hash

        if not commit_hash:
            default_branch = self.get_default_branch(owner, repo)
            commit_url = (
                f"{self.api_base_url}/repos/{owner}/{repo}/commits/{default_branch}"
            )
            commit_response = requests.get(commit_url, headers=self.headers)
            commit_response.raise_for_status()
            commit_hash = commit_response.json()["sha"]

        def fetch_tree(sha, path=""):
            url = f"{self.api_base_url}/repos/{owner}/{repo}/git/trees/{sha}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            tree = response.json()

            structure = []
            for item in tree["tree"]:
                if item["type"] == "tree":
                    structure.append(
                        {
                            "name": item["path"],
                            "type": "directory",
                            "children": fetch_tree(
                                item["sha"], f"{path}/{item['path']}"
                            ),
                        }
                    )
                elif (
                    item["type"] == "blob" and item.get("size", 0) <= self.max_file_size
                ):
                    structure.append(
                        {
                            "name": item["path"],
                            "type": "file",
                            "size": item.get("size", 0),
                            "path": f"{path}/{item['path']}".lstrip("/"),
                        }
                    )

            return structure

        tree_url = f"{self.api_base_url}/repos/{owner}/{repo}/git/trees/{commit_hash}"
        tree_response = requests.get(tree_url, headers=self.headers)
        tree_response.raise_for_status()
        tree_data = tree_response.json()
        tree_sha = tree_data["sha"]

        structure = fetch_tree(tree_sha)
        return structure, commit_hash

    def get_file_content(self, owner, repo, file_path, ref):
        url = f"{self.api_base_url}/repos/{owner}/{repo}/contents/{file_path}?ref={ref}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        content = response.json()["content"]
        decoded_content = base64.b64decode(content).decode("utf-8")
        return decoded_content

    def get_selected_files(
        self, repo_url, selected_paths, excluded_types, commit_hash=None
    ):
        owner, repo, url_commit_hash = self.parse_github_url(repo_url)
        commit_hash = (
            commit_hash or url_commit_hash or self.get_default_branch(owner, repo)
        )

        contents = []
        for path in selected_paths:
            if any(path.endswith(ext) for ext in excluded_types):
                continue
            try:
                content = self.get_file_content(owner, repo, path, commit_hash)
                contents.append(f"File: {path}\n\n{content}\n\n")
            except Exception as e:
                contents.append(f"Error fetching file {path}: {str(e)}\n\n")

        return "\n".join(contents)

    @lru_cache(maxsize=100)
    def get_repo_languages(self, owner, repo):
        url = f"{self.api_base_url}/repos/{owner}/{repo}/languages"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return list(response.json().keys())

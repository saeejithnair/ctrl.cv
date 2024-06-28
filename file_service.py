import requests


class FileService:
    def __init__(self, allowed_file_types):
        self.allowed_file_types = allowed_file_types

    def convert_to_single_file(self, repo_contents):
        combined_content = []

        for file in repo_contents:
            if self._is_allowed_file_type(file["name"]):
                file_content = self._get_file_content(file["download_url"])
                combined_content.append(f"File: {file['path']}\n\n{file_content}\n\n")

        return "\n".join(combined_content)

    def _is_allowed_file_type(self, filename):
        if not self.allowed_file_types:
            return True
        return any(filename.endswith(ext) for ext in self.allowed_file_types)

    def _get_file_content(self, download_url):
        response = requests.get(download_url)
        response.raise_for_status()
        return response.text

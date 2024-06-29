import requests
import os


class FileService:
    def __init__(self, include_types, exclude_types):
        self.include_types = include_types
        self.exclude_types = exclude_types

    def convert_to_single_file(self, repo_contents):
        combined_content = []

        for file in repo_contents:
            if self._should_include_file(file["name"]):
                file_content = self._get_file_content(file["download_url"])
                combined_content.append(f"File: {file['path']}\n\n{file_content}\n\n")

        return "\n".join(combined_content)

    def _should_include_file(self, filename):
        file_extension = os.path.splitext(filename)[1]

        if self.include_types:
            return file_extension in self.include_types
        elif self.exclude_types:
            return file_extension not in self.exclude_types
        else:
            return True  # Include all if no types specified

    def _get_file_content(self, download_url):
        response = requests.get(download_url)
        response.raise_for_status()
        return response.text

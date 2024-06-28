from flask import Flask, request, jsonify
from flask_cors import CORS
from github_service import GitHubService
from file_service import FileService
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


@app.route("/")
def home():
    return "Welcome to ctrl.cv API"


@app.route("/api/convert", methods=["POST", "OPTIONS"])
def convert_repo():
    if request.method == "OPTIONS":
        return "", 200

    data = request.json
    repo_url = data.get("repo_url")
    file_types = data.get("file_types", [])

    if not repo_url:
        return jsonify({"error": "Repository URL is required"}), 400

    try:
        github_service = GitHubService(os.getenv("GITHUB_TOKEN"))
        repo_contents = github_service.get_repo_contents(repo_url)

        file_service = FileService(file_types)
        converted_content = file_service.convert_to_single_file(repo_contents)

        return jsonify({"content": converted_content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

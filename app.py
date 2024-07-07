from flask import Flask, request, jsonify
from flask_cors import CORS
from github_service import GitHubService
import os
from dotenv import load_dotenv

load_dotenv()
env = os.getenv("ENV", "production")
load_dotenv(f".env.{env}")

app = Flask(__name__)
cors_origins = os.getenv("CORS_ORIGINS", "*")
CORS(app, resources={r"/api/*": {"origins": cors_origins}})

github_service = GitHubService(os.getenv("GITHUB_TOKEN"))


@app.route("/api/fetch_repo_structure", methods=["POST"])
def fetch_repo_structure():
    data = request.json
    repo_url = data.get("repo_url")

    if not repo_url:
        return jsonify({"error": "Repository URL is required"}), 400

    try:
        structure, commit_hash = github_service.get_repo_structure(repo_url)
        return jsonify({"structure": structure, "commit_hash": commit_hash})
    except Exception as e:
        return jsonify({"error": f"Error fetching repository structure: {str(e)}"}), 500


@app.route("/api/fetch_selected_files", methods=["POST"])
def fetch_selected_files():
    data = request.json
    repo_url = data.get("repo_url")
    selected_paths = data.get("selected_paths")
    excluded_types = data.get("excluded_types", [])

    if not repo_url or not selected_paths:
        return jsonify({"error": "Repository URL and selected paths are required"}), 400

    try:
        content = github_service.get_selected_files(
            repo_url, selected_paths, excluded_types
        )
        return jsonify({"content": content})
    except Exception as e:
        return jsonify({"error": f"Error fetching selected files: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("BACKEND_PORT", 5001))
    app.run(host="0.0.0.0", port=port)

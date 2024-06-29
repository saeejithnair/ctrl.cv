from flask import Flask, request, jsonify
from flask_cors import CORS
from github_service import GitHubService
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

github_service = GitHubService(os.getenv("GITHUB_TOKEN"))


@app.route("/api/fetch_repo", methods=["POST"])
def fetch_repo():
    data = request.json
    repo_url = data.get("repo_url")

    if not repo_url:
        return jsonify({"error": "Repository URL is required"}), 400

    try:
        file_contents = github_service.get_repo_data(repo_url)
        return jsonify({"files": file_contents})
    except Exception as e:
        return jsonify({"error": f"Error fetching repository: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

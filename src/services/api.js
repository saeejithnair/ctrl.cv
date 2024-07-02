import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchRepo = async (repoUrl) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/fetch_repo`, {
            repo_url: repoUrl
        });
        return {
            files: response.data.files,
            commitHash: response.data.commit_hash
        };
    } catch (error) {
        throw new Error(error.response?.data?.error || 'An error occurred while fetching the repository');
    }
};
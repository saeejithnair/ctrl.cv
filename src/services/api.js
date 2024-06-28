import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const convertRepo = async (repoUrl, fileTypes) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/convert`, {
            repo_url: repoUrl,
            file_types: fileTypes
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'An error occurred while converting the repository');
    }
};
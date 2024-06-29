import axios from 'axios';

const API_BASE_URL = 'https://ctrl-cv-5853f5fee6a3.herokuapp.com/api';

export const fetchRepo = async (repoUrl) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/fetch_repo`, {
            repo_url: repoUrl
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'An error occurred while fetching the repository');
    }
};

// Keep the old convertRepo function for backwards compatibility if needed
export const convertRepo = async (repoUrl, fileTypes) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/convert`, {
            repo_url: repoUrl,
            file_types: fileTypes
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'An error occurred while converting the repository');
    }
};

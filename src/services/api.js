import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchRepoStructure = async (repoUrl, commitHash) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/fetch_repo_structure`, {
            repo_url: repoUrl,
            commit_hash: commitHash
        });
        return {
            structure: response.data.structure,
            commitHash: response.data.commit_hash
        };
    } catch (error) {
        throw new Error(error.response?.data?.error || 'An error occurred while fetching the repository structure');
    }
};

export const fetchSelectedFiles = async (repoUrl, selectedPaths, excludedTypes, commitHash) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/fetch_selected_files`, {
            repo_url: repoUrl,
            selected_paths: selectedPaths,
            excluded_types: excludedTypes,
            commit_hash: commitHash
        });
        return response.data.content;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'An error occurred while fetching the selected files');
    }
};
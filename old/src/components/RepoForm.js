import React from 'react';

const RepoForm = ({ repoUrl, setRepoUrl, onSubmit }) => (
    <form onSubmit={onSubmit} className="form">
        <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Enter GitHub repository URL"
            className="input"
            required
        />
        <button type="submit" className="button">Convert</button>
    </form>
);

export default RepoForm;
import React, { useState } from 'react';
import Logo from './components/Logo';
import RepoForm from './components/RepoForm';
import FileTypeSelector from './components/FileTypeSelector';
import { convertRepo } from './services/api';
import './App.css';

const App = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [fileTypes, setFileTypes] = useState([]);
    const [convertedContent, setConvertedContent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setConvertedContent('');
        setLoading(true);

        try {
            const response = await convertRepo(repoUrl, fileTypes);
            setConvertedContent(response.content);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <Logo width={80} height={80} />
                <h1 className="title">ctrl.cv</h1>
                <p className="tagline">Copy repos, paste knowledge</p>
            </header>
            <main>
                <RepoForm repoUrl={repoUrl} setRepoUrl={setRepoUrl} onSubmit={handleSubmit} />
                <FileTypeSelector fileTypes={fileTypes} setFileTypes={setFileTypes} />
                {loading && <p className="loading">Converting repository...</p>}
                {error && <p className="error">{error}</p>}
                {convertedContent && (
                    <div className="result">
                        <h2>Converted Content:</h2>
                        <pre className="content">{convertedContent}</pre>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
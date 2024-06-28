import React, { useState, useCallback } from 'react';
import { Container, Typography, TextField, Button, Box, LinearProgress, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileTypeSelector from './components/FileTypeSelector';
import { fetchRepo } from './services/api';

const App = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [fileTypes, setFileTypes] = useState({ includeTypes: [], excludeTypes: [] });
    const [allFiles, setAllFiles] = useState(null);
    const [filteredContent, setFilteredContent] = useState('');
    const [error, setError] = useState('');
    const [loadingStatus, setLoadingStatus] = useState('');
    const [showCopyNotification, setShowCopyNotification] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFilteredContent('');
        setAllFiles(null);
        setLoadingStatus('Fetching repository contents...');

        try {
            const response = await fetchRepo(repoUrl);
            setAllFiles(response.files);
            setLoadingStatus('Repository fetched. Apply filters to view content.');
        } catch (err) {
            setError(err.message || "An unknown error occurred");
            setLoadingStatus('');
        }
    };

    const applyFilters = useCallback(() => {
        if (!allFiles) return;

        setLoadingStatus('Applying filters...');
        const filteredFiles = Object.entries(allFiles).filter(([path, file]) => {
            if (fileTypes.includeTypes.length > 0) {
                return fileTypes.includeTypes.includes(file.type);
            }
            return !fileTypes.excludeTypes.includes(file.type);
        });

        const content = filteredFiles.map(([path, file]) => `File: ${path}\n\n${file.content}\n\n`).join('\n');
        setFilteredContent(content);
        setLoadingStatus('');
    }, [allFiles, fileTypes]);

    React.useEffect(() => {
        if (allFiles) {
            applyFilters();
        }
    }, [fileTypes, allFiles, applyFilters]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(filteredContent).then(() => {
            setShowCopyNotification(true);
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    ctrl.cv
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                    Copy repos, paste knowledge
                </Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="Enter GitHub repository URL"
                    variant="outlined"
                    sx={{ mb: 2 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={loadingStatus !== ''}
                >
                    Fetch Repository
                </Button>
            </Box>
            {loadingStatus && (
                <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>{loadingStatus}</Typography>
                </Box>
            )}
            {allFiles && (
                <FileTypeSelector
                    onSelectionChange={setFileTypes}
                    availableTypes={[...new Set(Object.values(allFiles).map(file => file.type))]}
                />
            )}
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    Error: {error}
                </Typography>
            )}
            {filteredContent && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Filtered Content:</Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopyToClipboard}
                        >
                            Copy to Clipboard
                        </Button>
                    </Box>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '500px', overflow: 'auto', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
                        {filteredContent}
                    </pre>
                </Box>
            )}
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={showCopyNotification}
                onClose={() => setShowCopyNotification(false)}
                message="Content copied to clipboard!"
                autoHideDuration={3000}
            />
        </Container>
    );
};

export default App;
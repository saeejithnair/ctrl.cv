import React, { useState, useCallback, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, LinearProgress, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileTypeSelector from './components/FileTypeSelector';
import FileTree from './components/FileTree';
import { fetchRepoStructure, fetchSelectedFiles } from './services/api';

const Logo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" style={{ width: '200px', height: 'auto' }}>
        <style>
            {`
        .text { font-family: Arial, sans-serif; font-weight: bold; }
        .ctrl { fill: #0066cc; }
        .cv { fill: #3399ff; }
        .clipboard { fill: #ffffff; stroke: #0066cc; stroke-width: 3; }
        .plus { fill: none; stroke: #0066cc; stroke-width: 3; stroke-linecap: round; }
      `}
        </style>
        <rect className="clipboard" x="130" y="28" width="40" height="54" rx="4" />
        <rect className="clipboard" x="138" y="20" width="24" height="16" rx="3" />
        <line className="plus" x1="150" y1="42" x2="150" y2="68" />
        <line className="plus" x1="137" y1="55" x2="163" y2="55" />
        <text x="15" y="70" className="text ctrl" fontSize="60">ctrl</text>
        <text x="185" y="70" className="text cv" fontSize="60">cv</text>
    </svg>
);

const App = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [fileTypes, setFileTypes] = useState({ includeTypes: [], excludeTypes: [] });
    const [repoStructure, setRepoStructure] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [filteredContent, setFilteredContent] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCopyNotification, setShowCopyNotification] = useState(false);
    const [commitHash, setCommitHash] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await fetchRepoStructure(repoUrl);
            setRepoStructure(data.structure);
            setCommitHash(data.commitHash);
            // Initialize all files as unchecked
            const initialSelectedFiles = {};
            const initializeUnchecked = (node, path = '') => {
                const currentPath = path ? `${path}/${node.name}` : node.name;
                if (node.type === 'file') {
                    initialSelectedFiles[currentPath] = false;
                } else if (node.type === 'directory') {
                    node.children.forEach(child => initializeUnchecked(child, currentPath));
                }
            };
            data.structure.forEach(node => initializeUnchecked(node));
            setSelectedFiles(initialSelectedFiles);
        } catch (err) {
            setError(err.message || "An error occurred while fetching the repository structure");
            setRepoStructure(null);
            setCommitHash('');
            setFilteredContent('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = useCallback((path, isSelected, isDirectory) => {
        setSelectedFiles(prev => {
            const newSelected = { ...prev };
            const updateChildren = (currentPath, select) => {
                Object.keys(newSelected).forEach(key => {
                    if (key.startsWith(currentPath + '/')) {
                        newSelected[key] = select;
                    }
                });
            };

            if (isDirectory) {
                updateChildren(path, isSelected);
            }
            newSelected[path] = isSelected;

            return newSelected;
        });
    }, []);

    const handleFetchSelectedFiles = async () => {
        setIsLoading(true);
        try {
            const selectedPaths = Object.keys(selectedFiles).filter(path => selectedFiles[path]);
            const content = await fetchSelectedFiles(repoUrl, selectedPaths, fileTypes.excludeTypes);
            setFilteredContent(content);
        } catch (err) {
            setError(err.message || "An error occurred while fetching the selected files");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(filteredContent).then(() => {
            setShowCopyNotification(true);
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    const getAvailableFileTypes = useCallback((structure) => {
        const types = new Set();
        const traverse = (node) => {
            if (node.type === 'file') {
                const extension = `.${node.name.split('.').pop()}`;
                types.add(extension);
            } else if (node.type === 'directory') {
                node.children.forEach(traverse);
            }
        };
        structure.forEach(traverse);
        return Array.from(types);
    }, []);

    const updateSelectedFilesBasedOnTypes = useCallback(() => {
        if (!repoStructure) return;

        setSelectedFiles(prev => {
            const newSelectedFiles = { ...prev };
            const traverse = (node, path = '') => {
                const currentPath = path ? `${path}/${node.name}` : node.name;
                if (node.type === 'file') {
                    const extension = `.${node.name.split('.').pop()}`;
                    const shouldBeSelected = fileTypes.includeTypes.length === 0 || fileTypes.includeTypes.includes(extension);
                    const shouldBeExcluded = fileTypes.excludeTypes.includes(extension);
                    newSelectedFiles[currentPath] = shouldBeSelected && !shouldBeExcluded;
                } else if (node.type === 'directory') {
                    node.children.forEach(child => traverse(child, currentPath));
                }
            };

            repoStructure.forEach(node => traverse(node));
            return newSelectedFiles;
        });
    }, [repoStructure, fileTypes]);

    useEffect(() => {
        updateSelectedFilesBasedOnTypes();
    }, [fileTypes, updateSelectedFilesBasedOnTypes]);

    return (
        <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', my: 4 }}>
                <Logo />
                <Typography variant="h5" component="h2" gutterBottom>
                    copy paste url. concatenate repo into a single file. copy paste into llm.
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
                    disabled={isLoading}
                >
                    {isLoading ? 'Fetching...' : 'Fetch Repository Structure'}
                </Button>
            </Box>

            {isLoading && (
                <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        {filteredContent ? 'Fetching selected files...' : 'Fetching repository structure...'}
                    </Typography>
                </Box>
            )}

            {commitHash && (
                <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                    Commit Hash: {commitHash}
                </Typography>
            )}

            {repoStructure && (
                <>
                    <FileTypeSelector
                        onSelectionChange={setFileTypes}
                        availableTypes={getAvailableFileTypes(repoStructure)}
                    />
                    <FileTree
                        files={repoStructure}
                        selectedFiles={selectedFiles}
                        onFileSelect={handleFileSelect}
                        excludedTypes={fileTypes.excludeTypes}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFetchSelectedFiles}
                        sx={{ mt: 2 }}
                        disabled={isLoading || Object.keys(selectedFiles).filter(key => selectedFiles[key]).length === 0}
                    >
                        Fetch Selected Files
                    </Button>
                </>
            )}

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    Error: {error}
                </Typography>
            )}

            {filteredContent && (
                <Box sx={{ mt: 4 }}>
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
import React, { useState, useEffect } from 'react';
import { Chip, TextField, Button, Typography, Box, Switch, FormControlLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const FileTypeSelector = ({ onSelectionChange, availableTypes }) => {
    const [includeTypes, setIncludeTypes] = useState([]);
    const [excludeTypes, setExcludeTypes] = useState([]);
    const [customType, setCustomType] = useState('');
    const [addToInclude, setAddToInclude] = useState(true);

    useEffect(() => {
        onSelectionChange({ includeTypes, excludeTypes });
    }, [includeTypes, excludeTypes, onSelectionChange]);

    const handleTypeToggle = (type) => {
        if (includeTypes.includes(type)) {
            setIncludeTypes(prev => prev.filter(t => t !== type));
            setExcludeTypes(prev => [...prev, type]);
        } else if (excludeTypes.includes(type)) {
            setExcludeTypes(prev => prev.filter(t => t !== type));
        } else {
            setIncludeTypes(prev => [...prev, type]);
        }
    };

    const handleCustomTypeAdd = () => {
        if (customType && !availableTypes.includes(customType)) {
            const formattedType = customType.startsWith('.') ? customType : `.${customType}`;
            if (addToInclude) {
                setIncludeTypes(prev => [...prev, formattedType]);
            } else {
                setExcludeTypes(prev => [...prev, formattedType]);
            }
            setCustomType('');
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>File Type Selection</Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TextField
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Add custom file type (e.g., .cfg)"
                    size="small"
                    sx={{ mr: 1, flexGrow: 1 }}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={addToInclude}
                            onChange={(e) => setAddToInclude(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={addToInclude ? "Add to Include" : "Add to Exclude"}
                    sx={{ mr: 1 }}
                />
                <Button variant="contained" onClick={handleCustomTypeAdd} startIcon={<AddIcon />}>
                    Add
                </Button>
            </Box>
            <Typography variant="subtitle1" gutterBottom>Available File Types:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {availableTypes.map(type => (
                    <Chip
                        key={type}
                        label={type}
                        onClick={() => handleTypeToggle(type)}
                        color={includeTypes.includes(type) ? "primary" : excludeTypes.includes(type) ? "secondary" : "default"}
                    />
                ))}
            </Box>
            <Typography variant="subtitle1" gutterBottom>Included Types:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {includeTypes.map(type => (
                    <Chip key={type} label={type} onDelete={() => handleTypeToggle(type)} color="primary" />
                ))}
                {includeTypes.length === 0 && <Typography variant="body2" color="text.secondary">No types included</Typography>}
            </Box>
            <Typography variant="subtitle1" gutterBottom>Excluded Types:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {excludeTypes.map(type => (
                    <Chip key={type} label={type} onDelete={() => handleTypeToggle(type)} color="secondary" />
                ))}
                {excludeTypes.length === 0 && <Typography variant="body2" color="text.secondary">No types excluded</Typography>}
            </Box>
        </Box>
    );
};

export default FileTypeSelector;
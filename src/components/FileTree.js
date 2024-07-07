import React, { useState, useEffect } from 'react';
import { Checkbox, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore, Folder, InsertDriveFile } from '@mui/icons-material';

const FileTree = ({ files, selectedFiles, onFileSelect, excludedTypes }) => {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (path) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const getFileExtension = (filename) => {
        return `.${filename.split('.').pop()}`;
    };

    const isSelected = (path, isDirectory) => {
        if (isDirectory) {
            return Object.entries(selectedFiles)
                .some(([filePath, isSelected]) => filePath.startsWith(path) && isSelected);
        }
        return selectedFiles[path] || false;
    };

    const isExcluded = (path, isDirectory) => {
        if (isDirectory) return false;
        const fileExtension = getFileExtension(path);
        return excludedTypes.includes(fileExtension);
    };

    const handleSelect = (path, isDirectory) => {
        const newSelectedState = !isSelected(path, isDirectory);
        onFileSelect(path, newSelectedState, isDirectory);
    };

    const renderTree = (node, path = '', level = 0) => {
        const currentPath = path ? `${path}/${node.name}` : node.name;
        const isDirectory = node.type === 'directory';
        const excluded = isExcluded(currentPath, isDirectory);

        const listItemStyle = {
            paddingLeft: `${level * 16}px`,
        };

        if (isDirectory) {
            return (
                <React.Fragment key={currentPath}>
                    <ListItem button onClick={() => toggleExpand(currentPath)} style={listItemStyle}>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={isSelected(currentPath, true)}
                                indeterminate={
                                    isSelected(currentPath, true) &&
                                    !node.children.every(child => isSelected(`${currentPath}/${child.name}`, child.type === 'directory'))
                                }
                                onChange={() => handleSelect(currentPath, true)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </ListItemIcon>
                        <ListItemIcon>
                            <Folder />
                        </ListItemIcon>
                        <ListItemText primary={node.name} />
                        {expanded[currentPath] ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={expanded[currentPath]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {node.children.map(childNode => renderTree(childNode, currentPath, level + 1))}
                        </List>
                    </Collapse>
                </React.Fragment>
            );
        } else {
            return (
                <ListItem key={currentPath} style={listItemStyle}>
                    <ListItemIcon>
                        <Checkbox
                            edge="start"
                            checked={isSelected(currentPath, false)}
                            onChange={() => handleSelect(currentPath, false)}
                            disabled={excluded}
                        />
                    </ListItemIcon>
                    <ListItemIcon>
                        <InsertDriveFile />
                    </ListItemIcon>
                    <ListItemText primary={node.name} />
                </ListItem>
            );
        }
    };

    return (
        <List>
            {files.map(file => renderTree(file))}
        </List>
    );
};

export default FileTree;
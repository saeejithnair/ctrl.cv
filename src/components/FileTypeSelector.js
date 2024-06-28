import React from 'react';

const FileTypeSelector = ({ fileTypes, setFileTypes }) => {
    const handleChange = (e) => {
        const value = e.target.value;
        setFileTypes(prevTypes =>
            prevTypes.includes(value)
                ? prevTypes.filter(type => type !== value)
                : [...prevTypes, value]
        );
    };

    return (
        <div className="file-type-selector">
            <h3>Select file types to include:</h3>
            <label>
                <input type="checkbox" value=".py" onChange={handleChange} checked={fileTypes.includes('.py')} />
                Python (.py)
            </label>
            <label>
                <input type="checkbox" value=".js" onChange={handleChange} checked={fileTypes.includes('.js')} />
                JavaScript (.js)
            </label>
            <label>
                <input type="checkbox" value=".md" onChange={handleChange} checked={fileTypes.includes('.md')} />
                Markdown (.md)
            </label>
            <label>
                <input type="checkbox" value=".txt" onChange={handleChange} checked={fileTypes.includes('.txt')} />
                Text (.txt)
            </label>
        </div>
    );
};

export default FileTypeSelector;
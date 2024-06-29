import { useState, useEffect } from "react";

interface FilteredContentProps {
    repository: {
        files: {
            path: string;
            content: string;
            type: string;
        }[];
    };
    fileTypes: {
        includeTypes: string[];
        excludeTypes: string[];
    };
}

export default function FilteredContent({ repository, fileTypes }: FilteredContentProps) {
    const [filteredContent, setFilteredContent] = useState("");

    useEffect(() => {
        const filteredFiles = repository.files.filter((file) => {
            if (fileTypes.includeTypes.length > 0) {
                return fileTypes.includeTypes.includes(file.type);
            }
            return !fileTypes.excludeTypes.includes(file.type);
        });

        const content = filteredFiles
            .map((file) => `File: ${file.path}\n\n${file.content}\n\n`)
            .join("\n");

        setFilteredContent(content);
    }, [repository, fileTypes]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(filteredContent).then(
            () => alert("Content copied to clipboard!"),
            (err) => console.error("Could not copy text: ", err)
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Filtered Content:</h2>
                <button
                    onClick={handleCopyToClipboard}
                    className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                    COPY TO CLIPBOARD
                </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {filteredContent}
            </pre>
        </div>
    );
}
import { useState } from "react";

interface FileTypeSelectorProps {
    availableTypes: string[];
    onSelectionChange: (selection: { includeTypes: string[]; excludeTypes: string[] }) => void;
}

export default function FileTypeSelector({ availableTypes, onSelectionChange }: FileTypeSelectorProps) {
    const [includeTypes, setIncludeTypes] = useState<string[]>([]);
    const [excludeTypes, setExcludeTypes] = useState<string[]>([]);
    const [customType, setCustomType] = useState("");
    const [addToInclude, setAddToInclude] = useState(true);

    const handleTypeToggle = (type: string) => {
        if (includeTypes.includes(type)) {
            setIncludeTypes(includeTypes.filter(t => t !== type));
            setExcludeTypes([...excludeTypes, type]);
        } else if (excludeTypes.includes(type)) {
            setExcludeTypes(excludeTypes.filter(t => t !== type));
        } else {
            setIncludeTypes([...includeTypes, type]);
        }
        onSelectionChange({ includeTypes, excludeTypes });
    };

    const handleCustomTypeAdd = () => {
        if (customType && !availableTypes.includes(customType)) {
            if (addToInclude) {
                setIncludeTypes([...includeTypes, customType]);
            } else {
                setExcludeTypes([...excludeTypes, customType]);
            }
            setCustomType("");
            onSelectionChange({ includeTypes, excludeTypes });
        }
    };

    return (
        <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">File Type Selection</h2>
            <div className="flex mb-2">
                <input
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Add custom file type (e.g., .cfg)"
                    className="flex-grow p-2 border rounded-l"
                />
                <button
                    onClick={() => setAddToInclude(!addToInclude)}
                    className={`p-2 ${addToInclude ? 'bg-blue-500' : 'bg-red-500'} text-white`}
                >
                    {addToInclude ? "Add to Include" : "Add to Exclude"}
                </button>
                <button onClick={handleCustomTypeAdd} className="p-2 bg-green-500 text-white rounded-r">
                    ADD
                </button>
            </div>
            <div>
                <h3 className="font-bold">Available File Types:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {availableTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => handleTypeToggle(type)}
                            className={`px-2 py-1 rounded ${includeTypes.includes(type)
                                ? 'bg-blue-500 text-white'
                                : excludeTypes.includes(type)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mt-4">
                <h3 className="font-bold">Included Types:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {includeTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => handleTypeToggle(type)}
                            className="px-2 py-1 bg-blue-500 text-white rounded"
                        >
                            {type} ✕
                        </button>
                    ))}
                </div>
            </div>
            <div className="mt-4">
                <h3 className="font-bold">Excluded Types:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {excludeTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => handleTypeToggle(type)}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                            {type} ✕
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
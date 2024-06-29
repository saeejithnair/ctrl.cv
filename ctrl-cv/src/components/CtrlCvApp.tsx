'use client';

import { useState } from "react";
import { api } from "~/utils/api";
import RepoForm from "./RepoForm";
import FileTypeSelector from "./FileTypeSelector";
import FilteredContent from "./FilteredContent";

export default function CtrlCvApp() {
    const [repoUrl, setRepoUrl] = useState("");
    const [fileTypes, setFileTypes] = useState({ includeTypes: [], excludeTypes: [] });
    const fetchRepoMutation = api.repository.fetchRepo.useMutation();

    const handleSubmit = async (url: string) => {
        setRepoUrl(url);
        await fetchRepoMutation.mutateAsync({ repoUrl: url });
    };

    const availableTypes = fetchRepoMutation.data
        ? [...new Set(fetchRepoMutation.data.files.map((file) => file.type))]
        : [];

    return (
        <>
            <RepoForm onSubmit={handleSubmit} />
            {fetchRepoMutation.isLoading && <p className="text-center mt-4">Loading repository contents...</p>}
            {fetchRepoMutation.isError && (
                <p className="text-center text-red-500 mt-4">Error: {fetchRepoMutation.error.message}</p>
            )}
            {fetchRepoMutation.isSuccess && (
                <>
                    <FileTypeSelector
                        availableTypes={availableTypes}
                        onSelectionChange={setFileTypes}
                    />
                    <FilteredContent repository={fetchRepoMutation.data} fileTypes={fileTypes} />
                </>
            )}
        </>
    );
}
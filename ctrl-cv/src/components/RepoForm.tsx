interface RepoFormProps {
    onSubmit: (repoUrl: string) => void;
}

export default function RepoForm({ onSubmit }: RepoFormProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const url = new FormData(form).get("repoUrl") as string;
        onSubmit(url);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <input
                type="text"
                name="repoUrl"
                placeholder="https://github.com/username/repo"
                className="w-full p-2 border rounded mb-2"
                required
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                FETCH REPOSITORY
            </button>
        </form>
    );
}
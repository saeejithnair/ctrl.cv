import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function fetchRepositoryContents(repoUrl: string) {
    const [owner, repo] = repoUrl.split('/').slice(-2);

    const response = await octokit.repos.getContent({
        owner,
        repo,
        path: '',
    });

    const files = await Promise.all(
        response.data.map(async (item: any) => {
            if (item.type === 'file') {
                const fileContent = await octokit.repos.getContent({
                    owner,
                    repo,
                    path: item.path,
                });
                return {
                    path: item.path,
                    content: Buffer.from(fileContent.data.content, 'base64').toString('utf-8'),
                    type: `.${item.name.split('.').pop()}`,
                    size: item.size,
                };
            }
            return null;
        })
    );

    return files.filter((file): file is NonNullable<typeof file> => file !== null);
}
import axios from 'axios';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

const getRepoStructureQuery = `
query ($owner: String!, $name: String!, $expression: String!) {
  repository(owner: $owner, name: $name) {
    object(expression: $expression) {
      ... on Tree {
        entries {
          name
          type
          object {
            ... on Blob {
              byteSize
            }
            ... on Tree {
              entries {
                name
                type
                object {
                  ... on Blob {
                    byteSize
                  }
                  ... on Tree {
                    entries {
                      name
                      type
                      object {
                        ... on Blob {
                          byteSize
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    defaultBranchRef {
      name
      target {
        oid
      }
    }
  }
}
`;

export const fetchRepoStructure = async (repoUrl) => {
    const [owner, name] = repoUrl.split('/').slice(-2);

    try {
        const response = await axios.post(
            GITHUB_GRAPHQL_URL,
            {
                query: getRepoStructureQuery,
                variables: { owner, name, expression: "HEAD:" }
            },
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                },
            }
        );

        const { data } = response.data;
        const commitHash = data.repository.defaultBranchRef.target.oid;
        const structure = processEntries(data.repository.object.entries);

        return { structure, commitHash };
    } catch (error) {
        console.error('Error fetching repo structure:', error);
        throw new Error('Failed to fetch repository structure');
    }
};

const processEntries = (entries, path = '') => {
    return entries.map(entry => {
        const newPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.type === 'tree') {
            return {
                name: entry.name,
                type: 'directory',
                path: newPath,
                children: entry.object.entries ? processEntries(entry.object.entries, newPath) : []
            };
        } else {
            return {
                name: entry.name,
                type: 'file',
                path: newPath,
                size: entry.object.byteSize
            };
        }
    });
};

export const fetchSelectedFiles = async (repoUrl, selectedPaths, excludedTypes) => {
    const [owner, repo] = repoUrl.split('/').slice(-2);

    const fetchFile = async (path) => {
        try {
            const response = await axios.get(
                `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        Accept: 'application/vnd.github.v3.raw'
                    }
                }
            );
            return { path, content: response.data };
        } catch (error) {
            console.error(`Error fetching file ${path}:`, error);
            return { path, content: `Error: Could not fetch file ${path}` };
        }
    };

    const filteredPaths = selectedPaths.filter(path => {
        const extension = `.${path.split('.').pop()}`;
        return !excludedTypes.includes(extension);
    });

    const fileContents = await Promise.all(filteredPaths.map(fetchFile));
    return fileContents.reduce((acc, { path, content }) => {
        acc[path] = content;
        return acc;
    }, {});
};
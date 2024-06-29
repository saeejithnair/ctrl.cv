import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchRepositoryContents } from "~/server/github/githubService";

export const repositoryRouter = createTRPCRouter({
    fetchRepo: publicProcedure
        .input(z.object({ repoUrl: z.string().url() }))
        .mutation(async ({ input }) => {
            const repoContents = await fetchRepositoryContents(input.repoUrl);
            return { files: repoContents };
        }),
});
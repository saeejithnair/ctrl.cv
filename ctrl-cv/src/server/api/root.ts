import { createTRPCRouter } from "~/server/api/trpc";
import { repositoryRouter } from "~/server/api/routers/repository";

export const appRouter = createTRPCRouter({
  repository: repositoryRouter,
});

export type AppRouter = typeof appRouter;
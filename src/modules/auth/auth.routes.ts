import { FastifyInstance } from "fastify";
import { registerHandler, loginHandler, googleOAuthHandler, logoutHandler } from "./auth.controller";
import { registerJsonSchema, loginJsonSchema } from "./auth.schema";

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    "/auth/register",
    {
      schema: {
        body: registerJsonSchema,
        tags: ["auth"],
        summary: "Register a new user",
        description: "Create a new user account with email and password",
      },
    },
    registerHandler
  );

  fastify.post(
    "/auth/login",
    {
      schema: {
        body: loginJsonSchema,
        tags: ["auth"],
        summary: "Login user",
        description: "Authenticate user with email and password",
      },
    },
    loginHandler
  );

  fastify.get(
    "/auth/google/callback",
    {
      schema: {
        tags: ["auth"],
        summary: "Google OAuth callback",
        description: "Handle Google OAuth callback and authenticate user",
      },
    },
    googleOAuthHandler
  );

  fastify.post(
    "/auth/logout",
    {
      schema: {
        tags: ["auth"],
        summary: "Logout user",
        description: "Clear authentication token",
      },
    },
    logoutHandler
  );
};

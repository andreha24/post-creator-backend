import { FastifyInstance } from "fastify";
import { registerHandler, loginHandler, googleOAuthHandler, logoutHandler } from "./auth.controller";
import { registerJsonSchema, loginJsonSchema } from "./auth.schema";

export const authRoutes = async (fastify: FastifyInstance) => {
  // Register route
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

  // Login route
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

  // Google OAuth routes
  // Note: The /google route is automatically handled by the OAuth2 plugin via startRedirectPath in server.ts
  // Users should navigate to /auth/google to start the OAuth flow

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

  // Logout route
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

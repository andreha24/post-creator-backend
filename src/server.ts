import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { swaggerConfig } from "./config/swagger";
import { userRoutes } from "./modules/user/user.route";
import { postRoutes } from "./modules/post/post.route";
import { authRoutes } from "./modules/auth/auth.routes";
import cookie from "@fastify/cookie";
import oauthPlugin from "@fastify/oauth2";
import { env } from "prisma/config";

const fastify = Fastify({ logger: true });

async function main() {
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(cookie, {
    secret: env("JWT_SECRET"),
  });

  // Validate OAuth credentials
  // const backendUrl = env("BACKEND_URL") || "http://localhost:5000";

  const backendUrl = env("BACKEND_URL") || "http://localhost:5000";

  await fastify.register(oauthPlugin, {
    name: "googleOAuth2",
    credentials: {
      client: {
        id: go,
        secret: goo,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/auth/google",
    callbackUri: `${backendUrl}/auth/google/callback`,
    scope: ["profile", "email"],
  });

  await fastify.register(swaggerConfig);

  fastify.register(userRoutes, { prefix: "/api/user" });
  fastify.register(postRoutes, { prefix: "/api/posts" });
  fastify.register(authRoutes);

  try {
    await fastify.listen({
      port: 5000,
      host: "0.0.0.0",
    });
    console.log(`🚀 Server ready at: http://localhost:5000`);
    console.log(`📘 Swagger docs: http://localhost:5000/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();

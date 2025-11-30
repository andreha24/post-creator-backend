import Fastify from "fastify";
import cors from "@fastify/cors";
import { swaggerConfig } from "./config/swagger";
import { userRoutes } from "./modules/user/user.route";
import { postRoutes } from "./modules/post/post.route";
import fastifyStatic from "@fastify/static";
import { join } from "path";

const fastify = Fastify({ logger: true });

async function main() {
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  fastify.register(fastifyStatic, {
    root: join(process.cwd(), "public", "uploads"),
    prefix: "/uploads/",
  });

  await fastify.register(swaggerConfig);

  fastify.register(userRoutes, { prefix: "/api/users" });
  fastify.register(postRoutes, { prefix: "/api/posts" });

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

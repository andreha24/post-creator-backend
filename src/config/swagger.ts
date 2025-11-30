import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export const swaggerConfig = async (fastify: FastifyInstance) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "My API",
        description: "API documentation for my Fastify server",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:5000",
          description: "Local server",
        },
      ],
      tags: [{ name: "users", description: "User related endpoints" }],
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
      tryItOutEnabled: true,
      filter: true,
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
  });
};

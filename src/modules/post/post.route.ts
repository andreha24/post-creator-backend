import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createPostHandler } from "./post.contoller";

export const postRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/", createPostHandler);
};

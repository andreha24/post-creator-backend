import { FastifyInstance } from "fastify";
import {
  createPostHandler,
  getPostsHandler,
  getPostHandler,
  updatePostHandler,
  deletePostHandler,
} from "./post.contoller";

export const postRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/", createPostHandler);

  fastify.get("/", getPostsHandler);
  fastify.get("/:id", getPostHandler);
  fastify.patch("/:id", updatePostHandler);
  fastify.delete("/:id", deletePostHandler);
};

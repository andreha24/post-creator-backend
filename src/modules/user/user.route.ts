import { FastifyInstance } from "fastify";
import { getUserHandler } from "./user.controller";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/", getUserHandler);
};

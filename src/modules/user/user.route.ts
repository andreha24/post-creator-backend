import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { registerUserHandler } from "./user.controller";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/", registerUserHandler);
};

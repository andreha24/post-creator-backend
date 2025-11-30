import { FastifyReply, FastifyRequest } from "fastify";
import { createUser } from "./user.service";
import { RegisterUserInput } from "./user.schema";

export const registerUserHandler = async (
  request: FastifyRequest<{
    Body: RegisterUserInput;
  }>,
  reply: FastifyReply
) => {
  const body = request.body;

  try {
    const user = await createUser(body);

    return reply.code(201).send(user);
  } catch (error) {
    console.log(error);
    return reply.code(500).send(error);
  }
};

import { FastifyReply, FastifyRequest } from "fastify";
import { createPost } from "./post.service";
import { CreatePostInput } from "./post.schema";

export const createPostHandler = async (
  request: FastifyRequest<{
    Body: CreatePostInput;
  }>,
  reply: FastifyReply
) => {
  const body = request.body;

  try {
    const post = await createPost(body);

    return reply.code(201).send(post);
  } catch (error) {
    console.log(error);
    return reply.code(500).send(error);
  }
};

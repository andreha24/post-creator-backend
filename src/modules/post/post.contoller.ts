import { FastifyReply, FastifyRequest } from "fastify";
import { getPosts, getPostById, updatePost, deletePost } from "./post.service";
import { createPost } from "./post.service";
import { verifyToken } from "../../utils/jwt";

export const createPostHandler = async (
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply,
) => {
  try {
    const token = request.cookies.token!;

    if (!token) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const { userId } = verifyToken(token);

    const post = await createPost({
      ...(request.body as any),
      userId,
    });
    return reply.code(201).send(post);
  } catch (error) {
    return reply.code(500).send({ message: "Failed to create post" });
  }
};

export const getPostsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const token = request.cookies.token;

    if (!token) {
      return reply
        .code(401)
        .send({ message: "Missing or invalid Authorization header" });
    }

    const { userId } = verifyToken(token);

    const posts = await getPosts(userId);

    return reply.send(posts);
  } catch (error: any) {
    if (error?.message === "Invalid or expired token") {
      return reply.code(401).send({ message: "Invalid or expired token" });
    }

    return reply.code(500).send({ message: "Failed to fetch posts" });
  }
};

export const getPostHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const post = await getPostById(Number(request.params.id));

    if (!post) {
      return reply.code(404).send({ message: "Post not found" });
    }

    return reply.send(post);
  } catch (error) {
    return reply.code(500).send({ message: "Failed to fetch post" });
  }
};

export const updatePostHandler = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: any;
  }>,
  reply: FastifyReply,
) => {
  try {
    const updated = await updatePost(
      Number(request.params.id),
      request.body as Partial<{
        title: string;
        text: string;
        image: string;
        tags: string;
        isPublished: boolean;
      }>,
    );

    return reply.send(updated);
  } catch (error) {
    return reply.code(500).send({ message: "Failed to update post" });
  }
};

export const deletePostHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    await deletePost(Number(request.params.id));
    return reply.code(204).send();
  } catch (error) {
    return reply.code(500).send({ message: "Failed to delete post" });
  }
};

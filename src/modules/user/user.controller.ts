import { FastifyReply, FastifyRequest } from "fastify";
import { getUser } from "./user.service";
import { verifyToken } from "../../utils/jwt";

export const getUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { token } = request.cookies;

    if (!token) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Token not provided",
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.email) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid token payload",
      });
    }

    const user = await getUser(decoded.email);

    if (!user) {
      return reply.code(404).send({
        error: "Not Found",
        message: "User not found",
      });
    }

    return reply.code(200).send(user);
  } catch (error) {
    console.error("Get user error:", error);

    if (error instanceof Error && error.message.includes("token")) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }

    return reply.code(500).send({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

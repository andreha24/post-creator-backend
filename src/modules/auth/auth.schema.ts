import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, "Password is required"),
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string(),
    name: z.string().nullable(),
  }),
  token: z.string(),
});

// JSON Schema versions for Fastify validation
export const registerJsonSchema = zodToJsonSchema(registerSchema as any, "registerSchema");
export const loginJsonSchema = zodToJsonSchema(loginSchema as any, "loginSchema");

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type GoogleAuthResponse = AuthResponse & {
  isNewUser: boolean;
};

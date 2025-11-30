import { z } from "zod";

const registerUserSchema = z.object({
  email: z.email("Email is required"),
  password: z.string("Password is required").min(6, "Too short!"),
});

const userResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

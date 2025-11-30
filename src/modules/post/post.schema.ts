import { z } from "zod";

const createPostSchema = z.object({
  topic: z.string(),
  additionals: z.string(),
  size: z.string(),
  style: z.string(),
  socialMedia: z.string(),
  tags: z.boolean(),
  // userId: z.number(),
});

const postResponseSchema = z.object({
  text: z.string(),
  image: z.string(),
  title: z.string(),
  tags: z.string(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostResponse = z.infer<typeof postResponseSchema>;

import { z } from "zod";

const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

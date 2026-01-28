import z from "zod";

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(500),
});

export type CreatePostBody = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  content: z.string().trim().min(1).max(500).optional(),
});
export type UpdatePostBody = z.infer<typeof updatePostSchema>;

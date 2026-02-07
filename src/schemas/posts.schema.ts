import z from "zod";

export const createPostSchema = z.object({
  content: z.string().trim().min(1).max(500),
});

export type CreatePostBody = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  content: z.string().trim().min(1).max(500).optional(),
});
export type UpdatePostBody = z.infer<typeof updatePostSchema>;

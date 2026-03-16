import z from "zod";

export const createPostSchema = z.object({
  text: z.string().trim().max(500),
});

export type CreatePostBody = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  text: z.string().trim().max(500),
  removeOldImage: z.string().optional(),
});
export type UpdatePostBody = z.infer<typeof updatePostSchema>;

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(500),
});
export type CreateCommentBody = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(500).optional(),
});
export type UpdateCommentBody = z.infer<typeof updateCommentSchema>;

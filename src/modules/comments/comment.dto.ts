import * as z from "zod";

export const createCommentDto = z.object({
  content: z.string().trim().min(1).max(500),
});
export type CreateCommentDto = z.infer<typeof createCommentDto>;

export const updateCommentDto = z.object({
  content: z.string().trim().min(1).max(500),
});
export type UpdateCommentDto = z.infer<typeof updateCommentDto>;

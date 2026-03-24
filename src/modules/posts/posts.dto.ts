import z from "zod";

export const createPostDto = z.object({
  text: z.string().trim().max(2000).optional(),
});

export type CreatePostDto = z.infer<typeof createPostDto>;

export const updatePostDto = z.object({
  text: z.string().trim().max(2000).optional(),
  removeOldImage: z.string().optional(),
});
export type UpdatePostDto = z.infer<typeof updatePostDto>;

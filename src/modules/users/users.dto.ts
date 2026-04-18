import z from "zod";

export const updateUserProfileDto = z.object({
  name: z.string().min(3).max(30).optional(),
  bio: z.string().max(160).optional(),
});
export type UpdateUserProfileDto = z.infer<typeof updateUserProfileDto>;

import z from "zod";

export const updateUserProfileDto = z.object({
  name: z.string().optional(),
  bio: z.string().max(160).optional(),
  profilePicture: z.file().optional(),
});
export type UpdateUserProfileDto = z.infer<typeof updateUserProfileDto>;

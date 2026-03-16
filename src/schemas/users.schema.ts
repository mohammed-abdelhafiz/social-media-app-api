import z from "zod";

export const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().max(160).optional(),
  profilePicture: z.file().optional(),
});
export type UpdateUserProfileBody = z.infer<typeof updateUserProfileSchema>;

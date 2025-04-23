import { nullable, z } from "zod";

export const editprofileSchema = z.object({
  fullName: z.string().min(1),
  gameName: z.string().min(1),
  gameId: z.string().min(1),
  serverId: z.string().min(1),
  roles: z.string().min(1),
  state: z.string().optional(),
  city: z.string().optional(),

  profileImage: z.string().optional(),
});

export const viewprofileSchema = z.object({
  fullName: z.string().min(1),
  ign: z.string().min(1),
  game_id: z.string().min(1),
  server_id: z.string().min(1),
  roles: z.string().min(1),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

export type EditProfileFormState = z.infer<typeof editprofileSchema>;
export type ViewProfileFormType = z.infer<typeof viewprofileSchema>;
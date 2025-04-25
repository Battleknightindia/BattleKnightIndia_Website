import { z } from "zod"

export const volunteersSchema = z.object({
    email: z.string().min(1),
    phone: z.string().min(1),
    referral_code: z.string().min(1),
    reward_point: z.string().optional().nullable(),
    team_count: z.string().optional().nullable(),
    
  })

export const teamSchema = z.object({
  name: z.string().min(1),
  referral_code: z.string().min(1),
  logo: z.string().optional().nullable(),
  id: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
})

export const captainSchema = z.object({
  id: z.string().min(1),
  team_id: z.string().min(1),
  university_id: z.string().min(1),
  created_at: z.string().min(1),
  name: z.string().min(1),
  ign: z.string().min(1),
  role: z.enum(['captain', 'player', 'substitute', 'coach']),
  game_id: z.string().min(1),
  server_id: z.string().min(1),
  email: z.string().min(1),
  mobile: z.string().min(1),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  device: z.string().optional().nullable(),
  picture_url: z.string().optional().nullable(),
  student_id_url: z.string().optional().nullable(),
})

export type VolunteerFormState = z.infer<typeof volunteersSchema>;
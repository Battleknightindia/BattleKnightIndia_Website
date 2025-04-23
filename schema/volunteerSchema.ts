import { z } from "zod"

export const volunteersSchema = z.object({
    email: z.string().min(1),
    phone: z.string().min(1),
    referral_code: z.string().min(1),
    reward_point: z.string().optional().nullable(),
    team_count: z.string().optional().nullable(),
    
  })

export type VolunteerFormState = z.infer<typeof volunteersSchema>;
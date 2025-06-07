// @/schema/volunteerSchema.ts
import { z } from "zod";

export const volunteersSchema = z.object({
  // Existing fields
  profile_id: z.string().uuid(),
  referral_code: z.string().min(1, "Referral code is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  joined_at: z.string(), // Timestamps are often parsed as strings initially
  updated_at: z.string(),
  volunteer_id: z.string().uuid(),

  // NEW fields, now coming directly from the database
  reward_points: z.string().default('0'), // Make sure this matches the DB type
  teams_referred: z.string().default('0').optional(), // If you still use this, otherwise remove
  approved_teams: z.string().default('0'), // Make sure this matches the DB type
  total_teams: z.string().default('0'), // Make sure this matches the DB type
});

export type VolunteerFormState = z.infer<typeof volunteersSchema>;
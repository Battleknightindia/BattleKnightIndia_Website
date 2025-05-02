import { z } from 'zod';

// Player validation schema
export const playerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ign: z.string().min(1, "In-game name is required"),
  role: z.enum(['captain', 'player', 'substitute', 'coach']),
  game_id: z.string().min(1, "Game ID is required"),
  server_id: z.string().min(1, "Server ID is required"),
  email: z.string().email().nullable(),
  mobile: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  device: z.string().nullable(),
  picture_url: z.union([z.string(), z.instanceof(File), z.null()]),
  student_id_url: z.union([z.string(), z.instanceof(File), z.null()]),
});

// University validation schema
export const universitySchema = z.object({
  name: z.string().min(1, "University name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  logo: z.union([z.instanceof(File), z.string(), z.null()]),
});

// Team validation schema
export const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  referral_code: z.string().min(6).max(20).optional(),
  logo: z.union([z.instanceof(File), z.string(), z.null()]),
});

// Full registration form schema
export const registrationSchema = z.object({
  university: universitySchema,
  team: teamSchema,
  players: z.record(z.string(), playerSchema.optional()),
  termsAccepted: z.boolean(),
});
import { Database } from "./supabase";

export type Team = Database["public"]["Tables"]["teams"]["Row"]
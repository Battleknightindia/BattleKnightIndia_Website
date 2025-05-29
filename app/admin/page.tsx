import AdminPanel from "./components/Homepage/AdminPanel";
import { fetchteams } from "@/lib/data/stats_data";
import  AdminLock from "./components/AdminLock";
import { createClient } from "@/utils/supabase/server";
import { viewprofileSchema } from "@/schema/profileSchema";


export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return <AdminLock />;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return <AdminLock />;
  }

  const result = viewprofileSchema.safeParse(profile);
  if (!result.success || !result.data.is_admin) {
    return <AdminLock />;
  }

  const teams = await fetchteams();

  return <AdminPanel teams={teams} />;
}

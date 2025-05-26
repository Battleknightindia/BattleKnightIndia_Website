import AdminPanel from "./components/AdminPanel";
import { fetchteams } from "@/lib/data/statsData";
import  AdminLock from "./components/AdminLock";
import { fetchProfile } from "@/lib/data/profile_data";


export default async function AdminPage() {
  const profile_data = await fetchProfile();
  const teams = await fetchteams();
  const isAdmin = profile_data?.is_admin === false;
  if (!isAdmin === null) {
    return <AdminLock/>;
  }
  return (
    <AdminPanel teams={teams}/>
  )
}

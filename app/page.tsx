import HomeClient from "@/components/homepage/HomeClient";
import { createClient } from "@/utils/supabase/server";

export default async function Home(){
  const supabase = await createClient();
  const {data : {user}} = await supabase.auth.getUser();
  const isLoggedIn = !!user
  
  return <HomeClient isLoggedIn={isLoggedIn}/>
}
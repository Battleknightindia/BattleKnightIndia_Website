import ClientHome from "@/components/Wrapper"
import { createClient } from "@/utils/supabase/server"
import { getFeaturedEvent, getCosplayGallery, getEventCarousel, getNorthEastCup } from "@/lib/data/homepage_data";

export default async function Home(){
  const featuredData = await getFeaturedEvent();
  const eventData = await getEventCarousel();
  const northeastData = await getNorthEastCup();
  const cosplayData = await getCosplayGallery();
  const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
  return(
    <div className="">
      <ClientHome user={user} featuredData={featuredData} northeastcupData={northeastData} eventData={eventData} cosplayData={cosplayData}/>
    </div>
  )
}
import HomeClient from "@/components/homepage/HomeClient";
import { getFeaturedEvent, getCosplayGallery, getEventCarousel, getNorthEastCup } from "@/lib/data/homepage_data";


export default async function Home() {
  const featuredData = await getFeaturedEvent();
  const eventData = await getEventCarousel();
  const northeastData = await getNorthEastCup();
  const cosplayData = await getCosplayGallery();
  return <HomeClient featuredData={featuredData} eventData={eventData} northeastData={northeastData} cosplayData={cosplayData}/>
}

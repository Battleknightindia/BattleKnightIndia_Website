import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import AboutSection from "@/components/AboutSection";
import NorthEastCup from "@/components/NorthEastCup";
import CosplaySection from "@/components/CosplaySection";
import Footer from "@/components/Footer";
import { getFeaturedEvent, getCosplayGallery, getEventCarousel, getNorthEastCup } from "@/lib/data/homepage_data";
import NavBar from "@/components/NavBar";
import HomeClient from "@/app/HomeClient";

export default async function Home() {
  const featuredData = await getFeaturedEvent();
  const eventData = await getEventCarousel();
  const northeastData = await getNorthEastCup();
  const cosplayData = await getCosplayGallery();

  return (
    <>
      <NavBar />
      <div className="flex flex-col min-h-screen bg-black text-white">
        <div id="home">
          <HeroSection />
        </div>
        <div id="featured">
          <FeaturedSection featuredData={featuredData} eventData={eventData} />
        </div>
        <div id="northeastcup">
          <NorthEastCup items={northeastData}/>
        </div>
        <div id="cosplay">
          <CosplaySection cosplayData={cosplayData}/>
        </div>
        <div id="about">
          <AboutSection />
        </div>
        <Footer />
      </div>
      <HomeClient />
    </>
  );
}

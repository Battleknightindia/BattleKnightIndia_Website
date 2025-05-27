import { getCosplayGallery } from "@/lib/data/homepage_data"
import CosplayGallery from "./components/Gallery"

export default async function CosplayPage() {
  const cosplayData = await getCosplayGallery()

  return (
    <div className="min-h-screen bg-[#18181B]">
      <CosplayGallery cosplayData={cosplayData} />
    </div>
  )
}
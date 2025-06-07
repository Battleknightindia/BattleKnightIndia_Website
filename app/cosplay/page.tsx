import { getCosplayGallery } from "@/lib/data/homepage_data"
import CosplayGallery from "./components/Gallery"
import { CosplayItem } from "@/types/homepageTypes"

export default async function CosplayPage() {
  const cosplayData: CosplayItem[] = await getCosplayGallery()

  return (
    <div className="min-h-screen pt-20 bg-[#18181B]">
      <CosplayGallery cosplayData={cosplayData} />
    </div>
  )
}
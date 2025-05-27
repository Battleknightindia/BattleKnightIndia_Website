"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type CosplayItem = {
  id: string
  image: string
}

type Props = {
  cosplayData: CosplayItem[]
}

export default function CosplayGallery({ cosplayData }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const totalPages = Math.ceil(cosplayData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = cosplayData.slice(startIndex, endIndex)

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <section className="w-full bg-[#18181B] py-8 lg:py-24 text-white min-h-screen flex justify-center">
      <div className="container px-4 lg:px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariants}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Cosplay Gallery
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-emerald-500 mx-auto mb-8"></div>
          <p className="max-w-[800px] mx-auto text-gray-300 text-xl lg:text-2xl leading-relaxed">
            A curated collection showcasing the artistry and creativity of talented cosplayers.
          </p>
        </motion.div>

        {/* Gallery Panel */}
        <motion.div
          className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 lg:p-8 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariants}
        >
          {/* Gallery Grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4"
            variants={staggerContainer}
          >
            {currentItems.map((cosplay) => (
              <motion.div
                key={cosplay.id}
                variants={fadeInVariants}
                className="group relative overflow-hidden rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={cosplay.image || "/placeholder.svg?height=600&width=450"}
                    alt="Cosplay"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination within panel */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-700/50">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700 hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700 hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </motion.div>

        {/* Gallery Stats */}
        <motion.div
          className="text-center text-gray-400"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariants}
        >
          <p className="text-lg">
            Showing {startIndex + 1}-{Math.min(endIndex, cosplayData.length)} of {cosplayData.length} images
          </p>
        </motion.div>
      </div>
    </section>
  )
}

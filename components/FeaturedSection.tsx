"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import EventCarousel from "@/components/EventCardCarousel"
import { FEATURED_EVENT } from "@/lib/constant/home_page"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
    },
  },
}

export default function FeaturedSection() {
  // Removed useState here as well, aligning with the import removal

  return (
    <section className="w-full bg-[#18181B] text-white py-16 md:py-24 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariants}
        >
          <Badge className="mb-4 bg-amber-500 text-white hover:bg-amber-600 hover:scale-105 transition-all duration-300">Featured Event</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Current Main Event</h2>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Main Event Banner */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl">
            <Image
              src={FEATURED_EVENT.bannerImage || "/placeholder.svg"}
              alt={FEATURED_EVENT.title}
              width={1200}
              height={600}
              className="w-full h-[300px] md:h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-2xl md:text-4xl font-bold mb-2">{FEATURED_EVENT.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-emerald-500" />
                  {FEATURED_EVENT.date}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-amber-600" />
                  {FEATURED_EVENT.location}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-blue-500" />
                  {FEATURED_EVENT.teamCount} Teams
                </div>
              </div>
            </div>
          </motion.div>

          {/* Event Details */}
          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900 border-zinc-500 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-4 text-white">Event Details</h4>
                  <p className="text-zinc-300 mb-6">{FEATURED_EVENT.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-sm text-zinc-400">Teams</p>
                      <p className="text-xl font-bold text-purple-400">{FEATURED_EVENT.teamCount}</p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-sm text-zinc-400">Prize Pool</p>
                      <p className="text-xl font-bold text-amber-400">{FEATURED_EVENT.prizePool}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button asChild className="bg-emerald-500 text-white hover:bg-emerald-600 flex-1 hover:scale-105 transition-all duration-300">
                    <Link href={FEATURED_EVENT.ticketsUrl}>Register with your team</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white text-black hover:bg-amber-600 hover:text-white flex-1 hover:scale-105 transition-all duration-300">
                    <Link href={FEATURED_EVENT.watchUrl}>Let&apos;s Watch Live</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Event Gallery */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInVariants}>
          <EventCarousel /> {/* Check the implementation of EventCarousel */}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <Card className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-zinc-400">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-white text-2xl md:text-3xl font-bold mb-4">Don&apos;t Miss The Action</h3>
              <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
                Whether you&apos;re a player or a fan, this event is not to be missed!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 transition-all duration-300">
                  <Link href={FEATURED_EVENT.ticketsUrl} className="font-bold">Register with your team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
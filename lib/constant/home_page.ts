import { CosplayItem, FeaturedItem, MediaItem, NorthEastCupItem } from "@/types/homepageType";

// North East Cup tournament data
export const TOURNAMENT_DATA: NorthEastCupItem[] = [
  {
    id: 1,
    image: "/nec/main.webp", // Realistic image placeholder
    title: "NorthEast Cup Recap",
    description:
      "Recap of the thrilling NorthEast Cup 2023, where champions were forged and legends were made. Held in Guwahati, Assam.",
    stats: {
      participants: "850+ Teams",
      prizePool: "₹2,40,000 + 2,55,000 Diamonds", // Using INR for regional context
      duration: "40 Days",
    },
    statColors: {
      participants: "bg-blue-600",
      prizePool: "bg-green-600",
      duration: "bg-purple-600",
    },
  },
  // Add this new object to your existing TOURNAMENT_DATA array
  {
    id: 2, // Use a unique ID, adjust based on the last ID in your list
    image: "/nec/winners.webp",
    title: "NorthEast Cup Champions!",
    description:
      "Congratulations to the victorious team who conquered the competition and claimed the coveted NorthEast Cup trophy! Their skill, teamwork, and dedication shone brightly throughout the tournament.",
    stats: {
      // Optional: add stats related to the winners
      finish: "1st Place",
      prize: "₹6,00,000", // Match the prize pool stat
    },
    statColors: {
      finish: "bg-amber-500", // Gold-like color
      prize: "bg-green-600",
    },
  },
  // Add this new object to your existing TOURNAMENT_DATA array
  {
    id: 3, // Use a unique ID, adjust based on the last ID in your list
    image: "/nec/runnerups.webp",
    title: "NorthEast Cup - Runner-ups",
    description:
      "A massive shoutout to our Runner-up team! Securing the second spot is a remarkable achievement against fierce competition. Your hard work and performance were truly impressive.",
    stats: {
      finish: "2nd Place",
      prize: "₹4,00,000",
    },
    statColors: {
      finish: "bg-pink-500", // Stone/Bronze like color
      prize: "bg-green-600",
    },
  },
  {
    id: 4, // Use a unique ID
    image: "/nec/anchors.webp", // Example image path for the anchors graphic
    title: "Meet the NE Cup Anchors",
    description:
      "Introducing the engaging voices guiding you through the North East Cup event! Our official anchors, Missi Jenny and Rumi, keep the energy high and the show running smoothly.",
    stats: {
      role: "Event Anchors",
      team: "Dynamic Duo",
    },
    statColors: {
      role: "bg-pink-600", // Example color
      team: "bg-teal-600", // Example color
    },
  },
  {
    id: 5, // Use a unique ID, different from the anchors
    image: "/nec/host&caster.webp", // Example image path for the host/casters graphic
    title: "NE Cup Host & Casters",
    description:
      "Get ready for expert analysis and exciting play-by-play! Our host Rae and a talented team of casters – Yumena, Linwl, Sasuke, Scared Yet, and Krux – provide the commentary for the matches.",
    stats: {
      team: "1 Host, 5 Casters",
      commentary: "Live Game Insights",
    },
    statColors: {
      team: "bg-orange-600", // Example color
      commentary: "bg-purple-600", // Example color
    },
  },
  {
    id: 6, // Use a unique ID, adjust based on the last ID in your list
    image: "/nec/production.webp", // Adjusted image path based on content
    title: "Behind the Scenes",
    description:
      "More than just the on-screen action, the North East Cup comes to life thanks to the dedicated production and broadcast team working tirelessly behind the scenes to bring the event to your screens.",
    stats: {
      // Optional: add stats related to the team
      role: "Production Crew",
      effort: "Making it Happen",
    },
    statColors: {
      role: "bg-yellow-600", // Example color
      effort: "bg-blue-600", // Example color
    },
  },
  {
    id: 7,
    image: "/nec/memorable.webp", // Realistic image placeholder
    title: "Memorable Moments of North East Cup",
    description:
      "Key highlights including the grand finals, unexpected upsets, and top player performances.",
    stats: {
      viewership: "3.1M Peak",
      platforms: "YouTube",
    },
    statColors: {
      viewership: "bg-red-600",
      platforms: "bg-amber-600",
    },
  },
  {
    id: 8, // Use a unique ID, adjust based on the last ID in your list
    image: "/nec/cosplay.webp",
    title: "Cosplay Showcase",
    description:
      "The North East Cup isn't just about gaming! Our vibrant cosplay community brought incredible creativity and passion, showcasing stunning costumes and characters.",
    stats: {
      // Optional: add stats related to cosplay
      participants: "50+ Cosplayers",
      creativity: "High Standards",
    },
    statColors: {
      participants: "bg-pink-600",
      creativity: "bg-teal-600",
    },
  },
  {
    id: 9, // Use a unique ID, adjust based on the last ID in your list
    image: "/nec/community.webp", // Adjusted image path
    title: "Enthusiastic Audience",
    description:
      "The heart of the North East Cup lies in its passionate community. Our events bring together enthusiastic crowds, creating an electric atmosphere for participants and spectators alike.",
    stats: {
      // Optional: add stats related to the audience/event
      attendees: "Packed House",
      energy: "Incredible",
    },
    statColors: {
      attendees: "bg-blue-600", // Example color
      energy: "bg-red-600", // Example color
    },
  },
];

// Cosplay gallery data
export const COSPLAY_DATA: CosplayItem[] = [
  {
    id: 1,
    image: "/cosplay/cosplay1.webp",
  },
  {
    id: 2,
    image: "/cosplay/cosplay2.webp",
  },
  {
    id: 3,
    image: "/cosplay/cosplay3.webp",
  },
  {
    id: 4,
    image: "/cosplay/cosplay4.webp",
  },
  {
    id: 5,
    image: "/cosplay/cosplay5.webp",
  },
  {
    id: 6,
    image: "/cosplay/cosplay6.webp",
  },
];





export const EVENT_DATA: MediaItem[] = [
  {
    id: "1",
    title: "Champions and Runnerup of Nagaland",
    date: "May 20",
    type: "image",
    src: "/nagaland_ncc/pic/nagaland1.jpg",
    aspectRatio: "landscape",
    description: "Champions and Runnerup of NCC Promotional Match in Nagaland",
  },
  {
    id: "2",
    title: "Champions from Nagalands",
    date: "May 20",
    type: "image",
    src: "/nagaland_ncc/pic/nagaland2.jpg",
    description: "Champions of Nagaland NCC Promotional match ",
    aspectRatio: "portrait",
  },
  {
    id: "3",
    title: "Gathering for NCC Promotionals",
    date: "May 20",
    type: "image",
    src: "/nagaland_ncc/pic/nagaland3.jpg",
    aspectRatio: "landscape",
    description:
      "Gathering of different player in nagaland for NCC Promotional match",
  },
  {
    id: "4",
    title: "Speech given by Nagaland Champions",
    date: "May 20",
    type: "video",
    src: "/nagaland_ncc/nagaland.mp4",
    aspectRatio: "landscape",
  },
];

// Featured event data
export const FEATURED_EVENT: FeaturedItem = {
  title: "National Collage Cup",
  date: "June 15, 2025",
  location: "India",
  description:
    "The ultimate showdown between the world's top esports teams in india. Witness history in the making as they battle for the championship title and a prize pool of INR 2 lakh.",
  teamCount:  512,
  prizePool: "2,50,000 Diamonds",
  ticketsUrl: "#",
  watchUrl: "#",
  bannerImage: "/ncc/banner.webp",
};

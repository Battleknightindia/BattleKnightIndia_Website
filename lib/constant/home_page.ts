// Partner data
export const PARTNERS = [
  "/ROG logo_red.png",
  "/ROG logo_red.png",
  "/ROG logo_red.png",
  "/ROG logo_red.png",
  "/ROG logo_red.png",
  "/ROG logo_red.png",
  "/ROG logo_red.png",
  "/ROG logo_red.png",
];

// About section data
export const ABOUT_DATA = {
  title: "About BATTLE KNIGHT",
  description: "BATTLE KNIGHT is the premier tournament platform for MOBA Legends 5v5 players. We provide a competitive environment where teams can showcase their skills, compete for prizes, and connect with the community.",
  mission: {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/328bce89299845ad873e2823f7c6583a60768483?placeholderIfAbsent=true&apiKey=321d88bf5b744033877cc8a5e920a0cb",
    title: "Our Mission",
    description: "To create the most engaging and fair competitive environment for MOBA Legend players worldwide, fostering talent and building a vibrant community."
  },
  values: {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/328bce89299845ad873e2823f7c6583a60768483?placeholderIfAbsent=true&apiKey=321d88bf5b744033877cc8a5e920a0cb",
    title: "Our Values",
    description: "Fair Play & Integrity, Community First, Innovation & Excellence in everything we do."
  }
};

// North East Cup tournament data
export const TOURNAMENT_DATA = [
  {
    id: 1,
    image: "/1.JPG", // Realistic image placeholder
    title: "NorthEast Cup Recap",
    description: "Recap of the thrilling NorthEast Cup 2023, where champions were forged and legends were made. Held in Guwahati, Assam.",
    stats: {
      participants: "256 Teams",
      prizePool: "₹10,00,000", // Using INR for regional context
      duration: "4 Days",
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
  image: "/winners.JPG",
  title: "NorthEast Cup Champions!",
  description: "Congratulations to the victorious team who conquered the competition and claimed the coveted NorthEast Cup trophy! Their skill, teamwork, and dedication shone brightly throughout the tournament.",
  // You could optionally add the winning team members here if you have their names:
  // team: [
  //   "Player Name 1",
  //   "Player Name 2",
  //   // ... etc.
  // ],
  stats: { // Optional: add stats related to the winners
      finish: "1st Place",
      prize: "₹6,00,000", // Match the prize pool stat
      performance: "Dominant", // Example
  },
  statColors: {
      finish: "bg-amber-500", // Gold-like color
      prize: "bg-green-600",
      performance: "bg-blue-600",
  }
},
// Add this new object to your existing TOURNAMENT_DATA array
{
  id: 3, // Use a unique ID, adjust based on the last ID in your list
  image: "/runnerups.JPG",
  title: "NorthEast Cup - Runner-ups",
  description: "A massive shoutout to our Runner-up team! Securing the second spot is a remarkable achievement against fierce competition. Your hard work and performance were truly impressive.",
  stats: {
    finish: "2nd Place",
    prize: "₹4,00,000",
    performance: "Exemplary",
  },
  statColors: {
    finish: "bg-pink-500", // Stone/Bronze like color
    prize: "bg-green-600",
    performance: "bg-blue-600",
  }
},
  {
    id: 4,
    image: "/voice_of_nec.JPG", // Realistic image placeholder
    title: "The Voices of North East Cup",
    description: "Our dynamic casting crew brought every clutch play and strategic move to life for the audience.",
    team: [
      "Ritu Sharma - Lead Caster",
      "Arjun Singh - Analyst",
      "Priya Verma - Host & Interviews",
      "Amit Deb - Color Commentary",
      "Zintu (Jintu) Bora - Sideline Reporter", // Incorporating the user's association
    ],
  },
  {
    id: 5,
    image: "/eyes_of_nec.JPG", // Realistic image placeholder
    title: "The Eyes of North East Cup",
    description: "The dedicated production team ensuring a seamless viewing experience across all platforms.",
    team: [
      "Production Lead: Gaurav Kalita",
      "Technical Director: Sanjay Das",
      "Graphics Team: VisionFX Studios",
      "Camera Crew: NE Media Pros",
    ],
  },
  {
    id: 6,
    image: "/memorable.JPG", // Realistic image placeholder
    title: "Memorable Moments of North East Cup",
    description: "Key highlights including the grand finals, unexpected upsets, and top player performances.",
    stats: {
      viewership: "3.1M Peak",
      platforms: "YouTube",
      matchesPlayed: "150+",
    },
    statColors: {
      viewership: "bg-red-600",
      platforms: "bg-amber-600",
      matchesPlayed: "bg-teal-600",
    },
  },
  {
    id: 7, // Use a unique ID, adjust based on the last ID in your list
    image: "/cosplay.JPG",
    title: "Cosplay Showcase",
    description: "The North East Cup isn't just about gaming! Our vibrant cosplay community brought incredible creativity and passion, showcasing stunning costumes and characters.",
     stats: { // Optional: add stats related to cosplay
        participants: "50+ Cosplayers",
        creativity: "High Standards",
        audienceFavorite: "Cheers",
    },
    statColors: {
        participants: "bg-pink-600",
        creativity: "bg-teal-600",
        audienceFavorite: "bg-purple-600",
    }
  },
  {
    id: 8,
    image: "/community.JPG", // Realistic image placeholder
    title: "Community & Fan Engagement",
    description: "The NorthEast Cup is more than a tournament; it's a celebration of the vibrant gaming community in the region.",
    stats: {
      attendees: "5000+",
      onlineFans: "500K+",
      communityEvents: "10+",
    },
    statColors: {
      attendees: "bg-indigo-600",
      onlineFans: "bg-pink-600",
      communityEvents: "bg-yellow-600",
    },
  },
];

// Cosplay gallery data
export const COSPLAY_DATA = [
  {
    id: 1,
    image: "/placeholder.svg?height=800&width=600&text=Cosplay+1",
    character: "Raven from Teen Titans",
    cosplayer: "CosplayArtist1",
    likeCount: 0
  },
  {
    id: 2,
    image: "/placeholder.svg?height=800&width=600&text=Cosplay+2",
    character: "Geralt of Rivia",
    cosplayer: "WitcherFan99",
    likeCount: 0
  },
  {
    id: 3,
    image: "/placeholder.svg?height=800&width=600&text=Cosplay+3",
    character: "Jinx from Arcane",
    cosplayer: "PowderArtistry",
    likeCount: 0
  },
  {
    id: 4,
    image: "/placeholder.svg?height=800&width=600&text=Cosplay+4",
    character: "Link from Zelda",
    cosplayer: "HyruleHero",
    likeCount: 0
  },
  {
    id: 5,
    image: "/placeholder.svg?height=800&width=600&text=Cosplay+5",
    character: "Ahsoka Tano",
    cosplayer: "JediCosplayer",
    likeCount: 0
  },
  {
    id: 6,
    image: "/placeholder.svg?height=800&width=600&text=Cosplay+6",
    character: "Sailor Moon",
    cosplayer: "MoonPrismArtist",
    likeCount: 0
  }
];

// Event data
export const EVENT_DATA = [
  {
    id: 1,
    title: "Grand Finals",
    image: "/placeholder.svg?height=600&width=800",
    date: "June 15, 2025",
    description: "Championship match between the top two teams",
  },
  {
    id: 2,
    title: "Semi-Finals",
    image: "/placeholder.svg?height=600&width=800",
    date: "June 12, 2025",
    description: "Four teams battle for a spot in the finals",
  },
  {
    id: 3,
    title: "Quarter-Finals",
    image: "/placeholder.svg?height=600&width=800",
    date: "June 10, 2025",
    description: "Eight teams compete in elimination matches",
  },
  {
    id: 4,
    title: "Group Stage",
    image: "/placeholder.svg?height=600&width=800",
    date: "June 5-8, 2025",
    description: "Initial round-robin tournament phase",
  },
];

// Featured event data
export const FEATURED_EVENT = {
  title: "National Collage Cup",
  date: "June 15, 2025",
  location: "India",
  description: "The ultimate showdown between the world's top esports teams in india. Witness history in the making as they battle for the championship title and a prize pool of INR 2 lakh.",
  teamCount: 300,
  prizePool: "2,00,000 INR",
  ticketsUrl: "#",
  watchUrl: "#",
  bannerImage: "/placeholder.svg?height=600&width=1200",
  images: [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
  ],
};

import { CosplayItem, FeaturedItem, MediaItem, NorthEastCupItem } from "@/types/homepageTypes";

// North East Cup tournament data
export const TOURNAMENT_DATA: NorthEastCupItem[] = [
  {
    id: "1",
    image: "/nec/main.webp",
    title: "NorthEast Cup Recap",
    description:
      "Recap of the thrilling NorthEast Cup 2023, where champions were forged and legends were made. Held in Guwahati, Assam.",
    
    stats: [
      {"id":"stat-1", "name": "participants","color":"#2563eb","value":"850+ Teams"},
      {"id":"stat-2", "name": "prizePool","color":"#16a34a","value":"₹2,40,000 + 2,55,000 Diamonds"},
      {"id":"stat-4", "name": "duration","color":"#9333ea","value":"40 Days"},
    ],
    statColors: {
      "participants": "#2563eb",
      "prizePool": "#16a34a", 
      "duration": "#9333ea",
    },
    order_index: 1
  },
  {
    id: "2",
    image: "/nec/winners.webp",
    title: "NorthEast Cup Champions!",
    description:
      "Congratulations to the victorious team who conquered the competition and claimed the coveted NorthEast Cup trophy! Their skill, teamwork, and dedication shone brightly throughout the tournament.",
    
    stats: [
      {"id":"stat-5", "name": "finish","color":"#f59e0b","value":"1st Place"},
      {"id":"stat-6", "name": "prize","color":"#16a34a","value":"₹6,00,000"},
    ],
    order_index: 1,
    statColors: {
      finish: "#f59e0b",
      prize: "#16a34a",
    },
  },
  // Rest of the objects remain unchanged since they already use hex codes
  {
    id: "3",
    image: "/nec/runnerups.webp",
    title: "NorthEast Cup - Runner-ups",
    description:
      "A massive shoutout to our Runner-up team! Securing the second spot is a remarkable achievement against fierce competition. Your hard work and performance were truly impressive.",
    stats: [
      {"id":"stat-7", "name": "finish", "color": "#ec4899", "value": "2nd Place"},
      {"id":"stat-8", "name": "prize", "color": "#16a34a", "value": "₹4,00,000"},
    ],
    order_index: 3,
    statColors: {
      "finish": "#ec4899",
      "prize": "#16a34a"
    }
  },
  {
    id: "4",
    image: "/nec/anchors.webp",
    title: "Meet the NE Cup Anchors",
    description:
      "Introducing the engaging voices guiding you through the North East Cup event! Our official anchors, Missi Jenny and Rumi, keep the energy high and the show running smoothly.",
    stats: [
      {"id":"stat-9", "name": "role", "color": "#db2777", "value": "Event Anchors"},
      {"id":"stat-10", "name": "team", "color": "#0d9488", "value": "Dynamic Duo"}
    ],
    order_index: 4,
    statColors: {
      "role": "#db2777",
      "team": "#0d9488"
    }
  },
  {
    id: "5",
    image: "/nec/host&caster.webp",
    title: "NE Cup Host & Casters",
    description:
      "Get ready for expert analysis and exciting play-by-play! Our host Rae and a talented team of casters – Yumena, Linwl, Sasuke, Scared Yet, and Krux – provide the commentary for the matches.",
    stats: [
      {"id":"stat-11", "name": "team", "color": "#ea580c", "value": "1 Host, 5 Casters"},
      {"id":"stat-12", "name": "commentary", "color": "#9333ea", "value": "Live Game Insights"}
    ],
    order_index: 5,
    statColors: {
      "team": "#ea580c",
      "commentary": "#9333ea"
    }
  },
  {
    id: "6",
    image: "/nec/production.webp",
    title: "Behind the Scenes",
    description:
      "More than just the on-screen action, the North East Cup comes to life thanks to the dedicated production and broadcast team working tirelessly behind the scenes to bring the event to your screens.",
    stats: [
      {"id":"stat-13", "name": "role", "color": "#ca8a04", "value": "Production Crew"},
      {"id":"stat-14", "name": "effort", "color": "#2563eb", "value": "Making it Happen"}
    ],
    order_index: 6,
    statColors: {
      "role": "#ca8a04",
      "effort": "#2563eb"
    }
  },
  {
    id: "7",
    image: "/nec/memorable.webp",
    title: "Memorable Moments of North East Cup",
    description:
      "Key highlights including the grand finals, unexpected upsets, and top player performances.",
    stats: [
      {"id":"stat-11", "name": "viewership", "color": "#dc2626", "value": "3.1M Peak"},
      {"id":"stat-12", "name": "platforms", "color": "#d97706", "value": "YouTube"}
    ],
    order_index: 7,
    statColors: {
      "viewership": "#dc2626",
      "platforms": "#d97706"
    }
  },
  {
    id: "8",
    image: "/nec/cosplay.webp",
    title: "Cosplay Showcase",
    description:
      "The North East Cup isn't just about gaming! Our vibrant cosplay community brought incredible creativity and passion, showcasing stunning costumes and characters.",
    stats: [
      {"id":"stat-13", "name": "participants", "color": "#db2777", "value": "50+ Cosplayers"},
      {"id":"stat-14", "name": "creativity", "color": "#0d9488", "value": "High Standards"}
    ],
    order_index: 8,
    statColors: {
      "participants": "#db2777",
      "creativity": "#0d9488"
    }
  },
  {
    id: "9",
    image: "/nec/community.webp",
    title: "Enthusiastic Audience",
    description:
      "The heart of the North East Cup lies in its passionate community. Our events bring together enthusiastic crowds, creating an electric atmosphere for participants and spectators alike.",
    stats: [
      {"id":"stat-15", "name": "attendees", "color": "#2563eb", "value": "Packed House"},
      {"id":"stat-16", "name": "energy", "color": "#dc2626", "value": "Incredible"}
    ],
    order_index: 9,
    statColors: {
      "attendees": "#2563eb",
      "energy": "#dc2626"
    }
  }
];

// Cosplay gallery data
export const COSPLAY_DATA: CosplayItem[] = [
  {
    id: "1",
    image: "/cosplay/cosplay1.webp",
    order_index: 1
  },
  {
    id: "2", 
    image: "/cosplay/cosplay2.webp",
    order_index: 2
  },
  {
    id: "3",
    image: "/cosplay/cosplay3.webp",
    order_index: 3
  },
  {
    id: "4",
    image: "/cosplay/cosplay4.webp",
    order_index: 4
  },
  {
    id: "5",
    image: "/cosplay/cosplay5.webp",
    order_index: 5
  },
  {
    id: "6",
    image: "/cosplay/cosplay6.webp",
    order_index: 6
  },
];





export const EVENT_DATA: MediaItem[] = [
  {
    id: "1",
    title: "Champions and Runnerup of Nagaland",
    date: "May 20",
    type: "image",
    image: "/nagaland_ncc/pic/nagaland1.jpg",
    aspectRatio: "landscape",
    description: "Champions and Runnerup of NCC Promotional Match in Nagaland",
    order_index: 1
  },
  {
    id: "2",
    title: "Champions from Nagalands",
    date: "May 20",
    type: "image",
    image: "/nagaland_ncc/pic/nagaland2.jpg",
    description: "Champions of Nagaland NCC Promotional match ",
    aspectRatio: "portrait",
    order_index: 2
  },
  {
    id: "3",
    title: "Gathering for NCC Promotionals",
    date: "May 20",
    type: "image",
    image: "/nagaland_ncc/pic/nagaland3.jpg",
    aspectRatio: "landscape",
    description:
      "Gathering of different player in nagaland for NCC Promotional match",
    order_index: 3
  },
  {
    id: "4",
    title: "Speech given by Nagaland Champions",
    date: "May 20",
    type: "video",
    image: "/nagaland_ncc/nagaland.mp4",
    aspectRatio: "landscape",
    order_index: 4
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

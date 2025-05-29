export type NorthEastCupItem = {
    id: number;
    image: string;
    title: string;
    description: string;
    stats: Record<string, string>;
    statColors: Record<string, string>;
  };
  
  
  export type MediaItem = {
    id: string;
    title: string;
    date: string;
    type: "image" | "video";
    src: string;
    aspectRatio?: "portrait" | "landscape" | "square"; // For better sizing control
    description?: string;
  };
  
  export type CosplayItem = {
      id: number,
      image: string
  }
  
  export type FeaturedItem = {
    title: string,
    date: string,
    location: string,
    description: string,
    teamCount:  number,
    prizePool: string,
    ticketsUrl: string,
    watchUrl: string,
    bannerImage: string,
  }
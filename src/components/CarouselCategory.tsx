"use client";

import { Carousel } from "./ui/carousel";


export function CarouselDemo() {
  const slideData = [
    {
      title: "Mystic Mountains",
      button: "Explore Component",
      src: "https://i.pinimg.com/1200x/2d/13/43/2d13438236752ff0063036431291cb36.jpg",
    },
    {
      title: "Urban Dreams",
      button: "Explore Component",
      src: "https://i.pinimg.com/736x/b0/71/de/b071de36baef5c44fbb4fdc26c8873b5.jpg",
    },
    {
      title: "Neon Nights",
      button: "Explore Component",
      src: "https://i.pinimg.com/736x/93/53/b6/9353b6025dcb8142e0fc9637e6a7e5ac.jpg",
    },
    {
      title: "Desert Whispers",
      button: "Explore Component",
      src: "https://i.pinimg.com/736x/af/e6/90/afe6900ab8d302a5573dee63237e702a.jpg",
    },
  ];
  return (
    <div className="relative overflow-hidden w-full h-full py-20 pt-5 pb-20">
      <Carousel slides={slideData} />
    </div>
  );
}

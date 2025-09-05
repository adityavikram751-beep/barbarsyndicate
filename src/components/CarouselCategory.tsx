"use client";

import { useEffect, useState } from "react";
import { Carousel } from "./ui/carousel";

interface Category {
  _id: string;
  categoryname: string;
  catImg: string;
}

export function CarouselDemo() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://barber-syndicate.vercel.app/api/v1/category"
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Map API response into slides format
  const slideData =
    categories.map((cat) => ({
      title: cat.categoryname,
      src: cat.catImg,
    })) || [];

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-neutral-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full h-full py-20 pt-5 pb-20">
      <Carousel slides={slideData} />
    </div>
  );
}

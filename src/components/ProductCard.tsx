'use client';

import Link from 'next/link';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  shortDescription: string;
  description: string;
  quantity: string;
  isFeature: boolean;
  carter: number;
  images: string[];
  quantityOptions: { type: string }[];
  originalPrice?: number;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { id, name, price, category, shortDescription, images, originalPrice, inStock } = product;
  const imageUrl = images?.[0] || '/placeholder-image.jpg';
  const hasDiscount = !!(originalPrice && originalPrice > price);
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const PriceTag = () => (
    <div className="flex items-center space-x-2">
      <span className="text-lg font-bold text-gray-900">₹{price}</span>
      {hasDiscount && (
        <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
      )}
    </div>
  );

  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <>
      <Button variant="outline" size="sm" className="hover:text-red-500">
        <Heart className="h-4 w-4" />
      </Button>
      <Link href={`/product/${id}`}>
        <Button variant="outline" size="sm" className="hover:text-orange-500">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      {/* {!compact && (
        <Button
          size="sm"
          disabled={inStock === false}
          className="bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300"
        >
          <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
        </Button>
      )} */}
    </>
  );

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <div className="relative sm:w-64 h-48 sm:h-32">
              <Image src={imageUrl} alt={name} 
          
                 width={500}
                height={500}
              object-cover0/>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
              
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{shortDescription}</p>
              </div>
              <div className="flex items-center justify-between">
                <PriceTag />
                <div className="flex items-center space-x-2">
                  <ActionButtons />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {inStock !== false && <ActionButtons compact />}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">{name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">{shortDescription}</p>
          <div className="flex items-center justify-between mb-4">
            <PriceTag />
          </div>
          <Link href={`/product/${id}`}>
            <Button
              variant="outline"
              className="w-full mt-2 hover:text-orange-500 hover:border-orange-500 transition-colors"
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

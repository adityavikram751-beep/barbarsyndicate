import React from 'react';
import Link from 'next/link';
import { MessageCircle, Eye } from 'lucide-react';

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
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.images[0] || '/placeholder-image.jpg'} // Use first image or fallback
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        <Link
          href={`/product/${product.id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="bg-white rounded-full p-3 shadow-lg">
            <Eye className="h-5 w-5 text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full capitalize">
            {product.category}
          </span>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {product.shortDescription}
          </p>
        </div>

     

    

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link
            href={`/product/${product.id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium text-center transition-colors duration-200"
          >
            View Details
          </Link>
          
        
        </div>
      </div>
    </div>
  );
}
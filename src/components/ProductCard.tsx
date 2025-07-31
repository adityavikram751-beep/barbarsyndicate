import React from 'react';
import Link from 'next/link';
import { MessageCircle, Eye } from 'lucide-react';
import { Product } from '@/data/products';


interface ProductCardProps {
  product: Product;
} 

export default function ProductCard({ product }: ProductCardProps) {


  const handleWhatsAppClick = () => {
    const message = `Hi! I'm interested in ${product.name}. Can you please provide more details?`;
    const phoneNumber = '919876543210'; // Replace with your actual WhatsApp number
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
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

        {/* Quantity Options */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Available Quantities
          </p>
          <div className="flex flex-wrap gap-2">
            {product.quantityOptions.map((option) => (
              <span
                key={option.type}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {option.type}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing (only for authenticated users) */}
      
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Wholesale Pricing
            </p>
            <div className="space-y-1">
              {product.quantityOptions.map((option) => (
                <div key={option.type} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{option.type}:</span>
                  <span className="font-semibold text-purple-600">₹{option.price}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-xs text-center">
              <span className="font-medium">Login required</span> to view pricing
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
          
        
            <button
           
              className="flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </button>
      
        </div>
      </div>
    </div>
  );
}
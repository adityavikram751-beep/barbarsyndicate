'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, User, Package, Star } from 'lucide-react';

interface Enquiry {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gstnumber: string;
    status: string;
  };
  productId: {
    _id: string;
    name: string;
    brand: string;
    categoryId: string;
    variants: { price: string; quantity: string; _id: string }[];
    description: string;
    isFeature: boolean;
    images: string[];
    points: string[];
  };
  AddedAt: string;
  __v: number;
}

export default function EnquiryPage() {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId) {
          setError('User ID not found in localStorage. Please log in.');
          setLoading(false);
          return;
        }

        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/enquiry/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          setEnquiry(result.data[0]);
        } else {
          setError(result.message || 'No enquiry data found.');
        }
      } catch (err: any) {
        setError(`Failed to fetch enquiry data: ${err.message}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (statusLower.includes('approved') || statusLower.includes('active')) return 'bg-green-100 text-green-800 border-green-200';
    if (statusLower.includes('completed')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (statusLower.includes('rejected') || statusLower.includes('cancelled')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enquiry details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">!</span>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No enquiry found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enquiry Details</h1>
              <p className="text-sm text-gray-600 mt-1">
                Enquiry ID: <span className="font-medium">#{enquiry._id}</span>
              </p>
            </div>
            <Badge className={`px-3 py-1 text-sm font-medium ${getStatusColor(enquiry.user_id.status)}`}>
              {enquiry.user_id.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - User & Enquiry Details */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Information Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">{enquiry.user_id.name}</p>
                  <p className="text-sm text-gray-600">Customer</p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href={`mailto:${enquiry.user_id.email}`} 
                         className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                        {enquiry.user_id.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a href={`tel:${enquiry.user_id.phone}`} 
                         className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                        {enquiry.user_id.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-sm text-gray-900">{enquiry.user_id.address}</p>
                    </div>
                  </div>
                  
                  {enquiry.user_id.gstnumber && (
                    <div>
                      <p className="text-sm text-gray-600">GST Number</p>
                      <p className="text-sm text-gray-900 font-mono">{enquiry.user_id.gstnumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Contact Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`mailto:${enquiry.user_id.email}`)}
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`tel:${enquiry.user_id.phone}`)}
                >
                  <Phone className="w-4 h-4" />
                  Call Customer
                </Button>
              </CardContent>
            </Card>

            {/* Enquiry Information */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Enquiry Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Enquiry Date</p>
                    <p className="text-sm text-gray-900">{formatDate(enquiry.AddedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={`mt-1 ${getStatusColor(enquiry.user_id.status)}`}>
                      {enquiry.user_id.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-8">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {/* Product Images */}
                  <div className="p-6 border-r border-gray-200">
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={enquiry.productId.images[selectedImageIndex] || '/placeholder-image.jpg'}
                          alt={enquiry.productId.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Thumbnail Images */}
                      {enquiry.productId.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {enquiry.productId.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => handleImageSelect(index)}
                              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImageIndex === index 
                                  ? 'border-blue-500 ring-2 ring-blue-200' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`${enquiry.productId.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="p-6 space-y-6">
                    {/* Product Title & Brand */}
                    <div>
                      <p className="text-sm text-gray-600 uppercase tracking-wide">{enquiry.productId.brand}</p>
                      <h2 className="text-2xl font-bold text-gray-900 mt-1">{enquiry.productId.name}</h2>
                      {enquiry.productId.isFeature && (
                        <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    {/* Price Variants */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Available Variants</h3>
                      <div className="space-y-2">
                        {enquiry.productId.variants.map((variant, index) => (
                          <div key={variant._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Variant {index + 1}</p>
                              <p className="text-sm text-gray-600">Quantity: {variant.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">₹{parseInt(variant.price).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Product Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{enquiry.productId.description}</p>
                    </div>

                    {/* Key Features */}
                    {enquiry.productId.points.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                        <ul className="space-y-2">
                          {enquiry.productId.points.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
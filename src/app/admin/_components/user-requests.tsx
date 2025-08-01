"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, X, Eye } from "lucide-react"

const userRequests = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    address: "123 Beauty St, Cosmetic City, CC 12345",
    gstNumber: "GST123456789",
    status: "pending" as const,
  },
  {
    id: 2,
    name: "Michael Chen",
    phone: "+1 (555) 987-6543",
    address: "456 Makeup Ave, Beauty Town, BT 67890",
    gstNumber: "GST987654321",
    status: "approved" as const,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    phone: "+1 (555) 456-7890",
    address: "789 Skincare Blvd, Wellness City, WC 54321",
    gstNumber: "GST456789123",
    status: "pending" as const,
  },
]

export function UserRequests() {
  const [requests, setRequests] = useState(userRequests)

  const handleApprove = (id: number) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: "approved" as const } : req)))
  }

  const handleReject = (id: number) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: "rejected" as const } : req)))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">User Requests</h1>
          <p className="text-rose-600">Manage wholesale account applications</p>
        </div>
      </div>

      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-rose-900">Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-rose-200">
                  <TableHead className="text-rose-700">Name</TableHead>
                  <TableHead className="text-rose-700">Phone</TableHead>
                  <TableHead className="text-rose-700 hidden md:table-cell">Address</TableHead>
                  <TableHead className="text-rose-700">GST Number</TableHead>
                  <TableHead className="text-rose-700">Status</TableHead>
                  <TableHead className="text-rose-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="border-rose-200">
                    <TableCell className="font-medium text-rose-900">{request.name}</TableCell>
                    <TableCell className="text-rose-700">{request.phone}</TableCell>
                    <TableCell className="text-rose-700 hidden md:table-cell">{request.address}</TableCell>
                    <TableCell className="text-rose-700">{request.gstNumber}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="border-rose-200">
                            <DialogHeader>
                              <DialogTitle className="text-rose-900">User Details</DialogTitle>
                              <DialogDescription>Complete information for {request.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-rose-700">Name</label>
                                <p className="text-rose-900">{request.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-rose-700">Phone</label>
                                <p className="text-rose-900">{request.phone}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-rose-700">Address</label>
                                <p className="text-rose-900">{request.address}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-rose-700">GST Number</label>
                                <p className="text-rose-900">{request.gstNumber}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

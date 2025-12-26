"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type UserRequestStatus = "pending" | "approved" | "rejected";

interface UserRequest {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  gstNumber: string;
  status: UserRequestStatus;
}

interface ApiUser {
  _id: string;
  name: string;
  phone: string;
  address: string;
  gstnumber: string;
  status: UserRequestStatus;
  email: string;
  password: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data?: ApiUser[];
  message?: string;
}

export function UserRequests() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<"all" | UserRequestStatus>("all");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem("adminToken");
        
        const response = await fetch('https://barber-syndicate.vercel.app/api/v1/user/all-users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            'Accept': 'application/json',
          },
        });

        const data: ApiResponse = await response.json();
        if (!data.success) throw new Error('Failed to fetch user data');

        const mappedRequests: UserRequest[] = data.data!.map(user => ({
          id: user._id,
          name: user.name,
          phone: user.phone,
          address: user.address,
          gstNumber: user.gstnumber,
          status: user.status,
        }));

        setRequests(mappedRequests);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user requests';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const user = requests.find(r => r.id === id);
      if (!user) throw new Error('User not found');

      const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/admin/approve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to approve user");

      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: "approved" } : r))
      );
      alert("User approved successfully");
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/admin/reject/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to reject user");

      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: "rejected" } : r))
      );
      alert("User rejected successfully");
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: UserRequestStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
    }
  }

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="p-6 space-y-6">
      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-rose-900 text-xl font-bold">User Applications</CardTitle>
          </div>

          {/* 🔽 Dropdown next to "User Applications" */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-rose-800"></span>
            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(value as "all" | UserRequestStatus)
              }
            >
              <SelectTrigger className="w-[140px] border-rose-300 text-rose-800 bg-white h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-100 text-red-700 border border-red-300 p-2 rounded mb-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-rose-700">Loading...</div>
          ) : (
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
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-rose-700 py-4"
                      >
                        No user requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
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
                                  <DialogDescription>Complete info for {request.name}</DialogDescription>
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
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(request.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

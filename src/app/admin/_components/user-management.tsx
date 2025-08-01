"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Filter } from "lucide-react"

const users = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@beautystore.com",
    phone: "+1 (555) 123-4567",
    status: "approved" as const,
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael@cosmeticshub.com",
    phone: "+1 (555) 987-6543",
    status: "pending" as const,
    joinDate: "2024-01-18",
    lastLogin: "Never",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily@skincarepro.com",
    phone: "+1 (555) 456-7890",
    status: "rejected" as const,
    joinDate: "2024-01-10",
    lastLogin: "2024-01-12",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david@makeupworld.com",
    phone: "+1 (555) 321-0987",
    status: "approved" as const,
    joinDate: "2024-01-05",
    lastLogin: "2024-01-19",
  },
]

export function UserManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredUsers = users.filter((user) => statusFilter === "all" || user.status === statusFilter)

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
          <h1 className="text-3xl font-bold text-rose-900">User Management</h1>
          <p className="text-rose-600">Manage all registered users and their access</p>
        </div>
      </div>

      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-rose-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-rose-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-rose-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-rose-200">
                  <TableHead className="text-rose-700">Name</TableHead>
                  <TableHead className="text-rose-700">Email</TableHead>
                  <TableHead className="text-rose-700 hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-rose-700">Status</TableHead>
                  <TableHead className="text-rose-700 hidden lg:table-cell">Join Date</TableHead>
                  <TableHead className="text-rose-700 hidden lg:table-cell">Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-rose-200">
                    <TableCell className="font-medium text-rose-900">{user.name}</TableCell>
                    <TableCell className="text-rose-700">{user.email}</TableCell>
                    <TableCell className="text-rose-700 hidden md:table-cell">{user.phone}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-rose-700 hidden lg:table-cell">{user.joinDate}</TableCell>
                    <TableCell className="text-rose-700 hidden lg:table-cell">{user.lastLogin}</TableCell>
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

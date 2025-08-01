"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Clock, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const statsData = [
  {
    title: "Total Users",
    value: "2,847",
    icon: Users,
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    title: "Approved Users",
    value: "2,234",
    icon: UserCheck,
    change: "+8%",
    changeType: "positive" as const,
  },
  {
    title: "Pending Approvals",
    value: "89",
    icon: Clock,
    change: "-5%",
    changeType: "negative" as const,
  },
  {
    title: "Active Sessions",
    value: "1,432",
    icon: Activity,
    change: "+23%",
    changeType: "positive" as const,
  },
]

const loginActivityData = [
  { name: "Mon", logins: 120 },
  { name: "Tue", logins: 190 },
  { name: "Wed", logins: 300 },
  { name: "Thu", logins: 250 },
  { name: "Fri", logins: 420 },
  { name: "Sat", logins: 180 },
  { name: "Sun", logins: 90 },
]

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">Dashboard</h1>
          <p className="text-rose-600">Welcome back! Here's your business overview.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="border-rose-200 bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-700">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-900">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === "positive" ? "text-emerald-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-rose-900">Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={loginActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" />
              <XAxis dataKey="name" stroke="#be185d" />
              <YAxis stroke="#be185d" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="logins"
                stroke="#e11d48"
                strokeWidth={3}
                dot={{ fill: "#e11d48", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

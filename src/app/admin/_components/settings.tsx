"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Lock, LogOut, Save } from "lucide-react"

export function Settings() {
  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@cosmeticstore.com",
    phone: "+1 (555) 000-0000",
  })

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleProfileSave = () => {
    // Handle profile update
    console.log("Profile updated:", profileData)
  }

  const handlePasswordChange = () => {
    // Handle password change
    console.log("Password changed")
    setPasswordData({ current: "", new: "", confirm: "" })
  }

  const handleLogout = () => {
    // Handle logout
    console.log("Logging out...")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">Settings</h1>
          <p className="text-rose-600">Manage your admin account and preferences</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-rose-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-rose-700">
                Full Name
              </Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-rose-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-rose-700">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <Button onClick={handleProfileSave} className="w-full bg-rose-600 hover:bg-rose-700">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-rose-900 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password" className="text-rose-700">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="text-rose-700">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-rose-700">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <Button onClick={handlePasswordChange} className="w-full bg-rose-600 hover:bg-rose-700">
              <Lock className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-rose-900">Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleLogout} variant="destructive" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

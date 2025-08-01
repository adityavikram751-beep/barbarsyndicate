"use client"

import { useState } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "./_components/admin-sidebar"
import { Dashboard } from "./_components/dashboard"
import { ProductManagement } from "./_components/product-management"
import { UserRequests } from "./_components/user-requests"
import { UserManagement } from "./_components/user-management"
import { Settings } from "./_components/settings"


export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "user-requests":
        return <UserRequests />
      case "products":
        return <ProductManagement />
      case "users":
        return <UserManagement />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">{renderContent()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

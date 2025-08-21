"use client"

import { useState, useEffect } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "./_components/admin-sidebar"
import { UserRequests } from "./_components/user-requests"
import { ProductManagement } from "./_components/product-management"
import Category from "./_components/category"
import UserEnquiry from "./_components/UserEnquiry"
import AdminLogin from "./login/page"
import Brands from "./_components/brands"



export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (token) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [])


  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setActiveSection("dashboard")
  }



  const renderContent = () => {
    switch (activeSection) {


    
      case "user-requests":
        return <UserRequests />

      case "products":
        return <ProductManagement />

      case "category":
        return <Category />
         case "brands":
        return <Brands />

      case "user-enquiry":
        return <UserEnquiry />

   
      default:
        return <ProductManagement />
    }
  }


  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
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

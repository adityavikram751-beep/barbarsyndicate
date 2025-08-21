"use client"

import { BarChart3, Package, Settings, ShoppingBag, Users, UserCheck } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [

  {
    title: "User Requests",
    icon: UserCheck,
    id: "user-requests",
  },
  {
    title: "Product Management",
    icon: Package,
    id: "products",
  },
   {
    title: "Category Management",
    icon: Package,
    id: "category",
  },
  {
    title: "User Enquiry",
    icon: Users,
    id: "user-enquiry",
  },

  {
    title: "Settings",
    icon: Settings,
    id: "settings",
  },
]

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AdminSidebar({ activeSection, setActiveSection }: AdminSidebarProps) {
  return (
    <Sidebar className="border-r border-rose-200">
      <SidebarHeader className="border-b border-rose-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-500">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rose-900">Cosmetic Admin</h2>
            <p className="text-sm text-rose-600">Wholesale Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full justify-start gap-3 px-3 py-2 text-rose-700 hover:bg-rose-100 hover:text-rose-900 data-[active=true]:bg-rose-200 data-[active=true]:text-rose-900"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

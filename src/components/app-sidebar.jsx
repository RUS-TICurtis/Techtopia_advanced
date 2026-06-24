"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { hasPermission } from "@/services/auth/authService"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Building, ShieldCheck } from "lucide-react"

import { WORKSPACE_GROUPS, WORKSPACE_ITEMS } from "@/components/layout/config/sidebar.workspace.config"

export function AppSidebar({
  ...props
}) {
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  // 1. Configure Tenants / Teams
  const teams = [
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: "Techtopia Corp", plan: "HQ", logo: <Building size={16} className="text-[#38BDF8]" /> },
    { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: "Acme Enterprises", plan: "Enterprise", logo: <Building size={16} className="text-[#38BDF8]" /> },
  ];

  if (user?.role === 'super_admin' || user?.role === 'platform_owner') {
    teams.push({
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      name: "Platform Super Admin",
      plan: "Platform Operator",
      logo: <ShieldCheck size={16} className="text-[#EF4444]" />
    });
  }

  // Find active team from localStorage
  const tenantId = localStorage.getItem('crm_tenant_id') || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const activeTeam = teams.find(t => t.id === tenantId) || teams[0];

  // Reorder teams so active is first, or just let TeamSwitcher handle it (we pass teams array, it manages its own state, but we should initialize it)
  // Wait, TeamSwitcher initializes to `teams[0]`. So let's reorder:
  const sortedTeams = [activeTeam, ...teams.filter(t => t.id !== activeTeam.id)];

  // 2. Build Navigation Data
  // Determine active item
  const activeItem = WORKSPACE_ITEMS.find(item => 
    item.url === location.pathname || 
    (item.url !== '/' && location.pathname.startsWith(item.url))
  );
  const activeGroupId = activeItem ? activeItem.group : 'core';

  // Filter items by permission
  const filteredItems = WORKSPACE_ITEMS.filter(item => {
    return !item.permission || hasPermission(user, item.permission);
  });

  const navMain = [];
  const projects = [];

  WORKSPACE_GROUPS.forEach(group => {
    const items = filteredItems.filter(item => item.group === group.id);
    if (items.length === 0) return;

    const GroupIcon = group.icon;
    
    // We can decide to put some groups in 'projects' if we want. For now, everything goes to navMain.
    if (group.id === 'projects') {
      // Add items individually as projects
      items.forEach(item => {
        projects.push({
          name: item.label,
          url: item.url,
          icon: <GroupIcon size={16} />,
          isActive: item.id === activeItem?.id
        });
      });
    } else {
      navMain.push({
        title: group.label,
        url: "#",
        icon: <GroupIcon size={16} />,
        isActive: group.id === activeGroupId,
        items: items.map(item => ({
          title: item.label,
          url: item.url,
          isActive: item.id === activeItem?.id
        }))
      });
    }
  });

  // Construct user prop
  const userData = {
    name: user?.name || "Operator",
    email: user?.email || "",
    avatar: user?.avatarUrl || user?.avatar || "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sortedTeams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {projects.length > 0 && <NavProjects projects={projects} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

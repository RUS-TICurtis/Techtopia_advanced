import React from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import CommandPalette from '../ui/CommandPalette';
import AICopilot from '../ui/AICopilot';
import NotificationCenter from './NotificationCenter';
import { Toaster } from 'react-hot-toast';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function AppLayout({ 
  children,
  theme,
  toggleTheme,
}) {
  return (
    <SidebarProvider>
      <div className="app-wrapper flex w-full h-screen overflow-hidden">
        {/* Toast Notification Provider */}
        <Toaster position="bottom-right" reverseOrder={false} />

        {/* Global Interactive Utilities */}
        <CommandPalette />
        <AICopilot />
        <NotificationCenter />

        <AppSidebar theme={theme} />

        <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden">
          <Navbar 
            theme={theme} 
            toggleTheme={toggleTheme} 
          />

          <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
            {children}
          </main>
          
          <BottomNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

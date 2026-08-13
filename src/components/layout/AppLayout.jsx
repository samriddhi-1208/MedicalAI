import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans relative">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header collapsed={collapsed} />
      <main
        className={`pt-20 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-200 flex-1 w-full max-w-7xl mx-auto ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};

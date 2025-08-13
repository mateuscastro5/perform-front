import React from 'react';

interface NavigationMenuProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NavigationMenu = ({ 
  activeTab = 'Home', 
  onTabChange 
}: NavigationMenuProps) => {
  const menuItems = [
    { id: 'home', label: 'Home', active: true },
    { id: 'squads', label: 'Squads', active: false },
    { id: 'developers', label: 'Developers', active: false },
    { id: 'projects', label: 'Projects', active: false },
  ];

  return (
    <nav className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange?.(item.id)}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
            item.id === activeTab.toLowerCase()
              ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default NavigationMenu;

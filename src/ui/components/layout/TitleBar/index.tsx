import React, { useEffect, useState } from 'react';
import AlphaLogo from '@assets/AlphaLogo.png';
import NavigationMenu from './NavigationMenu';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';
import WindowControls from './WindowControls';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.window.onMaximized(() => {
        setIsMaximized(true);
      });
      
      window.electronAPI.window.onUnmaximized(() => {
        setIsMaximized(false);
      });
    }
  }, []);

  const handleMinimize = async () => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.window.minimize();
      } catch (error) {
        console.error('Error minimizing:', error);
      }
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.window.maximize();
      } catch (error) {
        console.error('Error maximizing:', error);
      }
    }
  };

  const handleClose = async () => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.window.close();
      } catch (error) {
        console.error('Error closing:', error);
      }
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // TODO: Implement search
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    // TODO: Open settings
  };

  return (
    <div className="bg-gradient-to-r from-[#13151b] to-[#1a1c23] border-b border-slate-700/50 select-none shadow-lg">
      <div 
        className="h-8 flex items-center justify-between px-4 my-3"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div className="flex items-center gap-2">
          <img src={AlphaLogo} alt="alphaSights Insights" className="w-5 h-5" />
          <span className="text-white text-xs font-bold uppercase">alphaSights</span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md mx-4" style={{ WebkitAppRegion: 'no-drag' }}>
          <button className="w-6 h-6 rounded-md hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-6 h-6 rounded-md hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        <div className="flex" style={{ WebkitAppRegion: 'no-drag' }}>
          <WindowControls
            isMaximized={isMaximized}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
          />
        </div>
      </div>

      <div 
        className="h-12 flex items-center justify-center relative px-6"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div style={{ WebkitAppRegion: 'no-drag' }}>
          <NavigationMenu 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="absolute right-6 flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
          <UserProfile onSettingsClick={handleSettingsClick} />
        </div>
      </div>
    </div>
  );
};

export default TitleBar;

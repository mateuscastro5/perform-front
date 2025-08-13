import { Button } from '../../ui/base-components';
import { cn } from '../../../lib/design-system';

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
    <nav className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as never}>
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="sm"
          onClick={() => onTabChange?.(item.id)}
          className={cn(
            'text-sm font-medium px-4 py-2 transition-colors',
            item.id === activeTab.toLowerCase()
              ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
          )}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
};

export default NavigationMenu;

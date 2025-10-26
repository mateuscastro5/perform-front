import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Settings, Minus, Square, X, User, LogOut } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/ui/dropdown-menu";
import { useAuth } from "@/ui/contexts/AuthContext";

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const DashboardHeader = ({ activeTab, onTabChange }: DashboardHeaderProps) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  const handleTabChange = (value: string) => {
    onTabChange(value);
    if (value === "home") {
      navigate("/");
    } else if (value === "developers") {
      navigate("/developers");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md select-none">
      {/* Window Controls Bar - Draggable area */}
      <div 
        className="h-8 flex items-center justify-end px-2"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-10 hover:bg-muted/50 rounded-none"
            onClick={handleMinimize}
            title="Minimizar"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-10 hover:bg-muted/50 rounded-none"
            onClick={handleMaximize}
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            <Square className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-10 hover:bg-destructive/90 hover:text-destructive-foreground rounded-none"
            onClick={handleClose}
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="border-b border-border/50">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-primary">Perform</span>
            </h1>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 max-w-md mx-8">
            <TabsList className="w-full bg-muted/30">
              <TabsTrigger value="home" className="flex-1">Home</TabsTrigger>
              <TabsTrigger value="squads" className="flex-1">Squads</TabsTrigger>
              <TabsTrigger value="developers" className="flex-1">Developers</TabsTrigger>
              <TabsTrigger value="projects" className="flex-1">Projects</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Bar */}
          <div className="relative w-full max-w-xs mx-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects, commits, developers..."
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 ml-2 pl-3 border-l border-border/50 hover:opacity-80 transition-opacity cursor-pointer outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-foreground">John Doe</span>
                  <span className="text-xs text-muted-foreground">Tech Lead</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Editar Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </header>
);
};
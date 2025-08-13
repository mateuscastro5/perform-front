import { Minus, Maximize, Minimize, X } from "lucide-react";
import { Button } from "../../ui/base-components";

interface WindowControlsProps {
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

const WindowControls = ({
  isMaximized = false,
  onMinimize,
  onMaximize,
  onClose
}: WindowControlsProps) => {
  return (
    <div className="flex">
      <Button 
        variant="ghost" 
        size="sm"
        className="w-8 h-8 p-0 hover:bg-gray-600/30"
        onClick={onMinimize}
        title="Minimizar"
      >
        <Minus className="w-3 h-3" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="w-8 h-8 p-0 hover:bg-gray-600/30"
        onClick={onMaximize}
        title={isMaximized ? "Restaurar" : "Maximizar"}
      >
        {isMaximized ? (
          <Minimize className="w-3 h-3" />
        ) : (
          <Maximize className="w-3 h-3" />
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="w-8 h-8 p-0 hover:bg-red-600/60"
        onClick={onClose}
        title="Fechar"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default WindowControls;

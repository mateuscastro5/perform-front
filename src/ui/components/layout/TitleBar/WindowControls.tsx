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
      <button 
        className="w-8 h-8 hover:bg-gray-600/30 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
        onClick={onMinimize}
        title="Minimizar"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      
      <button 
        className="w-8 h-8 hover:bg-gray-600/30 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
        onClick={onMaximize}
        title={isMaximized ? "Restaurar" : "Maximizar"}
      >
        {isMaximized ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          </svg>
        )}
      </button>
      
      <button 
        className="w-8 h-8 hover:bg-red-600/60 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
        onClick={onClose}
        title="Fechar"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default WindowControls;

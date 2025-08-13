import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ 
  placeholder = "Search projects, commits, developers...",
  onSearch 
}: SearchBarProps) => {
  return (
    <div className="relative w-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <Search className="h-3 w-3 text-slate-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="w-full pl-7 pr-3 py-1 bg-slate-800/60 border border-slate-700/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-colors"
      />
    </div>
  );
};

export default SearchBar;

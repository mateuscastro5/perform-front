interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ 
  placeholder = "Search projects, commits, developers...",
  onSearch 
}: SearchBarProps) => {
  return (
    <div className="relative w-full" style={{ WebkitAppRegion: 'no-drag' }}>
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="w-full pl-7 pr-3 py-1 bg-slate-700/50 border border-slate-600/30 rounded-md text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
      />
    </div>
  );
};

export default SearchBar;

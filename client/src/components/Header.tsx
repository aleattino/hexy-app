interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const handleHomeClick = () => {
    window.location.href = '/';
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-auto md:min-w-[500px] z-40 flex items-center justify-between px-3 py-2 glass rounded-full">
      
      <button 
        onClick={handleHomeClick}
        className="flex items-center gap-2 px-3 py-2 -ml-1 active:scale-95 transition-all duration-150 rounded-full hover:bg-foreground/5"
      >
        <img src="/hexy_logo.png" alt="Hexy" className="w-6 h-6 object-contain" />
        <span className="text-foreground text-base font-bold leading-none tracking-tight">Hexy</span>
      </button>
      
      
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center w-9 h-9 active:scale-95 transition-all duration-150 rounded-full hover:bg-foreground/5"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
}


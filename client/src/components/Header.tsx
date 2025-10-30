interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const handleHomeClick = () => {
    window.location.href = '/';
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-auto md:min-w-[500px] z-40 flex items-center justify-between px-4 py-2.5" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      borderRadius: '9999px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)'
    }}>
      <button 
        onClick={handleHomeClick}
        className="flex items-center gap-2 px-4 py-2 active:scale-95 transition-all duration-200 ease-out rounded-full"
      >
        <img src="/hexy_logo.png" alt="Hexy" className="w-6 h-6 object-contain" />
        <span className="text-foreground text-base font-bold leading-none">Hexy</span>
      </button>
      
      {/* Hamburger Menu Button */}
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center w-9 h-9 active:scale-95 transition-all duration-200 ease-out rounded-full"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
}


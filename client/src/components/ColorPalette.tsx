import { useState, useEffect } from "react";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

interface ColorPaletteProps {
  colors: Color[];
  onViewFullPalette?: () => void;
}

export default function ColorPalette({ colors, onViewFullPalette }: ColorPaletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const handleCopyColor = async (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setCopiedColor(hex);
    setTimeout(() => {
      setCopiedColor(null);
    }, 2000);
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(hex);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = hex;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      // Silent fail
    }
  };

  return (
    <div className="space-y-4 p-4 overflow-hidden relative">
      {copiedColor && (
        <div 
          className="fixed top-28 md:top-32 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 max-w-[calc(100vw-2rem)]"
          style={{
            animation: 'slideDownCentered 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            willChange: 'transform, opacity'
          }}
        >
          <div className="px-6 py-3 rounded-full shadow-2xl flex items-center gap-3" style={{
            backgroundColor: isDark ? 'rgba(47, 47, 47, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}>
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              Copied {copiedColor}
            </span>
          </div>
        </div>
      )}

      {/* Color Grid */}
      <div className="grid grid-cols-5 gap-3">
        {colors.slice(0, 5).map((color, index) => (
          <div
            key={color.hex}
            onClick={(e) => handleCopyColor(color.hex, e)}
            className="cursor-pointer active:scale-95 transition-all duration-200 ease-out animate-in fade-in"
            style={{ animationDelay: `${index * 0.05}s`, animationDuration: '400ms' }}
          >
            <div className="flex flex-col gap-2 items-center">
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
                    copiedColor === color.hex ? 'ring-4 ring-green-500 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                {/* Copied Indicator on Color */}
                {copiedColor === color.hex && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full animate-in fade-in zoom-in-95 duration-200">
                    <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-foreground text-[10px] font-bold leading-tight font-mono break-all text-center">
                {color.hex.toUpperCase()}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* View Full Palette Button - only show if there are more than 5 colors */}
      {onViewFullPalette && colors.length > 5 && (
        <button
          onClick={onViewFullPalette}
          className="w-full p-4 active:scale-95 transition-all duration-200 ease-out group flex items-center justify-center gap-2 animate-in fade-in view-palette-button"
          style={{ 
            animationDelay: "0.3s", 
            animationDuration: '400ms'
          }}
        >
          <span className="text-foreground font-bold text-sm">View Full Palette</span>
          <svg className="w-5 h-5 text-foreground transition-transform duration-200 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}


import { useState } from "react";

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
      
    }
  };

  return (
    <div className="space-y-4 overflow-hidden relative">
      {copiedColor && (
        <div 
          className="fixed top-28 md:top-32 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 max-w-[calc(100vw-2rem)]"
          style={{
            animation: 'slideDownCentered 200ms cubic-bezier(0.25, 1, 0.5, 1)',
            willChange: 'transform, opacity'
          }}
        >
          <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#10b981' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              Copied {copiedColor}
            </span>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-4">
        <div className="grid grid-cols-5 gap-3">
          {colors.slice(0, 5).map((color, index) => (
            <button
              key={color.hex}
              onClick={(e) => handleCopyColor(color.hex, e)}
              className="flex flex-col gap-2 items-center cursor-pointer active:scale-95 transition-all duration-150 animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-full border-2 transition-all duration-150 ${
                    copiedColor === color.hex ? 'border-success scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                {copiedColor === color.hex && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full animate-fade-in">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-foreground text-[10px] font-semibold leading-tight font-mono break-all text-center" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {color.hex.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {onViewFullPalette && colors.length > 5 && (
        <button
          onClick={onViewFullPalette}
          className="w-full px-6 py-4 active:scale-[0.98] transition-all duration-150 group flex items-center justify-center gap-2 view-palette-button animate-fade-in rounded-full"
          style={{ animationDelay: "150ms" }}
        >
          <span className="text-foreground font-semibold text-sm">View Full Palette ({colors.length} colors)</span>
          <svg className="w-4 h-4 text-foreground transition-transform duration-150 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}


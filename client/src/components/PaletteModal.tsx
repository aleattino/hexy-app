import { useEffect, useState, useRef } from "react";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

interface PaletteModalProps {
  colors: Color[];
  isOpen: boolean;
  onClose: () => void;
}

export default function PaletteModal({
  colors,
  isOpen,
  onClose,
}: PaletteModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const minSwipeDistance = 50;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > minSwipeDistance;
    
    if (isDownSwipe) {
      handleClose();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
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

  const handleCopyColor = async (hex: string, index: number) => {
    setCopiedItem(`hex-${index}`);
    setTimeout(() => setCopiedItem(null), 2000);
    await copyToClipboard(hex);
  };

  const handleCopyRgb = async (rgb: { r: number; g: number; b: number }, index: number) => {
    const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    setCopiedItem(`rgb-${index}`);
    setTimeout(() => setCopiedItem(null), 2000);
    await copyToClipboard(rgbString);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {copiedItem && (
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
              {copiedItem?.startsWith('hex-') ? 'Copied HEX' : 'Copied RGB'}
            </span>
          </div>
        </div>
      )}

      <div
        className={`modal-backdrop ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleBackdropClick}
      />

      <div
        className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none"
        onClick={handleBackdropClick}
      >
        <div
          className={`w-full md:max-w-2xl pointer-events-auto ${
            isClosing ? "animate-slide-down-ios" : "animate-slide-up-ios"
          }`}
          onClick={handleBackdropClick}
        >
          <div 
            ref={modalRef}
            className="glass-card rounded-t-[2rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
          <div 
            className="flex justify-center md:hidden cursor-grab active:cursor-grabbing py-3 -mx-4 md:-mx-8 px-4 md:px-8 mb-1 sm:mb-3"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: 'pan-y' }}
          >
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 pointer-events-none"></div>
          </div>

          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                Your Color Palette
              </h2>
              <p className="text-xs sm:text-sm text-secondary-foreground">
                {colors.length} colors extracted
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl glass-card active:scale-95 transition-transform duration-200 ease-out"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Color Grid */}
          <div className="max-h-[calc(90vh-180px)] sm:max-h-[calc(85vh-220px)] overflow-y-auto space-y-3 hide-scrollbar-mobile">
            {colors.map((color, index) => (
              <div
                key={`${color.hex}-${index}`}
                className="glass-card rounded-3xl p-4 animate-in fade-in"
                style={{ animationDelay: `${index * 0.03}s`, animationDuration: '300ms' }}
              >
                <div className="flex items-center gap-4">
                  {/* Color Preview */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-14 h-14 rounded-full shadow-lg transition-transform duration-200 ease-out"
                      style={{ backgroundColor: color.hex }}
                    />
                  </div>

                  {/* Color Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-bold text-foreground font-mono truncate">
                        {color.hex.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-foreground font-mono">
                      RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                    </p>
                  </div>

                  {/* Copy Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopyColor(color.hex, index)}
                      className="relative p-3 glass-card rounded-2xl active:scale-95 transition-all duration-200 ease-out"
                      aria-label="Copy HEX"
                      title="Copy HEX"
                    >
                      {copiedItem === `hex-${index}` ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyRgb(color.rgb, index)}
                      className="relative px-3 py-2 glass-card rounded-2xl active:scale-95 transition-all duration-200 ease-out"
                      aria-label="Copy RGB"
                      title="Copy RGB"
                    >
                      {copiedItem === `rgb-${index}` ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-foreground text-xs font-bold">
                          RGB
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}


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
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle scroll to show/hide gradients
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    // Show top gradient if scrolled down
    setShowTopGradient(scrollTop > 10);
    
    // Show bottom gradient if not at bottom
    setShowBottomGradient(scrollTop + clientHeight < scrollHeight - 10);
  };

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Check if bottom gradient should show on mount
  useEffect(() => {
    if (isOpen && !isClosing) {
      setTimeout(() => {
        const scrollContainer = document.querySelector('.palette-scroll');
        if (scrollContainer) {
          const hasOverflow = scrollContainer.scrollHeight > scrollContainer.clientHeight;
          setShowBottomGradient(hasOverflow);
          setShowTopGradient(false);
        }
      }, 100);
    }
  }, [isOpen, isClosing, colors.length]);

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
            className="glass-card rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
          
          <div 
            className="flex justify-center md:hidden cursor-grab active:cursor-grabbing py-2 -mx-6 px-6 mb-4"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: 'pan-y' }}
          >
            <div className="w-12 h-1 rounded-full bg-border pointer-events-none"></div>
          </div>

          
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
                Your Palette
              </h2>
              <p className="text-sm text-secondary-foreground">
                {colors.length} colors extracted
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full border border-border hover:border-foreground hover:bg-secondary active:scale-95 transition-all duration-150"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          
          <div className="relative">
            
            {showTopGradient && (
              <div className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none transition-opacity duration-200" style={{
                background: 'linear-gradient(to bottom, var(--card) 0%, transparent 100%)'
              }}></div>
            )}
            
            
            <div className="max-h-[calc(90vh-200px)] sm:max-h-[calc(85vh-220px)] overflow-y-auto space-y-3 hide-scrollbar-mobile palette-scroll" onScroll={handleScroll}>
              {colors.map((color, index) => (
              <div
                key={`${color.hex}-${index}`}
                className="glass-card rounded-xl p-4 animate-fade-in"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="flex items-center gap-4">
                  
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                  </div>

                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold text-foreground font-mono truncate" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {color.hex.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-foreground font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                    </p>
                  </div>

                  
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopyColor(color.hex, index)}
                      className="p-2.5 border border-border rounded-full hover:border-foreground hover:bg-secondary active:scale-95 transition-all duration-150 min-w-[44px] flex items-center justify-center"
                      aria-label="Copy HEX"
                      title="Copy HEX"
                    >
                      <svg className={`w-5 h-5 ${copiedItem === `hex-${index}` ? 'text-success' : 'text-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {copiedItem === `hex-${index}` ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => handleCopyRgb(color.rgb, index)}
                      className="px-3 py-2.5 border border-border rounded-full hover:border-foreground hover:bg-secondary active:scale-95 transition-all duration-150 min-w-[60px] flex items-center justify-center"
                      aria-label="Copy RGB"
                      title="Copy RGB"
                    >
                      {copiedItem === `rgb-${index}` ? (
                        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-foreground text-xs font-bold font-mono">
                          RGB
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
            
            
            {showBottomGradient && (
              <div className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none transition-opacity duration-200" style={{
                background: 'linear-gradient(to top, var(--card) 0%, transparent 100%)'
              }}></div>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}


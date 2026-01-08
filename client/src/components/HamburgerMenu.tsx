import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

interface PaletteEntry {
  id: string;
  colors: Color[];
  timestamp: number;
  imageDataUrl?: string;
}

interface PaletteHistory {
  history: PaletteEntry[];
  savePalette: (colors: Color[], imageDataUrl?: string) => void;
  deletePalette: (id: string) => void;
  clearHistory: () => void;
}

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  paletteHistory: PaletteHistory;
  onLoadPalette: (colors: Color[]) => void;
}

export default function HamburgerMenu({ isOpen, onClose, paletteHistory, onLoadPalette }: HamburgerMenuProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
      setShowAbout(false);
      setShowHistory(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      
      <div
        className={`modal-backdrop ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 z-[60] ${
          isClosing ? "animate-slide-right-out" : "animate-slide-right-in"
        }`}
      >
        <div className="bg-background/95 backdrop-blur-xl border-l border-border h-full flex flex-col">
          
          <div className="flex items-center justify-between px-6 py-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img src="/hexy_logo.png" alt="Hexy" className="w-10 h-10 object-contain" />
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Hexy</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full border border-border hover:border-foreground hover:bg-secondary active:scale-95 transition-all duration-150 flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          
          {!showAbout && !showHistory ? (
            <div className="flex-1 px-6 py-6 space-y-3 overflow-y-auto">
              
              <div className="border border-border rounded-xl p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      {theme === "dark" ? (
                        <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">Appearance</div>
                      <div className="text-xs text-secondary-foreground">{theme === "dark" ? "Dark" : "Light"} mode</div>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      className="input"
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                    />
                    <span className="slider">
                      <span className="sun">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <g fill="#ffd43b">
                            <circle r="5" cy="12" cx="12"></circle>
                            <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="moon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                          <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
                        </svg>
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              
              <button
                onClick={() => setShowHistory(true)}
                className="w-full border border-border rounded-xl p-4 bg-card flex items-center justify-between hover:border-foreground hover:bg-secondary active:scale-[0.98] transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-foreground font-semibold">History</div>
                    <div className="text-xs text-secondary-foreground">{paletteHistory.history.length} saved palette{paletteHistory.history.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              
              <button
                onClick={() => setShowAbout(true)}
                className="w-full border border-border rounded-xl p-4 bg-card flex items-center justify-between hover:border-foreground hover:bg-secondary active:scale-[0.98] transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-foreground font-semibold">About</div>
                    <div className="text-xs text-secondary-foreground">Learn more about Hexy</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : showHistory ? (
            /* History Section */
            <div className="flex-1 flex flex-col overflow-hidden">
              
              <div className="px-6 py-4 flex-shrink-0 border-b border-border">
                <button
                  onClick={() => setShowHistory(false)}
                  className="flex items-center gap-2 text-foreground hover:text-accent active:scale-95 transition-all duration-150"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-semibold">Back</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Palette History</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-foreground">
                      {paletteHistory.history.length} saved palette{paletteHistory.history.length !== 1 ? 's' : ''}
                    </p>
                    {paletteHistory.history.length > 0 && (
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="text-xs text-destructive hover:text-destructive/80 font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {                /* History List */}
                {paletteHistory.history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-foreground font-semibold">No saved palettes yet</p>
                    <p className="text-sm text-secondary-foreground mt-1">Upload an image to create your first palette</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paletteHistory.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="border border-border rounded-xl overflow-hidden bg-card"
                      >
                        
                        {entry.imageDataUrl && (
                          <div className="relative w-full aspect-video bg-secondary overflow-hidden">
                            <img
                              src={entry.imageDataUrl}
                              alt="Palette source"
                              className="w-full h-full object-contain"
                              loading="lazy"
                              decoding="async"
                            />
                            
                            <div 
                              className="absolute bottom-0 left-0 right-0 h-1.5"
                              style={{
                                background: `linear-gradient(to right, ${entry.colors.map(c => c.hex).join(', ')})`
                              }}
                            />
                          </div>
                        )}

                        
                        <div className="p-4 space-y-3">
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-secondary-foreground font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => paletteHistory.deletePalette(entry.id)}
                              className="text-destructive hover:text-destructive/80 active:scale-95 transition-all duration-150"
                              aria-label="Delete palette"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          
                          <div className="flex gap-2 flex-wrap">
                            {entry.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full border-2 border-border flex-shrink-0"
                                style={{ backgroundColor: color.hex }}
                                title={color.hex}
                              />
                            ))}
                          </div>

                          
                          <button
                            onClick={() => {
                              onLoadPalette(entry.colors);
                              handleClose();
                            }}
                            className="w-full py-2.5 px-4 bg-accent text-accent-foreground hover:bg-opacity-90 rounded-full text-sm font-semibold active:scale-[0.98] transition-all duration-150"
                          >
                            Load Palette
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* About Section */
            <div className="flex-1 flex flex-col overflow-hidden">
              
              <div className="px-6 py-4 flex-shrink-0 border-b border-border">
                <button
                  onClick={() => setShowAbout(false)}
                  className="flex items-center gap-2 text-foreground hover:text-accent active:scale-95 transition-all duration-150"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-semibold">Back</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-6">
                
                <div className="text-center space-y-3">
                  <img src="/hexy_logo.png" alt="Hexy" className="w-20 h-20 mx-auto object-contain" />
                  <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Hexy</h3>
                    <p className="text-sm text-secondary-foreground">Color Palette Generator</p>
                  </div>
                </div>

                
                <div className="border border-border rounded-xl p-5 bg-card">
                  <p className="text-secondary-foreground leading-relaxed text-center">
                    A color palette generator that extracts dominant colors from images using k-means clustering algorithms.
                  </p>
                </div>

                
                <div className="border border-border rounded-xl p-5 bg-card space-y-4">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Features
                  </h4>
                  <ul className="space-y-3 text-sm text-secondary-foreground">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Extract dominant colors from images</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Copy HEX and RGB color values</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Dark and light theme support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Fully responsive interface</span>
                    </li>
                  </ul>
                </div>

                
                <div className="border border-border rounded-xl p-5 bg-card space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privacy
                  </h4>
                  <p className="text-sm text-secondary-foreground leading-relaxed">
                    Your images are <span className="font-semibold text-foreground">processed locally</span> in your browser. No data is sent to any server. Everything happens on your device for complete privacy.
                  </p>
                </div>

                
                <div className="text-center space-y-3 pt-2 pb-2">
                  <p className="text-sm text-secondary-foreground">
                    Developed by{' '}
                    <span className="font-semibold text-foreground">Alessandro Attino</span>
                  </p>
                  <p className="text-sm text-secondary-foreground">
                    Open source on{' '}
                    <a 
                      href="https://github.com/aleattino/hexy-app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline font-semibold"
                    >
                      GitHub
                    </a>
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg border border-border bg-secondary text-xs font-semibold text-foreground font-mono">
                      v1.1.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
      {showClearConfirm && (
        <>
          
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] animate-in fade-in duration-200"
            onClick={() => setShowClearConfirm(false)}
          />
          
          
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="glass-card rounded-2xl p-6 max-w-sm w-full animate-fade-in pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4">
                
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Clear All History?</h3>
                  <p className="text-sm text-secondary-foreground leading-relaxed">
                    This will permanently delete all {paletteHistory.history.length} saved palette{paletteHistory.history.length !== 1 ? 's' : ''}. This action cannot be undone.
                  </p>
                </div>

                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-3 px-4 rounded-full border border-border bg-card hover:bg-secondary text-foreground font-semibold active:scale-[0.98] transition-all duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      paletteHistory.clearHistory();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-full bg-destructive hover:opacity-90 text-white font-semibold active:scale-[0.98] transition-all duration-150"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}



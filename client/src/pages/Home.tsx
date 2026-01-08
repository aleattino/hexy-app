import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import ColorPalette from "@/components/ColorPalette";
import PaletteModal from "@/components/PaletteModal";
import HamburgerMenu from "@/components/HamburgerMenu";
import HexyAnimation from "@/components/HexyAnimation";
import { useColorExtractor } from "@/hooks/useColorExtractor";
import { usePaletteHistory } from "@/hooks/usePaletteHistory";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { extractColors, isLoading, error } = useColorExtractor();
  const paletteHistory = usePaletteHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (file: File) => {
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setColors([]);

    try {
      // Extract colors from image
      const extractedColors = await extractColors(file);
      setColors(extractedColors);
      
      // Save to history with an optimized thumbnail
      if (extractedColors.length > 0) {
        // Create an optimized thumbnail for faster loading
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Create a small thumbnail (max 400px width to reduce file size)
          const maxWidth = 400;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL with reduced quality for faster loading
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
          paletteHistory.savePalette(extractedColors, thumbnailUrl);
          
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
      }
    } catch (err) {
      console.error("Error extracting colors:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageSelect(files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setColors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      handleImageSelect(files[0]);
    }
  };

  // Paste from clipboard handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImageSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const showEmptyState = !previewUrl && colors.length === 0 && !isLoading;
  const showPopulatedState = (previewUrl || colors.length > 0) && !isLoading;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background overflow-x-hidden">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <div className="flex flex-1 flex-col items-center justify-start pt-24 md:pt-24">
        <div className="flex w-full max-w-[960px] flex-col gap-6 px-4 pb-6 md:pb-12">
            <main className="flex flex-col gap-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
              />

              
              {showEmptyState && (
                <div 
                  className={`relative flex flex-col items-center gap-6 py-8 md:py-12 px-4 rounded-2xl transition-all duration-150 ${
                    isDragging ? 'bg-accent/5 border-2 border-dashed border-accent' : 'border-2 border-transparent'
                  }`}
                  id="empty-state"
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  
                  <HexyAnimation />
                  
                  
                  <div className="flex max-w-[480px] flex-col items-center gap-3">
                    <h1 className="text-foreground text-2xl md:text-3xl font-bold leading-tight tracking-tight text-center">
                      {isDragging ? "Drop your image here" : "Extract Colors from Any Image"}
                    </h1>
                    <p className="text-secondary-foreground text-sm md:text-base leading-relaxed text-center max-w-[360px]">
                      {isDragging ? "Release to upload" : "Upload, drag & drop, or paste an image"}
                    </p>
                  </div>
                  
                  
                  <button
                    onClick={handleUploadClick}
                    className="px-8 py-4 active:scale-[0.98] transition-all duration-150 group upload-button rounded-full"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="font-semibold text-base">Upload Image</span>
                    </div>
                  </button>
                </div>
              )}

              
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 md:py-16 gap-6 animate-fade-in">
                  {previewUrl && (
                    <div className="w-full">
                      <div className="relative rounded-2xl overflow-hidden w-full max-w-[600px] mx-auto border border-border">
                        <img
                          src={previewUrl}
                          alt="Processing"
                          className="w-full h-auto object-contain opacity-50"
                        />
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                          <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                            <p className="text-sm text-foreground font-semibold">Extracting colors...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!previewUrl && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="glass-card p-6 rounded-2xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                      </div>
                      <p className="text-base text-foreground font-semibold">Extracting colors...</p>
                    </div>
                  )}
                </div>
              )}

              
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-destructive font-semibold">{error}</p>
                  </div>
                </div>
              )}

              
              {showPopulatedState && (
                <div className="flex flex-col gap-6 animate-fade-in" id="populated-state">
                  {previewUrl && (
                    <div className="relative">
                      <div className="relative rounded-2xl overflow-hidden w-full max-w-[600px] mx-auto border border-border group">
                        <img
                          src={previewUrl}
                          alt="Uploaded"
                          className="w-full h-auto object-contain"
                        />
                        
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={handleUploadClick}
                            className="px-4 py-2 text-foreground text-sm font-semibold active:scale-95 transition-all duration-150 flex items-center gap-2 overlay-button rounded-full"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Change
                          </button>
                          <button
                            onClick={handleClear}
                            className="p-2 text-foreground active:scale-95 transition-all duration-150 overlay-button rounded-full"
                            aria-label="Clear image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {colors.length > 0 && (
                    <ColorPalette 
                      colors={colors} 
                      onViewFullPalette={() => setIsModalOpen(true)}
                    />
                  )}
                </div>
              )}
            </main>
          </div>
        </div>

        
        <PaletteModal
        colors={colors}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        paletteHistory={paletteHistory}
        onLoadPalette={(colors) => setColors(colors)}
      />
    </div>
  );
}


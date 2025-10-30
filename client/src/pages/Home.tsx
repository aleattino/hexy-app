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
        <div className="flex flex-1 flex-col items-center justify-start pt-24 md:pt-32">
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

              {/* Empty State */}
              {showEmptyState && (
                <div 
                  className={`relative flex flex-col items-center gap-6 md:gap-8 py-8 md:py-16 px-4 rounded-3xl animate-in fade-in duration-500 transition-all ${
                    isDragging ? 'bg-accent/5 border-2 border-dashed border-accent' : ''
                  }`}
                  id="empty-state"
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* Hexy Animation */}
                  <HexyAnimation />
                  
                  <div className="flex max-w-[480px] flex-col items-center gap-3">
                    <h1 className="text-foreground text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] text-center">
                      {isDragging ? "Drop your image here" : "Generate your color palette"}
                    </h1>
                    <p className="text-secondary-foreground text-lg font-normal leading-normal text-center">
                      {isDragging ? "Release to upload" : "Upload, drag & drop, or paste an image"}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleUploadClick}
                    className="px-8 py-4 active:scale-95 transition-transform duration-200 ease-out group upload-button"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-foreground font-bold text-lg">Upload Photo</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 md:py-16 gap-6 animate-in fade-in duration-300">
                  {previewUrl && (
                    <div className="px-4 w-full">
                      <div className="relative rounded-3xl overflow-hidden w-full max-w-[600px] mx-auto">
                        <img
                          src={previewUrl}
                          alt="Processing"
                          className="w-full h-auto object-contain opacity-60"
                        />
                        {/* Processing Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                          <div className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                            <p className="text-sm text-foreground font-medium">Processing image...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!previewUrl && (
                    <>
                      <div className="glass-card p-6 rounded-3xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                      </div>
                      <p className="text-lg text-foreground font-medium">Extracting colors...</p>
                    </>
                  )}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">Error: {error}</p>
                </div>
              )}

              {/* Populated State */}
              {showPopulatedState && (
                <div className="flex flex-col gap-8 animate-in fade-in duration-500" id="populated-state">
                  {previewUrl && (
                    <div className="px-4">
                      <div className="relative rounded-3xl overflow-hidden w-full max-w-[600px] mx-auto group">
                        <img
                          src={previewUrl}
                          alt="Uploaded"
                          className="w-full h-auto object-contain"
                        />
                        {/* Action buttons overlay */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            onClick={handleUploadClick}
                            className="px-4 py-2 text-foreground text-sm font-medium active:scale-95 transition-transform duration-200 ease-out flex items-center gap-2 overlay-button"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Change
                          </button>
                          <button
                            onClick={handleClear}
                            className="p-2 text-foreground active:scale-95 transition-transform duration-200 ease-out overlay-button"
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

        {/* Palette Modal */}
        <PaletteModal
        colors={colors}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Hamburger Menu */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        paletteHistory={paletteHistory}
        onLoadPalette={(colors) => setColors(colors)}
      />
    </div>
  );
}


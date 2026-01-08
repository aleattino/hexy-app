# Hexy

🎨 **Extract beautiful color palettes from images**

A perceptually-accurate color palette generator that extracts dominant colors from images using advanced computer vision algorithms.

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-hexy--colors.vercel.app-00C7B7?style=for-the-badge)](https://hexy-colors.vercel.app)

[![Made with React](https://img.shields.io/badge/MADE_WITH-REACT-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TYPESCRIPT-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/VITE-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[![License](https://img.shields.io/badge/LICENSE-MIT-22C55E?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/VERSION-1.1.0-8B5CF6?style=for-the-badge)](https://github.com/aleattino/hexy-app/releases)

</div>

## Overview

Hexy analyzes images to identify colors that a human observer would recognize as visually dominant, going beyond simple pixel frequency analysis. The application implements a sophisticated pipeline combining color space transformations, perceptual distance metrics, and intelligent clustering to produce meaningful color palettes.

All processing happens locally in the browser with no server-side dependencies or external API calls.

## Features

- **Perceptually-accurate extraction**: Colors are grouped based on human visual perception, not just mathematical similarity
- **Background detection**: Automatically identifies and filters out uniform backgrounds
- **Real color output**: Palette contains actual colors from the image, not averaged approximations
- **Multiple input methods**: Upload, drag & drop, or paste images directly
- **Palette history**: Browse and reload previously extracted palettes
- **Theme support**: Dark and light mode interface
- **Export options**: Copy individual colors or entire palettes in multiple formats (HEX, RGB, HSL)
- **Fully responsive**: Optimized for desktop and mobile devices

## How It Works

### The Color Extraction Pipeline

The `useColorExtractor` hook implements a multi-stage processing pipeline designed to identify perceptually dominant colors:

#### 1. Preprocessing and Sampling

The source image is resized (maintaining aspect ratio, max dimension 600px) to ensure optimal processing performance. Rather than analyzing every pixel, the algorithm samples a grid using an adaptive stride. During this phase, irrelevant pixels are filtered out:
- Near-transparent pixels (alpha < threshold)
- Near-white colors (avoiding blown highlights)
- Near-black colors (avoiding crushed shadows)

#### 2. Background Detection (Optional)

An heuristic analyzes pixels exclusively along the image borders. If a uniform, predominant color is detected, it's classified as background. All sampled pixels that are perceptually too similar to this background color are excluded from subsequent analysis.

The similarity is evaluated using **CIEDE2000** (ΔE₀₀), a standardized metric for perceptual color difference developed by the International Commission on Illumination (CIE).

#### 3. Deduplication and Color Space Conversion

Remaining pixels are quantized to reduce the number of unique colors, optimizing the clustering phase. Each sRGB color is then converted to **CIELAB** color space.

Lab is designed for perceptual uniformity: Euclidean distance between two colors in Lab space approximates the perceptual difference observed by the human eye far better than distance in RGB space. This is crucial for accurate clustering.

#### 4. Perceptual Clustering (k-means + ΔE₀₀)

A **k-means++** clustering algorithm runs on the color points in Lab space. The number of clusters `k` is selected adaptively based on the color diversity in the image. This groups colors based on perceptual similarity using ΔE₇₆ (Euclidean distance in Lab).

After initial clustering, cluster centroids are refined: clusters that remain perceptually too similar are merged using **CIEDE2000 (ΔE₀₀)**, a more sophisticated and accurate formula for calculating color difference than simple Euclidean distance.

ΔE₀₀ accounts for:
- Lightness perception non-linearities
- Chroma perception differences
- Hue perception variations
- Interaction effects between these components

This ensures the final palette contains colors that are distinctly different to human perception.

#### 5. Filtering and Final Selection

Clusters representing less than a minimum threshold of the total pixel population (e.g., < 1.5%) are eliminated as noise.

For each remaining valid cluster, the algorithm does not return the mathematical centroid (which might be an average color that doesn't exist in the actual image). Instead, it identifies and returns the **most frequent RGB color** that actually exists within that cluster.

The final colors are returned sorted by dominance (cluster size).

### Mathematical Foundation

The core of the algorithm relies on two color difference metrics:

**ΔE₇₆ (CIE 1976)**
```
ΔE₇₆ = √[(L₂ - L₁)² + (a₂ - a₁)² + (b₂ - b₁)²]
```

Simple Euclidean distance in Lab space, used during k-means clustering for computational efficiency.

**ΔE₀₀ (CIEDE2000)**

A significantly more complex formula that accounts for perceptual non-uniformities:
```
ΔE₀₀ = √[(ΔL'/kₗSₗ)² + (ΔC'/kᴄSᴄ)² + (ΔH'/kₕSₕ)² + Rₜ(ΔC'/kᴄSᴄ)(ΔH'/kₕSₕ)]
```

Where:
- `ΔL'`, `ΔC'`, `ΔH'` are weighted differences in lightness, chroma, and hue
- `kₗ`, `kᴄ`, `kₕ` are parametric weighting factors
- `Sₗ`, `Sᴄ`, `Sₕ` are weighting functions for viewing conditions
- `Rₜ` is a rotation function correcting for the blue region's perceptual behavior

This metric is used for final cluster merging and background comparison, where accuracy is paramount.

### Key Characteristics

- **Perceptual Accuracy**: Clustering in Lab space with ΔE₀₀ merging ensures colors are grouped according to human visual perception
- **Noise Filtering**: Pre-filtering of extreme neutrals and background detection clean the input before clustering
- **Real Colors**: The final palette consists exclusively of RGB colors present in the original image, not mathematical averages
- **Client-Side Execution**: The entire pipeline is optimized (via resizing, sampling, and deduplication) to run efficiently in the browser

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **GSAP** - Animations
- **mathjs** - Mathematical computations for color space transformations

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/aleattino/hexy-app.git
cd hexy-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized production build will be generated in `client/dist/`.

## Project Structure

```
hexy-app/
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (theme, toast)
│   │   ├── hooks/          # Custom hooks (color extraction, history)
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── index.html          # Entry HTML
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Browser Compatibility

Hexy works in all modern browsers supporting:
- Canvas API
- File API
- Clipboard API (for paste functionality)
- ES2020+ JavaScript features

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

Contributions are welcome. Please feel free to submit issues or pull requests.

## License

MIT

## Acknowledgments

The color extraction algorithm implements techniques and metrics from:
- CIE (International Commission on Illumination) color difference standards
- "The CIEDE2000 Color-Difference Formula: Implementation Notes, Supplementary Test Data, and Mathematical Observations" by Sharma, Wu, and Dalal
- k-means++ initialization algorithm by Arthur and Vassilvitskii

## Links

- Repository: https://github.com/aleattino/hexy-app
- Issues: https://github.com/aleattino/hexy-app/issues

# hexy-app

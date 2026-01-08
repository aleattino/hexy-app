# Hexy Design System

This document outlines the design principles and specifications for the Hexy color palette application.

---

## Design Philosophy

**Product Identity**: Creative tool for extracting color palettes from images  
**Target Users**: Designers, developers, and creatives who need quick, accurate color extraction  
**Emotional Job**: **Delight + Precision** — Users want magic (instant beautiful palettes) + trust (accurate color values)  
**Memorable Quality**: A tool that feels like a design artifact itself

### Personality: **Boldness & Clarity with Creative Warmth**

This is a creative tool, not enterprise software. The design balances:
- High contrast and confident typography
- Generous negative space around key interactions
- Warmth through rounded corners and subtle color
- Technical precision in data display (hex/RGB values in monospace)

---

## Color Foundation

### Warm Neutrals Approach
We use warm-tinted neutrals instead of cold grays to create an approachable, creative feel.

#### Light Mode
```css
--background: #fafaf9;        /* Warm off-white (slight beige cast) */
--foreground: #1c1917;        /* Rich warm black */
--card: #ffffff;              /* Pure white cards for contrast */
--secondary: #f5f5f4;         /* Subtle warm gray background */
--secondary-foreground: #78716c; /* Warm gray for secondary text */
--muted: #f5f5f4;            /* Subtle warm gray */
--muted-foreground: #a8a29e; /* Lighter muted text */
--border: #e7e5e4;           /* Warm border */
```

#### Dark Mode
```css
--background: #1c1917;        /* Warm dark (not pure black) */
--foreground: #fafaf8;        /* Warm white */
--card: #292524;              /* Warm dark card */
--secondary: #3f3f3c;         /* Warm dark secondary */
--secondary-foreground: #a8a29e; /* Muted text */
--muted: #3f3f3c;
--muted-foreground: #78716c;
--border: #44403c;            /* Warm dark border */
```

#### Accent Color: Creative Violet
Violet conveys creativity and is distinctive in the design tool space.

```css
/* Light Mode */
--accent: #8b5cf6;           /* Violet for creativity */
--accent-foreground: #ffffff;

/* Dark Mode */
--accent: #a78bfa;           /* Lighter violet for dark mode */
--accent-foreground: #1c1917;
```

#### Status Colors
```css
--success: #10b981;          /* Green for success */
--destructive: #ef4444;      /* Red for errors/destructive actions */
```

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, sans-serif;
```

Inter is a humanist sans-serif that's warm, approachable, and highly legible. Perfect for creative tools.

### Type Scale (4px-aligned)
```css
--text-xs: 12px;     /* Helper text, timestamps */
--text-sm: 13px;     /* Body small, secondary info */
--text-base: 14px;   /* Body default */
--text-lg: 16px;     /* Emphasized body */
--text-xl: 18px;     /* Small headings */
--text-2xl: 24px;    /* Section headings */
--text-3xl: 32px;    /* Hero text */
--text-4xl: 40px;    /* Large hero (empty state) */
```

### Font Weights
```css
--font-normal: 400;   /* Body text */
--font-medium: 500;   /* Subtle emphasis */
--font-semibold: 600; /* UI labels, buttons */
--font-bold: 700;     /* Headings */
```

### Letter Spacing
```css
--tracking-tight: -0.02em;  /* Headings (tighter) */
--tracking-normal: 0em;     /* Body text */
--tracking-wide: 0.01em;    /* Uppercase labels */
```

### Monospace for Data
Hex codes and RGB values use monospace with tabular numerals:
```css
font-family: 'Monaco', 'Courier New', monospace;
font-variant-numeric: tabular-nums;
```

---

## Spacing System

All spacing follows a **4px base grid**:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;   /* Standard component padding */
--space-6: 24px;   /* Section spacing */
--space-8: 32px;   /* Major separation */
--space-12: 48px;  /* Large gaps */
--space-16: 64px;  /* Extra large spacing */
```

### Padding Symmetry
All component padding must be symmetrical (TLBR matching):
- ✅ `padding: 16px;`
- ✅ `padding: 12px 16px;` (when horizontal needs more room)
- ❌ `padding: 24px 16px 12px 16px;` (asymmetric, avoid)

---

## Border Radius

**Soft System** — Rounded corners create warmth appropriate for a creative tool:

```css
--radius-sm: 8px;    /* Small elements, icons */
--radius-md: 12px;   /* Buttons, inputs, cards (base) */
--radius-lg: 16px;   /* Large containers */
--radius-xl: 24px;   /* Modal tops, major containers */
--radius-full: 9999px; /* Pills, circles, header */
```

**Consistency is key**: Use the same radius for all elements of the same type.

---

## Depth Strategy

### Borders-First Approach
We use **subtle borders** as the primary depth mechanism, with minimal shadows for floating elements.

#### Border System
```css
--border-weight: 1px;
--border-color: var(--border); /* Warm gray from color system */
```

#### Shadow Levels
Shadows are used sparingly for true elevation:

```css
/* Light Mode */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);   /* Subtle lift */
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06);   /* Cards, dropdowns */
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);  /* Modals, floating elements */

/* Dark Mode */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.5);
```

### When to Use Each

**Borders Only**: 
- Cards within the main flow
- Menu items in sidebars
- List items
- Input fields

**Borders + Subtle Shadow**:
- Interactive cards
- Buttons
- Dropdowns

**Glassmorphism (backdrop-filter)**:
- ONLY for floating elements: header, modals
- Never for static page content

---

## Component Patterns

### Cards

**Structure**: Borders-first, consistent surface treatment
```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
}
```

**Interactive Cards** (hover states):
```css
.card.interactive:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
}
```

### Buttons

**Primary Action** (accent background):
```css
.button-primary {
  background: var(--accent);
  color: var(--accent-foreground);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
}
```

**Secondary Action** (border + subtle bg):
```css
.button-secondary {
  background: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
}
```

### Color Swatches

- Use **circles** (rounded-full) for color previews
- Include 2px border in `border-border`
- Size: 48px-56px (12-14 in Tailwind scale)
- Always show both HEX (uppercase) and RGB

---

## Animation & Timing

### Duration Standards
```css
--duration-micro: 150ms;   /* Micro-interactions (hover, click) */
--duration-short: 200ms;   /* Standard transitions */
--duration-medium: 250ms;  /* Modal slides, page transitions */
```

### Easing
```css
--easing-standard: cubic-bezier(0.25, 1, 0.5, 1);
```

**NO spring or bouncy effects** in this design system. Keep it smooth and confident.

### Active States
All interactive elements use:
```css
active:scale-[0.98]
transition-all duration-150
```

---

## Accessibility

### Contrast
- All text meets WCAG AA standards (4.5:1 for body, 3:1 for large text)
- Accent color (#8b5cf6) provides sufficient contrast on white backgrounds

### Touch Targets
- Minimum 44x44px for mobile touch targets
- Icon-only buttons: 36x36px minimum

### Focus States
- Use ring color: `--ring: var(--accent);`
- Visible keyboard focus on all interactive elements

---

## Grid & Layout

### Max Width
```css
max-width: 960px; /* Main content container */
```

### Responsive Breakpoints
```css
sm: 640px;   /* Tablet portrait */
md: 768px;   /* Tablet landscape */
lg: 1024px;  /* Desktop */
```

---

## Usage Examples

### Color Palette Card
```tsx
<div className="glass-card rounded-2xl p-4">
  <div className="grid grid-cols-5 gap-3">
    {colors.map((color) => (
      <button className="flex flex-col gap-2 items-center">
        <div 
          className="w-14 h-14 rounded-full border-2 border-border"
          style={{ backgroundColor: color.hex }}
        />
        <span className="text-[10px] font-semibold font-mono">
          {color.hex.toUpperCase()}
        </span>
      </button>
    ))}
  </div>
</div>
```

### Toast Notification
```tsx
<div className="glass px-6 py-3 rounded-full flex items-center gap-3">
  <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
    <CheckIcon />
  </div>
  <span className="text-sm font-semibold text-foreground">
    Copied #8B5CF6
  </span>
</div>
```

---

## Anti-Patterns

### Never Do:
- ❌ Dramatic drop shadows (>16px blur)
- ❌ Border radius > 24px on containers
- ❌ Asymmetric padding without clear reason
- ❌ Pure white cards on colored backgrounds
- ❌ Thick borders (>2px) for decoration
- ❌ Spring/bouncy animations
- ❌ Decorative gradients
- ❌ Multiple accent colors in one interface
- ❌ Glassmorphism on static content

### Always Question:
- "Does this element feel crafted?"
- "Is this spacing on the 4px grid?"
- "Does this border weight match the system?"
- "Is my depth strategy consistent?"

---

## The Standard

Every interface should look designed by a team that obsesses over 1-pixel differences. Not stripped — **crafted**. And designed for its specific context.

The goal: **Intricate minimalism with appropriate personality**.


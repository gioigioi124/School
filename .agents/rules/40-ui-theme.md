# UI Theme & Styling Rules: Kinderly

- **Font Family**: Use `Quicksand` (bold) for all headings, titles, and names to feel personal. Use `Lexend` for body text, labels, descriptions, and data entry. (Configured in `layout.tsx` and applied via `font-heading` and `font-sans`).
- **Color Palette**: 
  - Primary (Mint Green): `bg-primary`, used for success states and main actions.
  - Secondary (Sunny Yellow): `bg-secondary`, highlights, warnings.
  - Backgrounds: Use the light grey-green tint (`bg-background`) to reduce eye strain. Pure white (`bg-card`) for containers.
- **Design Language**: Soft Minimalist with a Tactile edge. Pill-shaped buttons (`rounded-full`), ambient shadows (`shadow-custom`), and no sharp corners.
- **Elevation**: Use `shadow-custom` (0px 4px 20px rgba(0,0,0,0.05)) for Level 1 surfaces. Hover states scale slightly (1.02x) for a squishy, tactile feel.

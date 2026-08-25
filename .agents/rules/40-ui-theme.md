# UI Theme & Styling Rules

- **Font Family**: Always use `Lexend Variable` (via `@fontsource-variable/lexend`) as the primary font for the application. Do not import or use `next/font/google` (e.g., `Geist`, `Inter`) unless specifically requested.
- **Color Palette**: The theme utilizes HSL CSS variables defined in `globals.css` (e.g., `--primary`, `--background`, `--card`). Use standard Tailwind classes (`bg-primary`, `text-muted-foreground`, etc.) instead of hardcoded hex colors.
- **Design Language**: Follow the "Modern UI" aesthetic with soft shadows (`shadow-custom-sm`, `shadow-custom-md`), gradient backgrounds (e.g., `bg-gradient-to-r`), and rounded borders.
- **Variables**: Always refer to the custom CSS variables set in `@theme inline` inside `globals.css` for consistent styling.

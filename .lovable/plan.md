

# Light Theme Default + Dark Mode Toggle

## Overview
Switch the default theme from dark to a clean white/light theme, and add a toggle button so users can switch to dark mode. Uses `next-themes` (already installed) for theme management.

## Changes

### 1. Add light theme CSS variables to `src/index.css`
- Make `:root` contain **light theme** values (white backgrounds, dark text, light borders)
- Move current dark values into a `.dark` class selector
- Keep the blue accent (#2196F3) consistent across both themes

### 2. Create a Theme Provider (`src/components/ThemeProvider.tsx`)
- Wrap the app with `next-themes` `ThemeProvider` with `defaultTheme="light"`
- Stores preference in localStorage

### 3. Create a Theme Toggle component (`src/components/ThemeToggle.tsx`)
- Sun/Moon icon button using `next-themes`' `useTheme()` hook
- Clicking toggles between light and dark

### 4. Add the toggle to the top bar in `DashboardLayout.tsx`
- Place the theme toggle next to the notification bell

### 5. Add toggle to Login page header
- Small toggle in the top-right corner of the login screen

### 6. Update `tailwind.config.ts`
- Change `darkMode` from `["class"]` to `["class"]` (already set -- no change needed)

### 7. Update hardcoded dark styles
- Review pages for any hardcoded dark-specific classes (e.g., `bg-secondary` on inputs in Login) and ensure they work in both themes

## Light Theme Color Palette
| Token | Light Value |
|-------|------------|
| background | 0 0% 100% (white) |
| foreground | 0 0% 9% (near-black) |
| card | 0 0% 98% |
| border | 0 0% 90% |
| muted | 0 0% 96% |
| muted-foreground | 0 0% 45% |
| secondary | 0 0% 96% |
| sidebar-background | 0 0% 97% |
| sidebar-border | 0 0% 90% |

The primary blue (#2196F3) stays the same in both themes.

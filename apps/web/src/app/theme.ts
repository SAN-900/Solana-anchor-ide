/** VS Code-inspired dark theme tokens. Used in inline styles and CSS vars. */
export const theme = {
  bg: {
    base: '#1e1e1e',
    panel: '#252526',
    input: '#3c3c3c',
    hover: '#2a2d2e',
    selected: '#094771',
  },
  border: '#333',
  text: {
    primary: '#cccccc',
    muted: '#888',
    error: '#f14c4c',
    success: '#4ec9b0',
    warning: '#cca700',
    link: '#4ea1ff',
  },
  accent: {
    blue: '#0e639c',
    green: '#16825d',
    orange: '#ce9178',
  },
  font: {
    ui: 'system-ui, -apple-system, sans-serif',
    mono: "ui-monospace, 'Cascadia Code', Menlo, monospace",
    size: { xs: 11, sm: 12, md: 13, lg: 15 },
  },
} as const;

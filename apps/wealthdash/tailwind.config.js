import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "secondary-fixed": "#d8e2ff",
        "surface-container-highest": "#e4e2e4",
        "surface-variant": "#e4e2e4",
        "on-secondary-fixed": "#001a42",
        "on-tertiary": "#ffffff",
        "background": "#fcf8fa",
        "tertiary-fixed-dim": "#dec29a",
        "on-background": "#1b1b1d",
        "surface": "#fcf8fa",
        "primary-container": "#131b2e",
        "primary": "#000000",
        "surface-bright": "#fcf8fa",
        "inverse-primary": "#bec6e0",
        "tertiary-fixed": "#fcdeb5",
        "surface-container": "#f0edef",
        "on-tertiary-container": "#98805d",
        "inverse-on-surface": "#f3f0f2",
        "surface-dim": "#dcd9db",
        "on-primary-fixed": "#131b2e",
        "primary-fixed": "#dae2fd",
        "secondary": "#0058be",
        "on-primary-fixed-variant": "#3f465c",
        "on-tertiary-fixed-variant": "#574425",
        "on-error-container": "#93000a",
        "on-secondary": "#ffffff",
        "outline": "#76777d",
        "error-container": "#ffdad6",
        "surface-container-high": "#eae7e9",
        "on-secondary-fixed-variant": "#004395",
        "on-surface-variant": "#45464d",
        "secondary-fixed-dim": "#adc6ff",
        "error": "#ba1a1a",
        "on-tertiary-fixed": "#271901",
        "tertiary": "#000000",
        "secondary-container": "#2170e4",
        "surface-container-low": "#f6f3f5",
        "on-surface": "#1b1b1d",
        "primary-fixed-dim": "#bec6e0",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#c6c6cd",
        "inverse-surface": "#303032",
        "surface-tint": "#565e74",
        "on-error": "#ffffff",
        "on-secondary-container": "#fefcff",
        "on-primary-container": "#7c839b",
        "on-primary": "#ffffff",
        "tertiary-container": "#271901"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "margin-mobile": "16px",
        "card-gap": "24px",
        "gutter": "24px",
        "container-max-width": "1440px",
        "unit": "4px",
        "margin-desktop": "32px"
      },
      "fontFamily": {
        "headline-md": ["Inter"],
        "label-caps": ["Inter"],
        "data-md": ["JetBrains Mono"],
        "body-md": ["Inter"],
        "body-sm": ["Inter"],
        "display-lg-mobile": ["Inter"],
        "data-sm": ["JetBrains Mono"],
        "data-lg": ["JetBrains Mono"],
        "display-lg": ["Inter"]
      },
      "fontSize": {
        "headline-md": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "label-caps": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "data-md": ["16px", { "lineHeight": "1", "fontWeight": "500" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "display-lg-mobile": ["24px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "data-sm": ["13px", { "lineHeight": "1", "fontWeight": "400" }],
        "data-lg": ["24px", { "lineHeight": "1", "letterSpacing": "-0.05em", "fontWeight": "600" }],
        "display-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      }
    }
  },
  plugins: [
    forms,
    containerQueries
  ],
}

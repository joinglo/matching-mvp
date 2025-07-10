import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,jsx}"], 
    plugins: { js }, 
    extends: ["js/recommended"] 
  },
  { 
    files: ["script.js"], 
    languageOptions: { 
      globals: {
        ...globals.browser,
        lucide: "readonly"
      }
    } 
  },
  { 
    files: ["app.js"], 
    languageOptions: { globals: globals.node } 
  },
  pluginReact.configs.flat.recommended,
]);

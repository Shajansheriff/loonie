import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import playwright from "eslint-plugin-playwright";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["e2e/**"],
    extends: [
      js.configs.recommended,
      // Strict type-checked rules (production-grade)
      tseslint.configs.strictTypeChecked,
      // Stylistic rules for consistent code style
      tseslint.configs.stylisticTypeChecked,
      // React hooks rules
      reactHooks.configs.flat.recommended,
      // React-specific lint rules
      reactX.configs["recommended-typescript"],
      // React DOM rules
      reactDom.configs.recommended,
      // Vite refresh rules
      reactRefresh.configs.vite,
      // Disable formatting rules that conflict with Prettier
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["e2e/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      playwright.configs["flat/recommended"],
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: "./tsconfig.e2e.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);

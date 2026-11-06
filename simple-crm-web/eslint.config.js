import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  // do not lint the production build output
  globalIgnores(["dist"]),
  {
    // apply these rules to all JS and JSX files
    files: ["**/*.{js,jsx}"],
    extends: [
      // ESLint's built-in recommended rules
      js.configs.recommended,
      // rules for correct Hook usage (e.g. Rules of Hooks)
      reactHooks.configs.flat.recommended,
      // warns if components cannot be fast-refreshed by Vite
      reactRefresh.configs.vite,
      // must be last: turns off rules that conflict with Prettier
      eslintConfigPrettier,
    ],
    languageOptions: {
      // recognise browser globals like window and document
      globals: globals.browser,
      // enable JSX syntax parsing
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
]);

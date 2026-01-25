// eslint.config.js
const globals = require("globals");
const tseslint = require("typescript-eslint");
const prettier = require("eslint-plugin-prettier");

module.exports = tseslint.config({
  files: ["src/**/*.ts"],
  ignores: ["dist/**"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: "./tsconfig.json",
      sourceType: "module",
    },
    globals: {
      ...globals.node,
    },
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
    prettier,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn"],
    "no-console": "warn",
    "prettier/prettier": "off",
  },
});

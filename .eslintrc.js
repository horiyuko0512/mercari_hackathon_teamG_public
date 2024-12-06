module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "next/core-web-vitals",
    "next/typescript",
    "prettier",
  ],
  plugins: ["@typescript-eslint"],
  ignorePatterns: [".next/*", "node_modules/*", "components/ui/**/*"],
}

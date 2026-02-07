import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.eslint.json",
      },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },

    rules: {
      semi: ["error", "always"],
      quotes: ["off", "double"],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-useless-escape": "off",
      "no-control-regex": "off",
      "no-multiple-empty-lines": "error",
      "no-use-before-define": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-inferrable-types": [
        "warn",
        {
          ignoreParameters: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
    },
    ignores: ["lib/*", "deps/*", "dist/*", "archived", "node_modules", "./*.js"],
  },
  {
    files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/**/*.spec.{j,t}s?(x)"],
    // env: {
    //   jest: true,
    // },
  },
  { languageOptions: { globals: globals.browser } }
];

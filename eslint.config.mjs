import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    rules: {
      semi: ["error", "always"],
      quotes: ["off", "double"],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/camelcase": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-useless-escape": "off",
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
      "@typescript-eslint/class-name-casing": "off",
    },
    ignores: ["lib/*", "deps/*", "dist/*", "archived"],
  },
  {
    files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/**/*.spec.{j,t}s?(x)"],
    env: {
      jest: true,
    },
  },
  { languageOptions: { globals: globals.browser } }
];

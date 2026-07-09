import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".wrangler/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "prisma/generated/**",
      ".tsbuild/**",
      "e2e/**",
      "eslint.config.js",
      "functions/**",
      "postcss.config.js",
      "public/sw.js",
    ],
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        PagesFunction: "readonly",
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "scripts/api-dev-server.ts",
            "scripts/backup-database.ts",
            "scripts/cleanup-media.ts",
            "scripts/fix-broken-images.ts",
            "scripts/investigate-relationships.ts",
            "scripts/reset-storage.ts",
            "scripts/restore-database.ts",
            "scripts/rollback-migration.ts",
            "scripts/sync-public-headers.ts",
            "scripts/update-razorpay-secrets.ts",
            "scripts/verify-cloudinary.ts",
            "scripts/verify-database.ts",
          ],
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 20,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-debugger": "error",
      "no-unreachable": "error",
      "no-constant-condition": ["error", { "checkLoops": false }],
      "no-console": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      }],
    },
  },
);

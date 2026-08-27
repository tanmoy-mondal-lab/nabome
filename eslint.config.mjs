// @ts-check
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { fixupPluginRules } from '@eslint/compat';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/.wrangler/**',
      '**/.turbo/**',
      '**/pnpm-lock.yaml',
      'apps/api/prisma/generated/**',
      'apps/api/worker-configuration.d.ts',
    ],
  },
  {
    // Root scripts are plain Node ESM, outside any tsconfig project.
    files: ['scripts/**/*.mjs', 'infra/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/*/src/**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Route trees are meta-files: they export the router instance, not
    // components meant for fast refresh.
    files: ['apps/*/src/app/routes.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['apps/api/functions/_middleware.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: ['apps/api/**/*.{ts,tsx}', 'apps/customer/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['vitest.workspace.ts'],
        },
      },
    },
    plugins: {
      'react-hooks': fixupPluginRules(reactHooks),
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'no-case-declarations': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'no-empty': 'warn',
      'prefer-const': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-useless-catch': 'warn',
      'no-duplicate-case': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['@/features/*', '../../features/*', '../features/*'],
              message:
                'Features must not import from other features. Extract shared logic into lib/ or shared/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/**/*.{ts,tsx}', 'apps/customer/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    plugins: {
      'import-x': importX,
    },
    rules: {
      'import-x/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: '@nabome/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@/features/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/shared/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/lib/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/stores/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/types/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/styles/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/app/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
    },
  },
  {
    files: ['apps/api/tests/**/*', 'packages/*/tests/**/*', 'packages/returns/**/*', 'apps/admin/src/**/*', 'apps/shop/src/**/*', 'e2e/**/*', '**/vitest*.ts', '**/vitest*.config.ts'],
    languageOptions: {
      parserOptions: { projectService: false },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-restricted-imports': 'off',
      'import-x/order': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-empty': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-useless-catch': 'off',
      'no-duplicate-case': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      'no-console': 'off',
      'no-case-declarations': 'off',
    },
  },
  eslintConfigPrettier,
);

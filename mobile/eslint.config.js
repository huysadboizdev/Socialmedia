// @ts-check
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'build', 'public'],
  },

  // JS cơ bản (áp dụng cho eslint.config.js)
  js.configs.recommended,

  // 🔴 CHỈ ÁP DỤNG CHO FILE TS
  // 🟢 Áp dụng rules chung (console, unused vars, v.v.)
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-unused-vars': 'off', // Tắt rule gốc để dùng rule của TS hoặc xử lý riêng
    },
  },

  // 🟡 Cấu hình riêng cho JS/JSX (không type-check khắt khe)
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 🔴 CHỈ ÁP DỤNG CHO FILE TS VỚI TYPE CHECKING KHẮT KHE
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
    },
  }
)

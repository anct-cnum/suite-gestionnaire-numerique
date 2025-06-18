import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import vitest from '@vitest/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import sonarjs from 'eslint-plugin-sonarjs'
import testingLibrary from 'eslint-plugin-testing-library'
import perfectionist from 'eslint-plugin-perfectionist'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'
import 'eslint-plugin-only-warn'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.ts?(x)'] },
  { settings: { 'import/resolver': {typescript: {} } } },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslint.configs.all,
  ...tseslint.configs.all,
  react.configs.flat.all,
  sonarjs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  jsxA11y.flatConfigs.recommended,
  perfectionist.configs['recommended-alphabetical'],
  {
    plugins: {
      '@stylistic': stylistic,
      'unused-imports': unusedImports,
    },
  },
  {
    rules: {
      'arrow-body-style': 'off',
      'capitalized-comments': 'off',
      "class-methods-use-this": "off",
      'func-style': ['error', 'declaration'],
      'id-length': ['error', { exceptions: ['_'] }],
      'init-declarations': 'off',
      'jsx-quotes': ['error'],
      'line-comment-position': 'off',
      'max-classes-per-file': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'max-statements': 'off',
      'multiline-comment-style': 'off',
      'new-cap': ['error', { capIsNewExceptions: ['GET', 'NextAuth', 'Notification'] }],
      'no-inline-comments': 'off',
      'no-magic-numbers': 'off',
      'no-restricted-syntax': [
        'error',
        {
          message: "Utiliser plutôt l'API React",
          selector: 'Identifier[name=/window|document/]',
        },
      ],
      'no-shadow': 'off',
      'no-ternary': 'off',
      'no-undefined': 'off',
      'no-use-before-define': 'off',
      'no-void': ['error', { allowAsStatement: true }],
      'one-var': ['error', 'never'],
      'prefer-destructuring': 'off',
      'prefer-named-capture-group': 'off',
      'require-unicode-regexp': 'off',
      'sort-imports': 'off',
      'sort-keys': ['error', 'asc', { 'caseSensitive': false }],
      'import/newline-after-import': 'error',
      'import/no-anonymous-default-export': 'off',
      'import/no-extraneous-dependencies': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: ['src/domain'],
              from: ['src', 'node_modules'],
              except: ['domain', 'shared'],
              message: "Le domain représente le métier, il ne dépend d'aucun élément extérieur.",
            },
            {
              target: ['src/use-cases/**[^test].ts'],
              from: ['src', 'node_modules'],
              except: ['domain', 'shared'],
              message: "Les use cases automatisent l'interaction entre les règles métiers et les ports représentant des éléments extérieurs.",
            },
            {
              target: ['src/use-cases/**test.ts'],
              from: ['src', 'node_modules'],
              except: ['domain', 'use-cases', 'use-cases/shared'],
              message: "Les use cases automatisent l'interaction entre les règles métiers et les ports représentant des éléments extérieurs.",
            },
            {
              target: ['src/gateways/**[^test].ts'],
              from: ['src', 'node_modules'],
              except: [
                'domain',
                'use-cases',
                'gateways/shared',
                'shared',
                '@prisma/client',
                'next-auth',
                'nodemailer',
                'mjml',
              ],
              message: "Les gateways n'ont besoin que du domain et d'implementer les ports définis dans les use cases.",
            },
            {
              target: ['src/gateways/**test.ts'],
              from: ['src', 'node_modules'],
              except: [
                'domain',
                'use-cases',
                'gateways',
                'shared',
                '@prisma/client',
                'nodemailer',
                'mjml',
              ],
              message: "Les gateways n'ont besoin que du domain et d'implementer les ports définis dans les use cases.",
            },
            {
              target: ['src/presenters/**[^test].ts'],
              from: ['src', 'node_modules'],
              except: ['use-cases', 'presenters/shared', 'shared'],
              message: "Les presenters préparent les données à afficher et n'ont pas connaissance du domain ni des gateways.",
            },
            {
              target: ['src/presenters/**test.ts'],
              from: ['src', 'node_modules'],
              except: ['use-cases', 'presenters'],
              message: "Les presenters préparent les données à afficher et n'ont pas connaissance du domain ni des gateways.",
            },
            {
              target: ['src/components'],
              from: ['src'],
              except: ['components', 'presenters', 'shared', 'use-cases/testHelper.ts'],
              message: 'Le front ne doit pas avoir la connaissance du back.',
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          alphabetize: { caseInsensitive: true, order: 'asc' },
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index', 'object', 'type'],
          ],
          'newlines-between': 'always',
        },
      ],
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-aria-hidden-on-focusable': 'error',
      'jsx-a11y/lang': 'error',
      'perfectionist/sort-imports': "off",
      'perfectionist/sort-jsx-props': "off",
      'perfectionist/sort-modules': ["error", { 'groups': [
        [
          'export-class',
          'export-function',
          'export-enum',
          'export-interface',
          'export-type',
        ],
        'unknown',
      ], 'type': 'unsorted' }],
      'react/forbid-component-props': 'off',
      'react/jsx-boolean-value': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-max-depth': 'off',
      'react/jsx-newline': 'off',
      'react/jsx-no-bind': 'off',
      'react/jsx-no-literals': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/function-return-type': 'off',
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          imports: 'always-multiline',
          objects: 'always-multiline',
        },
      ],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/implicit-arrow-linebreak': ['off'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/lines-around-comment': 'off',
      '@stylistic/lines-between-class-members': [
        'error',
        {
          enforce: [
            { blankLine: 'always', prev: '*', next: '*' },
            { blankLine: 'never', prev: 'field', next: 'field' },
          ],
        },
      ],
      '@stylistic/max-len': [
        'error',
        {
          code: 120,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
        },
      ],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none',
          },
        },
      ],
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/multiline-comment-style': 'off',
      '@stylistic/newline-per-chained-call': ['off'],
      '@stylistic/no-confusing-arrow': ['off'],
      '@stylistic/no-extra-parens': ['error', 'all', { ignoreJSX: 'all' }],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/padded-blocks': ['error', 'never'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          asyncArrow: 'always',
          named: 'never',
        },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'generic', readonly: 'generic' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/class-methods-use-this': ['error', { ignoreOverrideMethods: true }],
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/max-params': 'off',
      "@typescript-eslint/member-ordering": "off",
      '@typescript-eslint/method-signature-style': ['error', 'method'],
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { "considerDefaultExhaustiveForUnions": true }
      ],
      "@typescript-eslint/no-misused-promises": ["error", { "checksVoidReturn": false }],
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': [
        'off',
        {
          allow: [
            'FormEvent',
            'HTMLFormElement',
            'HTMLInputElement',
            'SubmitEvent',
            'SyntheticEvent',
            'ReactElement',
            'ChartDataset',
            'ClientSafeProvider',
          ],
        },
      ],
      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    files: ['**/*.test.ts?(x)'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.all.rules,
      'class-methods-use-this': 'off',
      'func-style': 'off',
      'no-restricted-syntax': [
        'error',
        {
          message: 'Utiliser plutôt epochTime',
          selector: "NewExpression[callee.name='Date']",
        },
        {
          message: 'Utiliser waitFor() ou findByXXX()',
          selector: "Identifier[name='act']",
        },
        {
          message: "Tu es trop couplé à cette lib, mieux vaut l'injecter",
          selector: "CallExpression[callee.object.name='vi'][callee.property.name='mock']",
        },
        {
          message: "toHaveTextContent n'est pas assez strict, privilégier expect(xxx.textContent).toBe('...')",
          selector: "[callee.property.name='toHaveTextContent']",
        },
      ],
      'no-undef': 'off',
      '@typescript-eslint/class-methods-use-this': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'vitest/max-expects': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/no-hooks': 'off',
      'vitest/padding-around-all': 'off',
      'vitest/padding-around-describe-blocks': 'error',
      'vitest/padding-around-expect-groups': 'off',
      'vitest/padding-around-test-blocks': 'error',
      'vitest/prefer-expect-assertions': 'off',
      'vitest/prefer-to-be-falsy': 'off',
      'vitest/prefer-to-be-truthy': 'off',
      'vitest/require-hook': 'off',
      'vitest/valid-title': ['error', { 'allowArguments': true }],
    },
  },
  {
    files: ['**/*.test.tsx'],
    ...testingLibrary.configs['flat/react'],
  },
  {
    files: ['**/*'],
    ignores: ['src/app/**/*'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          message: 'La date doit être injectée dans un controller',
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
        },
      ],
    },
  },
  {
    files: ['**/testHelper.tsx'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['src/components/**/*'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
]

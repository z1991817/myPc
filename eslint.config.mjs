import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";

const ignoredPaths = [
    ".now/*",
    "**/*.css",
    "**/.changeset",
    "**/dist",
    "esm/*",
    "public/*",
    "tests/*",
    "scripts/*",
    "**/*.config.js",
    "**/.DS_Store",
    "**/node_modules",
    "**/coverage",
    "**/.next",
    "**/build",
    "!**/.commitlintrc.cjs",
    "!**/.lintstagedrc.cjs",
    "!**/jest.config.js",
    "!**/plopfile.js",
    "!**/react-shim.js",
    "!**/tsup.config.ts",
];

export default defineConfig([
    globalIgnores(ignoredPaths),
    {
        files: ["**/*.ts", "**/*.tsx"],
        ...js.configs.recommended,
        ...react.configs.flat.recommended,
        ...jsxA11Y.flatConfigs.recommended,
        plugins: {
            ...react.configs.flat.recommended.plugins,
            ...jsxA11Y.flatConfigs.recommended.plugins,
            "react-hooks": reactHooks,
            "unused-imports": unusedImports,
            import: importPlugin,
            "@typescript-eslint": typescriptEslint,
            prettier,
        },
        languageOptions: {
            ...js.configs.recommended.languageOptions,
            ...react.configs.flat.recommended.languageOptions,
            ...jsxA11Y.flatConfigs.recommended.languageOptions,
            parser: tsParser,
            ecmaVersion: 12,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...Object.fromEntries(Object.keys(globals.browser).map((key) => [key, "off"])),
                ...globals.node,
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...prettierConfig.rules,
            ...reactHooks.configs.recommended.rules,
            "no-console": "warn",
            "react/prop-types": "off",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react-hooks/exhaustive-deps": "off",
            "jsx-a11y/click-events-have-key-events": "warn",
            "jsx-a11y/interactive-supports-focus": "warn",
            "prettier/prettier": "warn",
            "no-unused-vars": "off",
            "unused-imports/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", {
                args: "after-used",
                ignoreRestSiblings: false,
                argsIgnorePattern: "^_.*?$",
            }],
            "import/order": ["warn", {
                groups: [
                    "type",
                    "builtin",
                    "object",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                ],
                pathGroups: [{
                    pattern: "~/**",
                    group: "external",
                    position: "after",
                }],
                "newlines-between": "always",
            }],
            "react/self-closing-comp": "warn",
            "react/jsx-sort-props": ["warn", {
                callbacksLast: true,
                shorthandFirst: true,
                noSortAlphabetically: false,
                reservedFirst: true,
            }],
            "padding-line-between-statements": ["warn", {
                blankLine: "always",
                prev: "*",
                next: "return",
            }, {
                blankLine: "always",
                prev: ["const", "let", "var"],
                next: "*",
            }, {
                blankLine: "any",
                prev: ["const", "let", "var"],
                next: ["const", "let", "var"],
            }],
        },
    },
]);

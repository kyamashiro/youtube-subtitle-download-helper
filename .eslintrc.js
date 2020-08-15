module.exports = {
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  env: { node: true, es2020: true },
  overrides: [
    {
      files: ["src/**/*.ts"],
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        // "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier/@typescript-eslint",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2019,
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.eslint.json"],
      },
      rules: {},
    },
  ],
};

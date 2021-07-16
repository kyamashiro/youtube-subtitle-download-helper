module.exports = {
  extends: ["eslint:recommended"],
  env: { node: true, es2020: true },
  overrides: [
    {
      files: ["src/**/*.ts"],
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
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

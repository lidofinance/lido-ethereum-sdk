module.exports = {
  extends: ['../.eslintrc.base.json'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
  },
  rules: {
    'import/no-unresolved': 'off',
  },
};

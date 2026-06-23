export default [
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Image: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn'
    }
  }
];

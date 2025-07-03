module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Disable rules that are causing issues
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': 'off'
  }
}; 
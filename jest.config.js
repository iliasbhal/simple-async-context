module.exports = {
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  testPathIgnorePatterns: [
    './build',
  ],
  coveragePathIgnorePatterns: [
    '.d.ts$',
  ],
};

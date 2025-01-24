module.exports = {
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    './build',
  ],
  coveragePathIgnorePatterns: [
    '.d.ts$',
  ],
};

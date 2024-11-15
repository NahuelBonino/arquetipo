module.exports = {
  moduleFileExtensions: [
    "js", "jsx", "ts",
  ],
  testMatch: [
    "**/tests/**/*.(test|spec).(js)"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
  ],
  collectCoverageFrom: [
    "components/**/*.{js,jsx}",
    "pages/**/*.{js,jsx}"
  ],
  coverageReporters: [
    "json",
    "lcov",
    "text",
    "text-summary",
    "html"
  ],
  setupFilesAfterEnv: [
    "jest-chain"
  ],
  modulePathIgnorePatterns: ["<rootDir>/pages/_app"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/tests/__mocks__/mocks.js",
    "\\.(css|less|scss)$": "<rootDir>/tests/__mocks__/mocks.js",
    "^@/components(.*)$": "<rootDir>/components$1",
    "^@/public(.*)$": "<rootDir>/public$1",
    "^@/assets(.*)$": "<rootDir>/assets$1",
    "^@/layouts(.*)$": "<rootDir>/layouts$1",
    "^@/pages(.*)$": "<rootDir>/pages$1",
    "^@/tests(.*)$": "<rootDir>/tests$1",
    "^@/utils(.*)$": "<rootDir>/utils$1",
    "^@/hooks(.*)$": "<rootDir>/hooks$1",
    "^@/types(.*)$": "<rootDir>/types$1",
    "^@/lib(.*)$": "<rootDir>/lib$1",
    "^@/constants(.*)$": "<rootDir>/constants$1",
    "/package.json": "<rootDir>/package.json",
    "/next-i18next.config": "<rootDir>/next-i18next.config",
  }
};
import type { Config } from "jest";

const config: Config = {
  verbose: true,
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
    },
  },
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/tests/**/*.spec.(ts|js)"],
  // runner: "jest-serial-runner",
  // testEnvironment: "node",
  reporters: ["default", "jest-junit"],
  collectCoverageFrom: ["src/**/*.{ts,js}", "!**/node_modules/**", "!**/lib/**"]
};

export default config;

// module.exports = {
//   // [...]
//   // Replace `ts-jest` with the preset you want to use
//   // from the above list
//   preset: 'ts-jest'
// };

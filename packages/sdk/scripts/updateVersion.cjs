const { readJsonSync, writeFileSync } = require("fs-extra");
const path = require("path");

// Writes the current package.json version to `./src/errors/version.ts`.
const cjsVersionFilePath = path.join(__dirname, "../dist/cjs/version.js");
const esmVersionFilePath = path.join(__dirname, "../dist/esm/version.js");
const packageJsonPath = path.join(__dirname, "../package.json");
const packageVersion = readJsonSync(packageJsonPath).version;

const cjsCode = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
exports.version = "v${packageVersion}";
//# sourceMappingURL=version.js.map
`;
const esmCode = `export const version = 'v${packageVersion}'\n`;

writeFileSync(cjsVersionFilePath, cjsCode);
writeFileSync(esmVersionFilePath, esmCode);

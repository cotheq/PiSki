import * as fs from 'fs';
const dirPath = '/node_modules/.vite';
fs.rm(dirPath, { recursive: true, force: true }, () => {})

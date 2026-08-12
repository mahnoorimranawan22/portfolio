import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Shared single-source-of-truth data (same files the frontend bundles).
const DATA_DIR = path.resolve(__dirname, '../../data');

/** Read a shared JSON data file. Throws if missing or unparseable. */
export function readDataFile(filename) {
    const raw = readFileSync(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(raw);
}

export function writeDataFile(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export const dataFiles = {
    projects: () => readDataFile('projects.json'),
    skills: () => readDataFile('skills.json'),
    experience: () => readDataFile('experience.json'),
};

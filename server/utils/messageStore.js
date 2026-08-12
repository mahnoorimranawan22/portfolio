import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Tiny file-backed store for contact messages.
 * - Messages are appended (newest first) to a JSON array.
 * - Each message carries a `read` flag for the admin dashboard.
 * - The file is created on first write and capped at config.contact.maxMessages.
 */
export function createMessageStore(filePath, maxMessages) {
    const load = () => {
        try {
            const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const save = (messages) => {
        mkdirSync(path.dirname(filePath), { recursive: true });
        writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
    };

    return {
        list() {
            return load();
        },
        add(message) {
            const current = load();
            current.unshift({ ...message, read: false });
            const trimmed = current.slice(0, maxMessages);
            save(trimmed);
            return trimmed[0];
        },
        get(id) {
            return load().find((m) => m.id === id) || null;
        },
        delete(id) {
            const current = load();
            const filtered = current.filter((m) => m.id !== id);
            save(filtered);
            return filtered;
        },
        markRead(id, read = true) {
            const current = load();
            const index = current.findIndex((m) => m.id === id);
            if (index === -1) return null;
            current[index] = { ...current[index], read };
            save(current);
            return current[index];
        },
    };
}

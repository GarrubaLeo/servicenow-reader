import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

import { IntegrationTicketMap } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'integration-ticket-map.json');

console.log('[IntegrationMap] DATA_FILE:', DATA_FILE);

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readAll(): IntegrationTicketMap[] {
  ensureStorage();

  const content = fs.readFileSync(DATA_FILE, 'utf-8');

  if (!content.trim()) {
    return [];
  }

  return JSON.parse(content) as IntegrationTicketMap[];
}

function writeAll(items: IntegrationTicketMap[]): void {
  ensureStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export function findBySourceTicket(
  sourceTicketId: string,
  sourceTicketNumber?: string
): IntegrationTicketMap | null {
  const items = readAll();

  return (
    items.find(
      (item) =>
        item.sourceSystem === 'servicenow' &&
        item.targetSystem === 'movidesk' &&
        item.status === 'SENT' &&
        (
          item.sourceTicketId === sourceTicketId ||
          item.sourceTicketNumber === sourceTicketNumber
        )
    ) ?? null
  );
}

export function createIntegrationMap(
  input: Omit<IntegrationTicketMap, 'id' | 'createdAt' | 'updatedAt'>
): IntegrationTicketMap {
  const items = readAll();
  const now = new Date().toISOString();

  const existing = items.find(
    (item) =>
      item.sourceSystem === input.sourceSystem &&
      item.targetSystem === input.targetSystem &&
      (
        item.sourceTicketId === input.sourceTicketId ||
        item.sourceTicketNumber === input.sourceTicketNumber
      )
  );

  if (existing) {
    return existing;
  }

  const item: IntegrationTicketMap = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...input
  };

  items.push(item);
  writeAll(items);

  return item;
}
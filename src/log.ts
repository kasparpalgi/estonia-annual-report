import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

mkdirSync('logs', { recursive: true });

export function log(file: string, message: string): void {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  process.stdout.write(line);
  appendFileSync(join('logs', file), line, 'utf8');
}

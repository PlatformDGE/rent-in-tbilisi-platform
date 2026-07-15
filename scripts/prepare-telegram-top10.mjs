import { readFile, writeFile } from 'node:fs/promises';

const [filePath] = process.argv.slice(2);
if (!filePath) throw new Error('Укажите путь к telegram-top10.json');

const payload = JSON.parse(await readFile(filePath, 'utf8'));
if (!Array.isArray(payload.items)) payload.items = [];

payload.items = payload.items.map((item) => ({
  ...item,
  repostCount: Number.isFinite(Number(item.repostCount ?? item.daily_reposts))
    ? Number(item.repostCount ?? item.daily_reposts)
    : 0,
  latitude: typeof item.latitude === 'number' && Number.isFinite(item.latitude) ? item.latitude : null,
  longitude: typeof item.longitude === 'number' && Number.isFinite(item.longitude) ? item.longitude : null,
}));

await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

type PublishPayload = {
  fileName?: string;
  objectId?: string;
  photos?: string[];
  size?: number;
  text?: string;
};

function readJsonBody(request: IncomingMessage) {
  return new Promise<PublishPayload>((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 20 * 1024 * 1024) reject(new Error('Payload too large'));
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, status: number, data: unknown) {
  response.writeHead(status, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(data));
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 404, { message: 'Not found' });
    return;
  }

  if (request.url === '/api/media/upload') {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 501, {
        message: 'Media storage backend is not connected',
        fileName: body.fileName || 'unknown',
        size: body.size || 0,
      });
    } catch (error) {
      sendJson(response, 400, { message: error instanceof Error ? error.message : 'Bad request' });
    }
    return;
  }

  if (request.url !== '/api/telegram/publish-test' && request.url !== '/api/telegram/publish-production') {
    sendJson(response, 404, { message: 'Not found' });
    return;
  }

  try {
    const body = await readJsonBody(request);
    if (!body.objectId || !body.text) {
      sendJson(response, 400, { message: 'objectId and text are required' });
      return;
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      sendJson(response, 501, {
        message: 'Telegram backend is not connected',
        objectId: body.objectId,
        photosCount: body.photos?.length || 0,
      });
      return;
    }

    sendJson(response, 200, {
      message: request.url.includes('production') ? 'Production publish prepared' : 'Test publish prepared',
      objectId: body.objectId,
      photosCount: body.photos?.length || 0,
    });
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Bad request' });
  }
});

server.listen(3001, () => {
  console.log('Telegram backend example listening on http://127.0.0.1:3001');
});

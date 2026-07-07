import express from 'express';

const app = express();

app.use(express.json({ limit: '20mb' }));

app.post('/api/telegram/publish', async (req, res) => {
  const { objectId, photos, text } = req.body as {
    objectId?: string;
    photos?: string[];
    text?: string;
  };

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
    return res.status(501).json({
      message: 'Telegram backend пока не подключен',
      objectId,
    });
  }

  if (!text || !objectId) {
    return res.status(400).json({ message: 'text and objectId are required' });
  }

  // Production implementation:
  // 1. Upload photos with sendMediaGroup when photos are present.
  // 2. Send text caption/message to TELEGRAM_CHANNEL_ID.
  // 3. Store Telegram message ids in a database.
  return res.json({
    message: 'Prepared for Telegram publishing',
    objectId,
    photosCount: photos?.length || 0,
  });
});

app.listen(3001, () => {
  console.log('Telegram backend example listening on http://127.0.0.1:3001');
});

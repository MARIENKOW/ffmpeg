const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

/**
 * Извлекает Google Drive file ID из разных форматов ссылок:
 *   https://drive.google.com/file/d/FILE_ID/view
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID
 */
const extractGDriveId = (url) => {
  let match;

  match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  throw new Error(`Не удалось извлечь Google Drive file ID из URL: ${url}`);
};

const buildDirectUrl = (fileId) =>
  `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;

/**
 * Скачивает видео с Google Drive и сохраняет во временную папку.
 * Возвращает путь к скачанному файлу.
 */
const downloadFromGDrive = async (driveUrl, destDir) => {
  const fileId    = extractGDriveId(driveUrl);
  const directUrl = buildDirectUrl(fileId);
  const destPath  = path.join(destDir, `${fileId}_source.mp4`);

  const response = await axios.get(directUrl, {
    responseType: 'stream',
    maxRedirects: 10,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 10 * 60 * 1000, // 10 минут
  });

  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('text/html')) {
    throw new Error(
      'Google Drive вернул HTML вместо файла. ' +
      'Убедитесь что файл открыт для всех по ссылке ("Просматривать может любой").'
    );
  }

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return destPath;
};

module.exports = { downloadFromGDrive };

# Video Watermark Server

Express + Prisma + PostgreSQL + ffmpeg.  
Скачивает видео с Google Drive, добавляет вотермарку, создаёт **short** и **full** версии.

---

## Стек

| Слой | Технология |
|------|-----------|
| HTTP-сервер | Express |
| ORM | **Prisma** |
| База данных | PostgreSQL |
| Видеообработка | ffmpeg (fluent-ffmpeg) |
| Скачивание | axios |

---

## Быстрый старт

### 1. Установить зависимости

```bash
npm install
```

### 2. Установить ffmpeg

```bash
# Ubuntu / Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

### 3. Создать базу данных

```sql
CREATE DATABASE video_watermark;
```

### 4. Настроить окружение

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/video_watermark"
PORT=3000
BASE_URL=http://localhost:3000
VIDEOS_DIR=./storage/videos
WATERMARK_PATH=./assets/watermark.png
```

### 5. Применить миграцию (создаст таблицу jobs)

```bash
# Для продакшена — через миграции:
npx prisma migrate dev --name init

# Или просто синхронизировать схему без истории:
npx prisma db push
```

### 6. Положить вотермарку

```
assets/
  watermark.png   ← PNG с прозрачностью, накладывается в правый нижний угол
```

### 7. Запустить

```bash
npm start        # production
npm run dev      # dev с авто-перезапуском
```

---

## Prisma команды

```bash
npx prisma studio          # GUI для просмотра БД в браузере
npx prisma migrate dev     # создать и применить миграцию
npx prisma db push         # синхронизировать схему без миграций
npx prisma generate        # перегенерировать Prisma Client
```

---

## API

### `POST /api/jobs` — создать задачу

```json
{
  "url": "https://drive.google.com/file/d/FILE_ID/view",
  "trimDuration": 30
}
```

`trimDuration` — длительность short-версии в **секундах**.

**Ответ 202** — немедленно, обработка идёт в фоне:
```json
{ "id": "550e8400-e29b-41d4-a716-446655440000" }
```

---

### `GET /api/jobs/:id` — статус задачи

**pending:**
```json
{ "id": "...", "status": "PENDING", "created_at": "...", "updated_at": "..." }
```

**success:**
```json
{
  "id": "...",
  "status": "SUCCESS",
  "short_url": "http://localhost:3000/api/jobs/.../download/short",
  "full_url":  "http://localhost:3000/api/jobs/.../download/full",
  "created_at": "...",
  "updated_at": "..."
}
```

**error:**
```json
{ "id": "...", "status": "ERROR", "error": "описание ошибки", ... }
```

---

### `GET /api/jobs/:id/download/short` — скачать обрезанное видео  
### `GET /api/jobs/:id/download/full` — скачать полное видео

- Отдаёт файл как `attachment`
- **После скачивания файл удаляется с диска**
- Повторный запрос → `410 Gone`
- Когда оба файла скачаны — папка задачи удаляется полностью

---

## Схема Prisma

```prisma
model Job {
  id        String    @id @default(uuid())
  status    JobStatus @default(PENDING)   // PENDING | SUCCESS | ERROR

  shortPath String?   // путь на диске
  fullPath  String?
  shortUrl  String?   // ссылка для скачивания
  fullUrl   String?
  error     String?

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

---

## Жизненный цикл задачи

```
POST /api/jobs
  │
  ├─► prisma.job.create()  →  status: PENDING
  ├─► ответ клиенту: { id }
  │
  └─► [фон]
        ├── скачать видео с Google Drive
        ├── ffmpeg параллельно:
        │     ├── short.mp4  (вотермарка + обрезка)
        │     └── full.mp4   (вотермарка, полная длина)
        ├── удалить исходник
        │
        ├── prisma.job.update()  →  status: SUCCESS + пути + ссылки
        └── (при ошибке)         →  status: ERROR  + error message
```

---

## Важно — Google Drive

Файл должен быть открыт **"Просматривать может любой, у кого есть ссылка"**.  
Иначе Google вернёт HTML-страницу вместо файла.

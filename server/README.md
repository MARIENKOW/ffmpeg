# Server

Express 5 + Prisma 7 + PostgreSQL

## Быстрый старт

### 1. Установить зависимости
```bash
npm install
# автоматически запустит prisma generate
```

### 2. Настроить .env
```bash
cp .env.example .env
# отредактировать .env — вписать DATABASE_URL и остальные переменные
```

### 3. Создать таблицы в PostgreSQL
```bash
npm run db:push          # быстро для разработки
# или
npm run db:migrate       # для прода (сохраняет историю миграций)
```

### 4. Запустить
```bash
npm run dev    # разработка (nodemon)
npm start      # продакшн
```

---

## Структура

```
├── prisma/
│   └── schema.prisma        # схема БД
├── prisma.config.ts          # конфиг подключения Prisma 7
├── generated/
│   └── prisma/               # авто-генерируется после npm install
├── controllers/
│   ├── admin-controller.js
│   └── video-controller.js
├── middlewares/
│   └── authAdmin-middleware.js
├── routers/
│   ├── AdminRouter.js
│   └── VideoRouter.js
├── services/
│   ├── prisma.js             # Prisma Client singleton
│   ├── token-service.js
│   ├── img-service.js
│   ├── video-service.js
│   ├── mail-service.js
│   └── telegram-service.js  # grammy
├── index.js
├── config.js
└── .env.example
```

## API

### Admin
| Метод | URL | Доступ |
|-------|-----|--------|
| POST  | `/api/Admin/signIn` | публичный |
| POST  | `/api/Admin/logOut` | публичный |
| GET   | `/api/Admin/refresh` | публичный |
| GET   | `/api/Admin/aboutAdmin` | auth |
| POST  | `/api/Admin/settings/change-password` | auth |
| POST  | `/api/Admin/settings/change-name` | auth |

### Video
| Метод | URL | Доступ |
|-------|-----|--------|
| GET    | `/api/Video?page=1` | auth |
| POST   | `/api/Video` | auth |
| DELETE | `/api/Video/:id` | auth |
| DELETE | `/api/Video` | auth (удалить все) |

## Зависимости (ключевые изменения vs MySQL+Sequelize)

| Удалено | Добавлено | Причина |
|---------|-----------|---------|
| `sequelize`, `@sequelize/*`, `mysql2` | `@prisma/client`, `@prisma/adapter-pg`, `prisma` | ORM → PostgreSQL |
| `fluent-ffmpeg` | `child_process.spawn` (встроен) | deprecated |
| `node-telegram-bot-api` | `grammy` | тащил deprecated `request` |

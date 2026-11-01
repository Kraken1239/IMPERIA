# Развёртывание IMPERIA на Render

В репозитории готов `render.yaml`: бесплатные Node.js Web Service и PostgreSQL в регионе Frankfurt. Приложение использует стандартный Next.js, серверный каталог и заявки в PostgreSQL. Предыдущая Sites-версия продолжает работать отдельно; данные из её D1-базы автоматически не переносятся.

## Запуск через Blueprint

1. Войдите в Render и откройте https://dashboard.render.com/blueprint/new?repo=https://github.com/Kraken1239/IMPERIA
2. Выберите нужный workspace и ветку `main`. Render должен обнаружить `render.yaml`.
3. Проверьте, что оба ресурса используют **Free**, и создайте Blueprint.
4. Дождитесь `Live` у `imperia-aktau`. Итоговый `onrender.com` адрес выдаёт Render.
5. Откройте Environment веб-сервиса и сохраните автоматически сгенерированный `IMPERIA_ADMIN_KEY` в безопасном месте. Он используется для входа в `/admin` и отличается от ключа прежней Sites-версии.

Через подключённую интеграцию Render создание ресурсов и проверку публикации можно выполнить из чата.

## Если создавать Web Service вручную

- Репозиторий: https://github.com/Kraken1239/IMPERIA
- Ветка: `main`, Root Directory: пусто
- Runtime: Node
- Build: `npm ci --include=dev && npm run build:render`
- Start: `npm run start:render`
- Health check: `/api/health`
- Node: `24.22.0`
- `DATABASE_URL`: Internal Database URL созданной PostgreSQL-базы в том же регионе
- `IMPERIA_ADMIN_KEY`: случайный секрет не короче 24 символов
- `NEXT_TELEMETRY_DISABLED=1`

`PORT` и `RENDER_EXTERNAL_URL` Render устанавливает сам. Сервер слушает `0.0.0.0` и указанный порт. При старте применяются транзакционные миграции `db/postgres/` с блокировкой и проверкой контрольных сумм. Не помещайте секреты в репозиторий.

При подключении своего домена задайте `APP_ORIGIN=https://ваш-домен` и пересоберите сервис. Это адрес сайта для защиты форм и метаданных. Стандартный `onrender.com` адрес определяется автоматически.

## Проверка

- `/api/health` → `{"status":"ok"}` только при доступной БД
- `/api/products` → каталог
- `/admin` → вход по новому ключу
- Заявка → номер → запись в админке → подготовленное сообщение в WhatsApp

Витрина содержит те же демонстрационные образы, пока администратор не добавит реальные товары. Автоматические уведомления менеджеру не подключены.

## Локальная проверка именно Render-версии

`npm run build:render`, затем `node scripts/preview-render.mjs`. Он запускает одноразовую локальную PostgreSQL-совместимую базу PGlite и production Next.js на http://127.0.0.1:10000, ключ берётся из `.dev.vars`. Проверки: `node scripts/check-commerce.mjs http://127.0.0.1:10000`. Данные этой БД исчезают после остановки превью.

Для настоящей PostgreSQL задайте `DATABASE_URL` и `IMPERIA_ADMIN_KEY`, затем `npm run start:render`. Для прежнего Cloudflare/Sites остаются `npm run build` и `npm run dev`; платформенный адаптер выбирается сборщиком.

## Ограничения бесплатного пробного запуска

- Free Web Service засыпает после 15 минут простоя; первый запрос после этого может ждать около минуты.
- Free PostgreSQL истекает через 30 дней и не имеет резервных копий. До запуска реальных продаж переведите базу на подходящий постоянный тариф либо используйте другую постоянную PostgreSQL-базу.
- Заявки хранятся в отдельной БД, а не на временном диске приложения. Пересборка или перезапуск сервиса не очищает базу.
- По `render.yaml` платные ресурсы не запрашиваются. Изменение тарифа выполняется отдельно владельцем.

Документация: https://render.com/docs/deploy-nextjs-app · https://render.com/docs/free · https://render.com/docs/blueprint-spec

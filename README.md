# До встречи

Минималистичный таймер до **14 ноября 2026 года, 00:00 по Москве**. После дедлайна лавандово-графитовая палитра плавно сменяется мятно-сливовой, а таймер — надписью «Время до встречи / Сегодня». Финальное состояние остаётся и в следующие дни.

Стек: Vite, JavaScript, Anime.js, локальный Inter Variable с кириллицей. Все ресурсы включены в сборку; внешние CDN и серверная часть не нужны.

## Локальный запуск

Установите Node.js 24, затем в этой папке:

```sh
npm ci
npm run dev
```

Откройте адрес, который выведет Vite. Для сборки и её проверки:

```sh
npm test
npx playwright install chromium
npm run test:browser
npm run build
npm run preview
```

Готовый статический сайт находится в `dist/`. Не открывайте исходный `index.html` двойным кликом: используйте локальный сервер.

## Публикация на GitHub Pages

1. Создайте пустой репозиторий на GitHub (без автоматически добавленного README).
2. Откройте PowerShell в папке проекта и выполните, заменив USERNAME и REPOSITORY:

```sh
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

3. В репозитории откройте **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Во вкладке **Actions** выберите **Publish to GitHub Pages → Run workflow**, если первый запуск произошёл до настройки Pages.
5. После успешного выполнения ссылка на сайт появится в **Settings → Pages** и в окружении **github-pages**.

При следующих push в `main` workflow сам проверит таймер в браузере, соберёт сайт и опубликует новую версию. Относительный `base: './'` позволяет размещать сайт в подпапке репозитория.

Схема workflow соответствует [документации GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Анимации используют [Anime.js](https://animejs.com/documentation/animation/).

## Настройка

- Дедлайн: `src/timer.js`, константа `TARGET_TIME` с явным UTC+03:00.
- Палитра и оформление: `src/style.css`; финальная палитра: `src/main.js`.
- Фоновая фотография: `public/images/arrival-restored.png`. Оригинал сохранён рядом как `arrival.jpg`.
- Логика расчёта берёт время устройства; точность зависит от корректности его часов.
- Учтён `prefers-reduced-motion`; секунды не объявляются скринридером каждую секунду.

Фотография входит в публикуемый сайт. CSS-прозрачность делает её малозаметной на экране, но исходный файл остаётся доступным посетителям.

/* 镜魇 · 离线缓存
   改了样式或脚本后：把下面的 VERSION 加一，并同步 index.html 里的 ?v= 数字。 */

const VERSION = 'jingyan-v32';

/* 与 index.html 里的实际引用保持一致（漏缓存会导致断网时“网络连接失败”） */
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=23',
  './fix.css?v=1',
  './extras.css?v=1',
  './pet.css?v=4',
  './app.js?v=19',
  './mirror.js',
  './mirror-scene.js?v=2',
  './tuning.js?v=1',
  './call.js?v=2',
  './fix.js?v=1',
  './extras.js?v=1',
  './pet.js?v=4',
  './favicon.svg',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // 逐个缓存：单个文件失败不再拖垮整个 SW 安装
      // reload：绕过 HTTP 缓存，避免更新后仍拿到旧文件
      .then((cache) =>
        Promise.allSettled(
          ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 页面导航：优先联网拿新版，断网或服务异常时回落到缓存的首页
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cached = (await caches.match('./index.html')) || (await caches.match('./'));
        try {
          const response = await fetch(request, { cache: 'no-cache' });
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put('./index.html', copy)).catch(() => {});
            return response;
          }
          return cached || response;
        } catch (error) {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // 静态资源：命中缓存立即返回，同时后台联网刷新；
  // 未命中缓存才走网络。无论哪条路都不会把空响应交给页面
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      const cached =
        (await cache.match(request)) ||
        (await caches.match(request, { ignoreSearch: true }));

      const fetchAndCache = fetch(request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            cache.put(request, copy).catch(() => {});
          }
          return response;
        });

      if (cached) {
        fetchAndCache.catch(() => {}); /* 后台刷新，失败不影响当前页面 */
        return cached;
      }
      try {
        return await fetchAndCache;
      } catch (error) {
        return Response.error();
      }
    })()
  );
});

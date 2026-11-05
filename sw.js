/* 镜魇 · 离线缓存
   改了样式或脚本后：把下面的 VERSION 加一，并同步 index.html 里的 ?v= 数字。 */

const VERSION = 'jingyan-v23';

const ASSETS = [
  './',
  './index.html',
  './styles.css?v=23',
  './app.js?v=19',
  './call.js?v=2',
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
      // reload：绕过 HTTP 缓存，避免更新后仍拿到旧文件
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
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

  // 静态资源：先用缓存，同时后台更新
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});

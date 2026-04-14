const CACHE_NAME = 'ai-english-learner-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求 - 使用 Stale-While-Revalidate 策略
self.addEventListener('fetch', (event) => {
  // 只缓存 GET 请求，忽略 POST/DELETE/PUT 等写操作
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 不缓存 API 请求（Supabase、Aliyun 等）
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase') || 
      url.hostname.includes('aliyuncs') ||
      url.hostname.includes('dashscope')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // 网络失败时返回缓存
            return cachedResponse;
          });

        // 如果有缓存立即返回，同时更新缓存
        return cachedResponse || fetchPromise;
      })
  );
});

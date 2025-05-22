// Service Worker aprimorado para PWA com cache abrangente
const CACHE_NAME = 'portfolio-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/script.js',
    '/assets/js/sw.js',
    '/assets/js/github-api.js',
    '/manifest.json',
    '/pages/certificates-in-progress.html',
    '/pages/curriculum.html',
    '/pages/mentors.html',
    '/pages/projetos.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// Instalação e cache de recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Limpeza de caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estratégia de cache network-first para API e cache-first para recursos estáticos
self.addEventListener('fetch', event => {
    // Verificar se a requisição é para a API do GitHub
    if (event.request.url.includes('api.github.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // Para outros recursos, tenta primeiro no cache
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(fetchResponse => {
                    // Armazena no cache recursos que são da origem do site
                    if (fetchResponse.ok && event.request.url.startsWith(self.location.origin)) {
                        const responseClone = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return fetchResponse;
                });
            })
        );
    }
});

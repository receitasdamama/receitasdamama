const CACHE_NAME = 'receitas-mama-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

const FALLBACK_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline | Receitas da Mama</title>
<style>
body{
font-family:Arial,sans-serif;
padding:30px;
text-align:center;
background:#fff8f3;
color:#333;
}
h1{color:#ff6b35}
a{
display:inline-block;
margin-top:20px;
padding:12px 18px;
background:#ff6b35;
color:#fff;
text-decoration:none;
border-radius:8px;
}
</style>
</head>
<body>
<h1>Você está offline 🍰</h1>
<p>Sem internet no momento. Tente novamente em instantes.</p>
<a href="https://receitasmamachic.blogspot.com/">Voltar ao blog</a>
</body>
</html>
`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached => {
          return cached || new Response(FALLBACK_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
      )
  );
});

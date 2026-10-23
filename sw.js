/* Service worker mínimo para poder instalar el panel como app. No guarda datos: todo va a la red. */
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => { /* la red responde normal */ });

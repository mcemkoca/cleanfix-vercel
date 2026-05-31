// CleanFix Service Worker
// Cache-first for static assets, network-first for dynamic content

const CACHE_NAME = 'cleanfix-v2.3';
const STATIC_CACHE = 'cleanfix-static-v2.3';

const STATIC_ASSETS = [
  '/cleanfix-vercel/',
  '/cleanfix-vercel/index.html',
  '/cleanfix-vercel/login.html',
  '/cleanfix-vercel/dashboard.html',
  '/cleanfix-vercel/customer-portal.html',
  '/cleanfix-vercel/company.html',
  '/cleanfix-vercel/company-bookings.html',
  '/cleanfix-vercel/company-calendar.html',
  '/cleanfix-vercel/company-customers.html',
  '/cleanfix-vercel/company-equipment.html',
  '/cleanfix-vercel/company-expenses.html',
  '/cleanfix-vercel/company-invoices.html',
  '/cleanfix-vercel/company-maintenance.html',
  '/cleanfix-vercel/company-profile.html',
  '/cleanfix-vercel/company-quality.html',
  '/cleanfix-vercel/company-quotes.html',
  '/cleanfix-vercel/company-reviews.html',
  '/cleanfix-vercel/company-sectors.html',
  '/cleanfix-vercel/company-services.html',
  '/cleanfix-vercel/company-staff.html',
  '/cleanfix-vercel/company-stock.html',
  '/cleanfix-vercel/company-tools.html',
  '/cleanfix-vercel/css/main.css',
  '/cleanfix-vercel/css/components.css',
  '/cleanfix-vercel/css/dashboard.css',
  '/cleanfix-vercel/js/app.js',
  '/cleanfix-vercel/js/pwa.js',
  '/cleanfix-vercel/manifest.json',
  '/cleanfix-vercel/404.html',
  '/cleanfix-vercel/company-analytics.html',
  '/cleanfix-vercel/company-sectors.html',
  '/cleanfix-vercel/employee-dashboard.html',
  '/cleanfix-vercel/employee.html',
  '/cleanfix-vercel/employee-tasks.html',
  '/cleanfix-vercel/pricing.html',
  '/cleanfix-vercel/products.html',
  '/cleanfix-vercel/reports.html',
  '/cleanfix-vercel/settings.html',
  '/cleanfix-vercel/support.html',
  '/cleanfix-vercel/company.html',
  '/cleanfix-vercel/company-quotes.html',
  '/cleanfix-vercel/assets/icon-192.png',
  '/cleanfix-vercel/assets/icon-72.png',
  '/cleanfix-vercel/assets/icon-96.png',
  '/cleanfix-vercel/assets/icon-128.png',
  '/cleanfix-vercel/assets/icon-152.png',
  '/cleanfix-vercel/assets/icon-512.png',
  '/cleanfix-vercel/sectors/barberpro/barberpro-appointments.html',
  '/cleanfix-vercel/sectors/barberpro/barberpro-bookings.html',
  '/cleanfix-vercel/sectors/barberpro/barberpro-customers.html',
  '/cleanfix-vercel/sectors/barberpro/barberpro-inventory.html',
  '/cleanfix-vercel/sectors/barberpro/barberpro-loyalty.html',
  '/cleanfix-vercel/sectors/barberpro/barberpro-reports.html',
  '/cleanfix-vercel/sectors/barberpro/barberpro-services.html',
  '/cleanfix-vercel/sectors/barberpro/barberpro-staff.html',
  '/cleanfix-vercel/sectors/barberpro/customer-portal.html',
  '/cleanfix-vercel/sectors/barberpro/dashboard.html',
  '/cleanfix-vercel/sectors/barberpro/index.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-calendar.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-costs.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-equipment.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-projects.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-quotes.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-reports.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-settings.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-site.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-staff.html',
  '/cleanfix-vercel/sectors/buildpro/buildpro-stock.html',
  '/cleanfix-vercel/sectors/buildpro/dashboard.html',
  '/cleanfix-vercel/sectors/buildpro/index.html',
  '/cleanfix-vercel/sectors/carwash/bookings.html',
  '/cleanfix-vercel/sectors/carwash/customers.html',
  '/cleanfix-vercel/sectors/carwash/index.html',
  '/cleanfix-vercel/sectors/carwash/invoices.html',
  '/cleanfix-vercel/sectors/carwash/services.html',
  '/cleanfix-vercel/sectors/carwash/staff.html',
  '/cleanfix-vercel/sectors/cleaning/analytics.html',
  '/cleanfix-vercel/sectors/cleaning/bookings.html',
  '/cleanfix-vercel/sectors/cleaning/calendar.html',
  '/cleanfix-vercel/sectors/cleaning/customers.html',
  '/cleanfix-vercel/sectors/cleaning/equipment.html',
  '/cleanfix-vercel/sectors/cleaning/expenses.html',
  '/cleanfix-vercel/sectors/cleaning/index.html',
  '/cleanfix-vercel/sectors/cleaning/invoices.html',
  '/cleanfix-vercel/sectors/cleaning/maintenance.html',
  '/cleanfix-vercel/sectors/cleaning/profile.html',
  '/cleanfix-vercel/sectors/cleaning/quality.html',
  '/cleanfix-vercel/sectors/cleaning/quotes.html',
  '/cleanfix-vercel/sectors/cleaning/reviews.html',
  '/cleanfix-vercel/sectors/cleaning/services.html',
  '/cleanfix-vercel/sectors/cleaning/staff.html',
  '/cleanfix-vercel/sectors/cleaning/stock.html',
  '/cleanfix-vercel/sectors/cleaning/tools.html',
  '/cleanfix-vercel/sectors/construction/bookings.html',
  '/cleanfix-vercel/sectors/construction/customers.html',
  '/cleanfix-vercel/sectors/construction/index.html',
  '/cleanfix-vercel/sectors/construction/invoices.html',
  '/cleanfix-vercel/sectors/construction/services.html',
  '/cleanfix-vercel/sectors/construction/staff.html',
  '/cleanfix-vercel/sectors/elektropro/dashboard.html',
  '/cleanfix-vercel/sectors/elektropro/elektropro-certs.html',
  '/cleanfix-vercel/sectors/elektropro/elektropro-inspection.html',
  '/cleanfix-vercel/sectors/elektropro/elektropro-projects.html',
  '/cleanfix-vercel/sectors/elektropro/elektropro-suppliers.html',
  '/cleanfix-vercel/sectors/elektropro/index.html',
  '/cleanfix-vercel/sectors/marketpro/dashboard.html',
  '/cleanfix-vercel/sectors/marketpro/index.html',
  '/cleanfix-vercel/sectors/marketpro/marketpro-products.html',
  '/cleanfix-vercel/sectors/marketpro/marketpro-sales.html',
  '/cleanfix-vercel/sectors/marketpro/marketpro-stock.html',
  '/cleanfix-vercel/sectors/marketpro/marketpro-suppliers.html',
  '/cleanfix-vercel/sectors/restopro/dashboard.html',
  '/cleanfix-vercel/sectors/restopro/index.html',
  '/cleanfix-vercel/sectors/restopro/restopro-menu.html',
  '/cleanfix-vercel/sectors/restopro/restopro-orders.html',
  '/cleanfix-vercel/sectors/restopro/restopro-staff.html',
  '/cleanfix-vercel/sectors/restopro/restopro-tables.html',
  '/cleanfix-vercel/sectors/woodpro/dashboard.html',
  '/cleanfix-vercel/sectors/woodpro/index.html',
  '/cleanfix-vercel/sectors/woodpro/woodpro-cnc.html',
  '/cleanfix-vercel/sectors/woodpro/woodpro-customers.html',
  '/cleanfix-vercel/sectors/woodpro/woodpro-inventory.html',
  '/cleanfix-vercel/sectors/woodpro/woodpro-orders.html',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to cache some assets:', err);
        // Continue even if some assets fail (they may not exist on all deployments)
        return Promise.resolve();
      });
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for static, network-first for API/data
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !url.pathname.startsWith('/cleanfix-vercel/')) {
    return;
  }

  // HTML pages — network first, fallback to cache
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return a simple offline page if nothing cached
            return new Response(
              '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CleanFix - Çevrimdışı</title><style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#e2e8f0;text-align:center;}</style></head><body><div><h1>🌙 Çevrimdışı Mod</h1><p>Bu sayfa daha önce ziyaret edilmemiş.<br>Lütfen internet bağlantınızı kontrol edin.</p><a href="/cleanfix-vercel/index.html" style="color:#2dd4bf;text-decoration:none;">Ana Sayfaya Dön</a></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts) — cache first
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Default — network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background Sync placeholder
self.addEventListener('sync', (event) => {
  if (event.tag === 'cleanfix-sync') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SYNC_COMPLETE' }));
      })
    );
  }
});

// Push notification placeholder
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'CleanFix', {
        body: data.body || 'Yeni bildirim',
        icon: '/cleanfix-vercel/assets/icon-192.png',
        badge: '/cleanfix-vercel/assets/icon-72.png',
        tag: data.tag || 'cleanfix-default'
      })
    );
  }
});

// PakuFit service worker
// 方針: ネットワーク優先。GET のページ遷移(navigate)が失敗したときだけ
// オフラインフォールバックを返す。API/認証/動的データはキャッシュしない
// （SSR 認証クッキーや RLS と干渉させないため）。
const CACHE = "pakufit-shell-v1"
const OFFLINE_URL = "/offline.html"

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)))
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  if (request.mode !== "navigate") return

  event.respondWith(
    fetch(request).catch(() => caches.match(OFFLINE_URL))
  )
})

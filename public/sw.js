// PakuFit service worker
// 方針:
//   - ページ遷移(navigate)はネットワーク優先。失敗時のみオフラインフォールバックを返す。
//     （SSR 認証クッキーや RLS と干渉させないため、ページHTMLはキャッシュしない）
//   - 不変な静的アセット(/_next/static/・/icons/)は cache-first で配信し、
//     再訪・低速回線・一時オフライン時の読み込みを安定させる。
//   - API/認証/動的データはキャッシュしない。
const CACHE = "pakufit-shell-v2"
const OFFLINE_URL = "/offline.html"

// 名前が安定している(ハッシュ無し)アセットのみ事前キャッシュする。
// ハッシュ付きの /_next/static/ は実行時 cache-first で取り込む。
const PRECACHE_URLS = [OFFLINE_URL, "/icons/icon.svg", "/icons/icon-192.png", "/icons/maskable.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // 個別失敗が install 全体を壊さないようにしつつ、最低限オフラインページは確保する。
      Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url))).then(() => cache.add(OFFLINE_URL))
    )
  )
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

// 不変な静的アセット(content-hash 付き or 安定名のアイコン)かどうか。
const isCacheableStatic = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"))

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  // ページ遷移: ネットワーク優先 + オフラインフォールバック。
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)))
    return
  }

  // 静的アセット: cache-first（無ければ取得してキャッシュ）。
  const url = new URL(request.url)
  if (isCacheableStatic(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            // 正常応答のみ複製してキャッシュする（opaque/エラーは保存しない）。
            if (response && response.status === 200 && response.type === "basic") {
              const copy = response.clone()
              caches.open(CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          })
      )
    )
  }
})

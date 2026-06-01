"use client"

import { useEffect } from "react"

// service worker は本番ビルドでのみ登録する。
// 開発時(next dev)は HMR と干渉しうるため登録しない。
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 登録失敗は致命的ではないため握りつぶす（PWA 非対応環境など）
      })
    }

    if (document.readyState === "complete") {
      register()
    } else {
      window.addEventListener("load", register)
      return () => window.removeEventListener("load", register)
    }
  }, [])

  return null
}

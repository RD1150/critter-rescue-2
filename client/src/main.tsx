import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then(() => {
      if (!('caches' in window)) return;
      const shellAssets = [
        '/',
        ...Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]')).map((element) => element.src),
        ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((element) => element.href),
      ];
      void caches.open('critter-rescue-shell-v1').then((cache) => Promise.all(shellAssets.map((asset) => cache.add(asset).catch(() => undefined))));
    }).catch(() => {});
  }, { once: true });
}

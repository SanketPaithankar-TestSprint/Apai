/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JAVA_BACKEND_URL?: string;
  readonly VITE_CDN_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


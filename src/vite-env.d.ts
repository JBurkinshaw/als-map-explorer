/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALS_API_KEY: string;
  readonly VITE_AWS_REGION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

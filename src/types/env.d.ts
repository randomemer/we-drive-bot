declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "test" | "dev" | "prod";
    }
  }
}

export {};

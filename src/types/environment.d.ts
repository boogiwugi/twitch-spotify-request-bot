import { IEnvironmentVariables } from '@/config/Config';

declare global {
  namespace NodeJS {
    type ProcessEnv = IEnvironmentVariables;
  }
}
export {};

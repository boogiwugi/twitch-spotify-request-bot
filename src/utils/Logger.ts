export function trace(message?: any, ...optionalParams: any[]): void {
  console.trace(message, optionalParams);
}

export function debug(message?: any, ...optionalParams: any[]): void {
  console.debug(message, optionalParams);
}

export function info(message?: any, ...optionalParams: any[]): void {
  log(message, optionalParams);
}

export function log(message?: any, ...optionalParams: any[]): void {
  console.log(message, optionalParams);
}

export function warn(message?: any, ...optionalParams: any[]): void {
  console.warn(message, optionalParams);
}

export function error(message?: any, ...optionalParams: any[]): void {
  console.error(message, optionalParams);
}

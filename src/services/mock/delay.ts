export const delay = (ms = 500) => new Promise(resolve => window.setTimeout(resolve, ms));

// src/utils/cacheUtils.ts

export const setCache = (key: string, data: any, ttl: number) => {
    const now = new Date().getTime();
    const item = {
      data,
      expiry: now + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };
  
  export const getCache = (key: string) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
  
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
  
    if (now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
  
    return item.data;
  };
  
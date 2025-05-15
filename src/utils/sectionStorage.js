const isClint = typeof window !== 'undefined';

export const getSessionsStorage = (key, initialValue) => {
    if (!isClint) return initialValue;

    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored): initialValue;
};

export const setSessionsStorage = (key, value) => {
   if (isClint) {
    setSessionsStorage.setItem(key, JSON.stringify(value))
   }
};
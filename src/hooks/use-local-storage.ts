import { useState, useEffect } from "react";

export function useLocalStorage<T>(
    key: string,
    defaultValue: T
): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(defaultValue);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item) as T;
                setStoredValue(parsed);
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
    }, [key]);

    const setValue = (value: T) => {
        try {
            setStoredValue(value);
            if (isClient) {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}

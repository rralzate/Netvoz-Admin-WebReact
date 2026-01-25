import { StorageEnum } from "@/core/types/enum";

export function getStringItem(key: StorageEnum): string | null {
	try {
		return localStorage.getItem(key);
	} catch (error) {
		console.error(`Error getting item ${key} from localStorage:`, error);
		return null;
	}
}

export function setStringItem(key: StorageEnum, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch (error) {
		console.error(`Error setting item ${key} to localStorage:`, error);
	}
}

export function removeItem(key: StorageEnum): void {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.error(`Error removing item ${key} from localStorage:`, error);
	}
}

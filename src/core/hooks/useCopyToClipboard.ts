import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseCopyToClipboardReturn {
	/** The copied text value */
	copiedText: string | null;
	/** Function to copy text to clipboard */
	copyFn: (text: string) => Promise<boolean>;
	/** Reset the copied state */
	reset: () => void;
}

/**
 * Hook to copy text to clipboard
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
	const [copiedText, setCopiedText] = useState<string | null>(null);

	const copyFn = useCallback(async (text: string): Promise<boolean> => {
		if (!navigator?.clipboard) {
			console.warn("Clipboard API not available");
			toast.error("Clipboard not available");
			return false;
		}

		try {
			await navigator.clipboard.writeText(text);
			setCopiedText(text);
			toast.success("Copied to clipboard");
			return true;
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
			toast.error("Failed to copy");
			setCopiedText(null);
			return false;
		}
	}, []);

	const reset = useCallback(() => {
		setCopiedText(null);
	}, []);

	return {
		copiedText,
		copyFn,
		reset,
	};
}

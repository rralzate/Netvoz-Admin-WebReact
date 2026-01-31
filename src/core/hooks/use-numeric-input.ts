import { useCallback, useState, type ChangeEvent } from "react";

interface UseNumericInputOptions {
	value?: number;
	defaultPlaceholder?: string;
	onChange?: (value: number | null) => void;
}

export function useNumericInput(options: UseNumericInputOptions = {}) {
	const { value = 0, defaultPlaceholder = "0", onChange } = options;

	const [isFocused, setIsFocused] = useState(false);

	const displayValue = value === 0 && !isFocused ? "" : String(value);
	const placeholder = isFocused ? "" : defaultPlaceholder;

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const val = e.target.value;
			if (val === "") {
				onChange?.(0);
			} else {
				const num = Number.parseFloat(val);
				if (!Number.isNaN(num)) {
					onChange?.(num);
				}
			}
		},
		[onChange],
	);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	const handleBlur = useCallback(() => {
		setIsFocused(false);
	}, []);

	return {
		displayValue,
		placeholder,
		handleChange,
		handleFocus,
		handleBlur,
	};
}

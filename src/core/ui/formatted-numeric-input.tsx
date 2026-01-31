import type * as React from "react";
import { forwardRef, useState, useCallback, type FocusEvent, type ChangeEvent } from "react";
import { Input } from "./input";
import { cn } from "@/core/utils";

interface FormattedNumericInputProps
	extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange" | "onFocus" | "onBlur" | "placeholder"> {
	/**
	 * Valor numérico del campo
	 */
	value?: number;
	/**
	 * Callback que se ejecuta cuando el valor cambia
	 */
	onChange?: (value: number) => void;
	/**
	 * Placeholder por defecto cuando el campo está vacío
	 * @default "0"
	 */
	defaultPlaceholder?: string;
	/**
	 * Locale para formatear números
	 * @default "es-CO"
	 */
	locale?: string;
}

/**
 * Componente de entrada numérica con formateo de separadores de miles y placeholder dinámico "0"
 *
 * Este componente mejora la experiencia de usuario en dispositivos táctiles al:
 * - Mostrar un placeholder "0" cuando el campo está vacío o tiene valor 0
 * - Formatear números con separadores de miles cuando el campo no tiene foco
 * - Mostrar el valor sin formato cuando el usuario está editando
 * - Ocultar el placeholder cuando el usuario hace foco en el campo
 * - Restaurar el placeholder cuando el usuario abandona el campo sin ingresar datos
 *
 * @example
 * ```tsx
 * <FormattedNumericInput
 *   value={stockMinimo}
 *   onChange={(value) => setStockMinimo(value)}
 *   min={0}
 *   step={1}
 * />
 * ```
 */
const FormattedNumericInput = forwardRef<HTMLInputElement, FormattedNumericInputProps>(
	({ value = 0, onChange, defaultPlaceholder = "0", locale = "es-CO", className, ...props }, ref) => {
		const [isFocused, setIsFocused] = useState(false);
		const [internalValue, setInternalValue] = useState<string>("");

		// Convertir el valor numérico a string para el display
		const numericValue = value ?? 0;
		const shouldShowPlaceholder =
			!isFocused &&
			(numericValue === 0 || numericValue === null || numericValue === undefined || Number.isNaN(numericValue));

		// Formatear número con separadores de miles
		const formatNumber = useCallback(
			(num: number): string => {
				if (num === 0 || num === null || num === undefined || Number.isNaN(num)) {
					return "";
				}
				return num.toLocaleString(locale, {
					minimumFractionDigits: 0,
					maximumFractionDigits: 2,
				});
			},
			[locale],
		);

		// Parsear string con formato a número
		const parseFormattedNumber = useCallback((str: string): number => {
			if (!str || str.trim() === "") return 0;
			// Remover espacios y puntos (separadores de miles), reemplazar coma por punto
			const normalized = str.replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
			const result = parseFloat(normalized);
			return Number.isNaN(result) ? 0 : result;
		}, []);

		// Determinar el valor a mostrar
		const displayValue = isFocused ? internalValue : formatNumber(numericValue);

		// Determinar el placeholder
		const placeholder = shouldShowPlaceholder ? defaultPlaceholder : "";

		const handleChange = useCallback(
			(event: ChangeEvent<HTMLInputElement>) => {
				const inputValue = event.target.value;
				setInternalValue(inputValue);

				// Convertir a número y llamar al onChange
				const numericValue = parseFormattedNumber(inputValue);
				onChange?.(numericValue);
			},
			[onChange, parseFormattedNumber],
		);

		const handleFocus = useCallback(
			(_event: FocusEvent<HTMLInputElement>) => {
				setIsFocused(true);
				// Al hacer foco, establecer el valor interno sin formato
				const currentValue =
					numericValue === 0 || numericValue === null || numericValue === undefined || Number.isNaN(numericValue)
						? ""
						: String(numericValue);
				setInternalValue(currentValue);
			},
			[numericValue],
		);

		const handleBlur = useCallback(
			(event: FocusEvent<HTMLInputElement>) => {
				setIsFocused(false);

				// Si el campo está vacío o tiene solo espacios, restaurar a 0
				const inputValue = event.target.value.trim();
				if (inputValue === "" || inputValue === "-" || inputValue === "." || inputValue === "-.") {
					setInternalValue("");
					onChange?.(0);
				} else {
					// Limpiar el valor interno, el valor numérico ya fue actualizado en handleChange
					setInternalValue("");
				}
			},
			[onChange],
		);

		return (
			<Input
				ref={ref}
				type="text"
				inputMode="decimal"
				value={displayValue}
				placeholder={placeholder}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				className={cn(className)}
				{...props}
			/>
		);
	},
);

FormattedNumericInput.displayName = "FormattedNumericInput";

export { FormattedNumericInput };

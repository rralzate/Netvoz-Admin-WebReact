import type * as React from "react";
import { forwardRef } from "react";
import { Input } from "./input";
import { useNumericInput } from "../hooks/use-numeric-input";
import { cn } from "@/core/utils";

interface NumericInputProps
	extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange" | "onFocus" | "onBlur" | "placeholder"> {
	/**
	 * Valor numérico del campo
	 */
	value?: number;
	/**
	 * Callback que se ejecuta cuando el valor cambia
	 */
	onChange?: (value: number | null) => void;
	/**
	 * Placeholder por defecto cuando el campo está vacío
	 * @default "0"
	 */
	defaultPlaceholder?: string;
}

/**
 * Componente de entrada numérica con placeholder dinámico "0"
 *
 * Este componente mejora la experiencia de usuario en dispositivos táctiles al:
 * - Mostrar un placeholder "0" cuando el campo está vacío o tiene valor 0
 * - Ocultar el placeholder cuando el usuario hace foco en el campo
 * - Restaurar el placeholder cuando el usuario abandona el campo sin ingresar datos
 *
 * @example
 * ```tsx
 * <NumericInput
 *   value={stockMinimo}
 *   onChange={(value) => setStockMinimo(value)}
 *   min={0}
 *   step={1}
 * />
 * ```
 */
const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
	({ value = 0, onChange, defaultPlaceholder = "0", className, ...props }, ref) => {
		const { displayValue, placeholder, handleChange, handleFocus, handleBlur } = useNumericInput({
			value,
			defaultPlaceholder,
			onChange,
		});

		return (
			<Input
				ref={ref}
				type="number"
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

NumericInput.displayName = "NumericInput";

export { NumericInput };

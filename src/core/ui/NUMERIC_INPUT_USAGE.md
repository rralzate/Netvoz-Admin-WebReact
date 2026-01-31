# Guía de Uso: NumericInput y useNumericInput

Esta solución mejora la experiencia de usuario en dispositivos táctiles al proporcionar un placeholder dinámico "0" en campos de entrada numéricos.

## Problema Resuelto

En pantallas táctiles, los usuarios tienen dificultad para posicionar el cursor correctamente, lo que resulta en que ingresen valores con ceros a la izquierda (por ejemplo, "0150" en lugar de "150"), generando datos incorrectos.

## Solución

La solución proporciona:
- Un placeholder "0" que se muestra cuando el campo está vacío o tiene valor 0
- El placeholder desaparece automáticamente cuando el usuario hace foco en el campo
- El placeholder reaparece cuando el usuario abandona el campo sin ingresar datos

## Componentes Disponibles

### 1. `NumericInput` - Componente Wrapper

Componente listo para usar que encapsula toda la lógica del placeholder dinámico.

**Ubicación:** `@/core/ui/numeric-input`

**Props:**
- `value?: number` - Valor numérico del campo
- `onChange?: (value: number) => void` - Callback cuando el valor cambia
- `defaultPlaceholder?: string` - Placeholder por defecto (default: "0")
- Todas las props estándar de `<input>` excepto `type`, `value`, `onChange`, `onFocus`, `onBlur`, `placeholder`

### 2. `useNumericInput` - Hook Personalizado

Hook que proporciona la lógica para manejar el placeholder dinámico. Útil cuando necesitas más control o integración con otras librerías.

**Ubicación:** `@/core/hooks/use-numeric-input`

**Parámetros:**
- `value?: number | string` - Valor inicial del campo
- `defaultPlaceholder?: string` - Placeholder por defecto (default: "0")
- `onChange?: (value: number) => void` - Callback cuando el valor cambia
- `onFocus?: (event: FocusEvent<HTMLInputElement>) => void` - Callback cuando el campo recibe foco
- `onBlur?: (event: FocusEvent<HTMLInputElement>) => void` - Callback cuando el campo pierde foco

**Retorna:**
- `displayValue: string` - Valor actual del campo (string para el input)
- `placeholder: string` - Placeholder a mostrar
- `isFocused: boolean` - Si el campo tiene foco
- `handleChange: (event: ChangeEvent<HTMLInputElement>) => void` - Handler para onChange
- `handleFocus: (event: FocusEvent<HTMLInputElement>) => void` - Handler para onFocus
- `handleBlur: (event: FocusEvent<HTMLInputElement>) => void` - Handler para onBlur

## Ejemplos de Uso

### Ejemplo 1: Uso Básico con Estado Local

```tsx
import { useState } from "react";
import { NumericInput } from "@/core/ui/numeric-input";
import { Label } from "@/core/ui/label";

function StockForm() {
  const [stockMinimo, setStockMinimo] = useState<number>(0);

  return (
    <div className="space-y-2">
      <Label htmlFor="stockMinimo">Stock Mínimo</Label>
      <NumericInput
        id="stockMinimo"
        min={0}
        step={1}
        value={stockMinimo}
        onChange={(value) => setStockMinimo(value)}
      />
    </div>
  );
}
```

### Ejemplo 2: Con React Hook Form usando Controller

```tsx
import { Controller, useForm } from "react-hook-form";
import { NumericInput } from "@/core/ui/numeric-input";
import { Label } from "@/core/ui/label";

function ProductForm() {
  const { control } = useForm();

  return (
    <Controller
      name="stockMinimo"
      control={control}
      render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor="stockMinimo">Stock Mínimo</Label>
          <NumericInput
            id="stockMinimo"
            min={0}
            step={1}
            value={field.value}
            onChange={field.onChange}
          />
        </div>
      )}
    />
  );
}
```

### Ejemplo 3: Con React Hook Form usando register

```tsx
import { useForm } from "react-hook-form";
import { NumericInput } from "@/core/ui/numeric-input";
import { Label } from "@/core/ui/label";

function ProductForm() {
  const { register, setValue, watch } = useForm();

  const stockMinimo = watch("stockMinimo") || 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="stockMinimo">Stock Mínimo</Label>
      <NumericInput
        id="stockMinimo"
        min={0}
        step={1}
        value={stockMinimo}
        onChange={(value) => setValue("stockMinimo", value)}
        {...register("stockMinimo", { valueAsNumber: true })}
      />
    </div>
  );
}
```

### Ejemplo 4: Usando el Hook Directamente

```tsx
import { useNumericInput } from "@/core/hooks/use-numeric-input";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";

function CustomNumericField() {
  const [value, setValue] = useState<number>(0);
  
  const numericInput = useNumericInput({
    value,
    onChange: setValue,
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="customField">Campo Personalizado</Label>
      <Input
        id="customField"
        type="number"
        min={0}
        step={0.01}
        value={numericInput.displayValue}
        placeholder={numericInput.placeholder}
        onChange={numericInput.handleChange}
        onFocus={numericInput.handleFocus}
        onBlur={numericInput.handleBlur}
      />
    </div>
  );
}
```

### Ejemplo 5: Con Placeholder Personalizado

```tsx
import { NumericInput } from "@/core/ui/numeric-input";
import { Label } from "@/core/ui/label";

function PriceForm() {
  const [price, setPrice] = useState<number>(0);

  return (
    <div className="space-y-2">
      <Label htmlFor="price">Precio</Label>
      <NumericInput
        id="price"
        min={0}
        step={0.01}
        value={price}
        onChange={setPrice}
        defaultPlaceholder="0.00"
      />
    </div>
  );
}
```

### Ejemplo 6: Múltiples Campos Numéricos

```tsx
import { useState } from "react";
import { NumericInput } from "@/core/ui/numeric-input";
import { Label } from "@/core/ui/label";

function InventoryForm() {
  const [stockMinimo, setStockMinimo] = useState<number>(0);
  const [stockActual, setStockActual] = useState<number>(0);
  const [precioCompra, setPrecioCompra] = useState<number>(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="stockMinimo">Stock Mínimo</Label>
        <NumericInput
          id="stockMinimo"
          min={0}
          step={1}
          value={stockMinimo}
          onChange={setStockMinimo}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stockActual">Stock Actual</Label>
        <NumericInput
          id="stockActual"
          min={0}
          step={1}
          value={stockActual}
          onChange={setStockActual}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="precioCompra">Precio de Compra</Label>
        <NumericInput
          id="precioCompra"
          min={0}
          step={0.01}
          value={precioCompra}
          onChange={setPrecioCompra}
        />
      </div>
    </div>
  );
}
```

## Implementación Actual

La solución ya está implementada en:

1. **DirectStockManager** (`src/features/products/presentation/components/product-tabs/DirectStockManager.tsx`)
   - Campos: Stock Mínimo, Stock Actual, Precio de Compra

2. **IngredientForm** (`src/features/ingredients/presentation/components/IngredientForm.tsx`)
   - Campos: Stock Mínimo, Stock Inicial, Precio de Compra

## Migración de Campos Existentes

Para migrar un campo numérico existente:

### Antes:
```tsx
<Input
  type="number"
  min="0"
  step="1"
  value={stockMinimo}
  onChange={(e) => setStockMinimo(parseFloat(e.target.value) || 0)}
/>
```

### Después:
```tsx
<NumericInput
  min={0}
  step={1}
  value={stockMinimo}
  onChange={setStockMinimo}
/>
```

## Notas Importantes

1. **No uses el hook dentro de funciones render**: Si necesitas usar `useNumericInput` directamente, asegúrate de llamarlo en el nivel superior del componente, no dentro de funciones de render como `Controller.render`.

2. **Compatibilidad con React Hook Form**: El componente `NumericInput` es totalmente compatible con React Hook Form usando `Controller`.

3. **Valores por defecto**: Si el valor es `0`, `null`, `undefined` o `NaN`, se mostrará el placeholder "0".

4. **Limpieza automática**: Cuando el usuario abandona el campo sin ingresar datos válidos, el valor se restablece automáticamente a `0`.


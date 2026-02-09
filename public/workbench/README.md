# Workbench Feature - Clean Architecture Implementation

## Descripción

El módulo Workbench implementa la funcionalidad del dashboard (Mesa de Trabajo) siguiendo los principios de Clean Architecture. Proporciona métricas y datos en tiempo real para el análisis del negocio.

## Estructura

```
workbench/
├── data/
│   ├── datasource/
│   │   ├── WorkbenchDataSource.ts (Interface)
│   │   ├── WorkbenchDataSourceImpl.ts (Implementación con API calls)
│   │   └── constants.ts (URLs de endpoints)
│   └── repositories/
│       └── WorkbenchRepositoryImpl.ts (Implementación del repositorio)
├── domain/
│   ├── entities/
│   │   └── WorkbenchEntity.ts (Entidades de dominio)
│   ├── repositories/
│   │   └── WorkbenchRepository.ts (Interface del repositorio)
│   └── usecases/
│       ├── GetOrdersByHourUseCase.ts
│       ├── GetRevenueLast7DaysUseCase.ts
│       ├── GetTotalRevenueUseCase.ts
│       ├── GetTop5ProductsThisMonthUseCase.ts
│       ├── GetWorkbenchDataUseCase.ts
│       └── index.ts
├── di/
│   └── workbench.container.config.ts (Configuración DI)
└── presentation/
    ├── hooks/
    │   ├── useWorkbench.ts (Hook legacy)
    │   ├── useWorkbenchUseCases.ts (Nuevos hooks)
    │   └── index.ts
    └── components/
        ├── WorkbenchExample.tsx (Componente de ejemplo)
        └── index.ts
```

## Casos de Uso Implementados

### 1. GetOrdersByHourUseCase
Obtiene las órdenes agrupadas por hora.

```typescript
const getOrdersByHourUseCase = container.get<GetOrdersByHourUseCase>(WORKBENCH_TOKENS.GetOrdersByHourUseCase);

const orders = await getOrdersByHourUseCase.execute(
  new Date(), // targetDate
  "businessId", // businessId
  { lastHours: 12 } // options
);
```

### 2. GetRevenueLast7DaysUseCase
Obtiene los ingresos de los últimos 7 días.

```typescript
const getRevenueLast7DaysUseCase = container.get<GetRevenueLast7DaysUseCase>(WORKBENCH_TOKENS.GetRevenueLast7DaysUseCase);

const revenue = await getRevenueLast7DaysUseCase.execute();
```

### 3. GetTotalRevenueUseCase
Obtiene el total de ingresos en un rango de fechas.

```typescript
const getTotalRevenueUseCase = container.get<GetTotalRevenueUseCase>(WORKBENCH_TOKENS.GetTotalRevenueUseCase);

const total = await getTotalRevenueUseCase.execute(startDate, endDate);
```

### 4. GetTop5ProductsThisMonthUseCase
Obtiene los 5 productos más vendidos del mes.

```typescript
const getTop5ProductsUseCase = container.get<GetTop5ProductsThisMonthUseCase>(WORKBENCH_TOKENS.GetTop5ProductsThisMonthUseCase);

const topProducts = await getTop5ProductsUseCase.execute(startDate, endDate);
```

### 5. GetWorkbenchDataUseCase
Obtiene todos los datos del dashboard combinados.

```typescript
const getWorkbenchDataUseCase = container.get<GetWorkbenchDataUseCase>(WORKBENCH_TOKENS.GetWorkbenchDataUseCase);

const workbenchData = await getWorkbenchDataUseCase.execute(businessId);
```

## Hooks Disponibles

### Hook Legacy (useWorkbench)
```typescript
import { useWorkbench } from "@/features/workbench/presentation/hooks";

const { data, isLoading, error } = useWorkbench(businessId);
```

### Nuevos Hooks Específicos
```typescript
import { 
  useGetOrdersByHour,
  useGetRevenueLast7Days,
  useGetTotalRevenue,
  useGetTop5ProductsThisMonth,
  useGetWorkbenchData,
  useWorkbenchMutations
} from "@/features/workbench/presentation/hooks";

// Obtener órdenes por hora
const { data: ordersByHour, isLoading } = useGetOrdersByHour(businessId);

// Obtener ingresos últimos 7 días
const { data: revenueLast7Days } = useGetRevenueLast7Days();

// Obtener total de ingresos
const startDate = new Date();
const endDate = new Date();
const { data: totalRevenue } = useGetTotalRevenue(startDate, endDate);

// Obtener top 5 productos
const { data: topProducts } = useGetTop5ProductsThisMonth(startDate, endDate);

// Obtener todos los datos del dashboard
const { data: workbenchData } = useGetWorkbenchData(businessId);

// Mutaciones para actualizar datos
const { 
  refreshOrdersByHour, 
  refreshRevenueLast7Days, 
  refreshTotalRevenue, 
  refreshTop5Products,
  isAnyLoading 
} = useWorkbenchMutations();
```

## Endpoints de la API

Los endpoints están configurados en `constants.ts`:

```typescript
export const urlsWorkbench = {
  getOrdersByHour: '/orders/hours/:hours',
  getRevenueLast7Days: '/orders/revenue-last-7-days',
  getTotalRevenue: '/orders/total-revenue',
  getTop5ProductsThisMonth: '/orders/top-5-products-this-month',
} as const;
```

## Entidades de Dominio

### OrderByHour
```typescript
interface OrderByHour {
  hour: string;
  date: string;
  count: number;
  totalRevenue: number;
  percentage: number;
}
```

### RevenueByDay
```typescript
interface RevenueByDay {
  orderCount: number;
  date: string;
  revenue: number;
  averageOrderValue: number;
}
```

### TopProduct
```typescript
interface TopProduct {
  totalSold: number;
  totalOrders: number;
  productoId: string;
  productName: string;
  revenue: number;
  averageQuantityPerOrder: number;
}
```

### WorkbenchData
```typescript
interface WorkbenchData {
  kpis: WorkbenchKPIs;
  ordersByHour: OrderByHour[];
  revenueLast7Days: RevenueByDay[];
  top5Products: TopProduct[];
  totalRevenue: number;
}
```

## Configuración de Inyección de Dependencias

El módulo está registrado en el contenedor principal:

```typescript
// En src/core/di/container.config.ts
import { workbenchConfigureContainer } from "@/features/workbench/di/workbench.container.config";

export function configureContainer(): void {
  // ... otros módulos
  workbenchConfigureContainer();
}
```

## Uso en Componentes

### Ejemplo Básico
```typescript
import { useGetWorkbenchData } from "@/features/workbench/presentation/hooks";

const MyDashboard = () => {
  const { businessId } = useUserInfo();
  const { data, isLoading, error } = useGetWorkbenchData(businessId || "");

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Facturado hoy: ${data?.kpis.facturadoHoy.amount}</p>
      {/* ... más contenido */}
    </div>
  );
};
```

### Ejemplo con Mutaciones
```typescript
import { useWorkbenchMutations } from "@/features/workbench/presentation/hooks";

const DashboardWithRefresh = () => {
  const { refreshOrdersByHour, isAnyLoading } = useWorkbenchMutations();

  const handleRefresh = () => {
    refreshOrdersByHour.mutate({
      businessId: "123",
      targetDate: new Date(),
      options: { lastHours: 12 }
    });
  };

  return (
    <button onClick={handleRefresh} disabled={isAnyLoading}>
      {isAnyLoading ? "Actualizando..." : "Actualizar"}
    </button>
  );
};
```

## Beneficios de la Implementación

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica
2. **Testabilidad**: Los casos de uso pueden ser probados independientemente
3. **Mantenibilidad**: Cambios en la API no afectan la lógica de negocio
4. **Reutilización**: Los casos de uso pueden ser reutilizados en diferentes contextos
5. **Inyección de Dependencias**: Facilita el testing y la flexibilidad
6. **Type Safety**: TypeScript garantiza la seguridad de tipos en toda la aplicación

## Migración

Para migrar del hook legacy al nuevo sistema:

1. Reemplaza `useWorkbench` con `useGetWorkbenchData`
2. Usa hooks específicos para datos individuales si no necesitas todo el dashboard
3. Usa `useWorkbenchMutations` para actualizaciones manuales
4. Los casos de uso están disponibles directamente desde el contenedor DI si necesitas más control

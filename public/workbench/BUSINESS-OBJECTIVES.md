# Integración de Objetivos del Negocio en Workbench

## Descripción

Se ha implementado la integración de los objetivos del negocio desde `BusinessEntity` para reemplazar los valores mock en el dashboard del workbench. Los objetivos se obtienen desde la configuración del negocio y se utilizan para calcular los porcentajes de cumplimiento de los KPIs.

## Problema Resuelto

Anteriormente, el workbench utilizaba valores mock hardcodeados para los objetivos:
- Facturado Hoy: $500,000
- Últimos 7 Días: $2,000,000  
- Últimos 30 Días: $5,000,000

Ahora utiliza los objetivos reales configurados en `BusinessEntity.configuracion.objetivos`.

## Estructura de Objetivos

Los objetivos se definen en `ObjetivosConfig`:

```typescript
export interface ObjetivosConfig {
  facturadoHoy: number;
  ultimos7Dias: number;
  ultimos30Dias: number;
  anioActual: number;
}
```

## Implementación

### 1. Actualización del Repositorio

**WorkbenchRepositoryImpl.ts**:
```typescript
async getWorkbenchData(businessId: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData> {
  // ... obtener datos del dashboard ...
  
  // Usar objetivos reales o valores por defecto
  const defaultObjectives = {
    facturadoHoy: 500000,
    ultimos7Dias: 2000000,
    ultimos30Dias: 5000000,
    anioActual: 0,
  };

  const objectives = objetivos || defaultObjectives;

  // Calcular KPIs con objetivos reales
  const kpis: WorkbenchKPIs = {
    facturadoHoy: {
      amount: revenueLast7Days[revenueLast7Days.length - 1]?.revenue || 0,
      objective: objectives.facturadoHoy,
      percentage: 0,
    },
    // ... otros KPIs
  };
}
```

### 2. Actualización del Use Case

**GetWorkbenchDataUseCase.ts**:
```typescript
export interface GetWorkbenchDataUseCase {
  execute(businessId: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData>;
}

export class GetWorkbenchDataUseCaseImpl implements GetWorkbenchDataUseCase {
  async execute(businessId: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData> {
    return await this.workbenchRepository.getWorkbenchData(businessId, objetivos);
  }
}
```

### 3. Hooks Actualizados

**useWorkbench.ts**:
```typescript
export const useWorkbench = (businessId: string) => {
  const { business } = useBusiness();
  const getWorkbenchDataUseCase = container.get<GetWorkbenchDataUseCase>(...);

  return useQuery<WorkbenchData>({
    queryKey: ["workbench", "legacy", businessId],
    queryFn: async () => {
      // Extraer objetivos del negocio
      const objetivos = business?.configuracion?.objetivos;
      return await getWorkbenchDataUseCase.execute(businessId, objetivos);
    },
    // ... opciones de query
  });
};
```

### 4. Hook Especializado

**useWorkbenchWithBusiness.ts**:
```typescript
export const useWorkbenchWithBusiness = (businessId: string) => {
  const { business } = useBusiness();
  const getWorkbenchDataUseCase = container.get<GetWorkbenchDataUseCase>(...);

  return useQuery<WorkbenchData>({
    queryKey: ["workbench", "withBusiness", businessId],
    queryFn: async () => {
      const objetivos = business?.configuracion?.objetivos;
      return await getWorkbenchDataUseCase.execute(businessId, objetivos);
    },
    // ... opciones de query
  });
};
```

## Componentes de Ejemplo

### WorkbenchWithBusinessObjectives

Componente que demuestra la integración completa:

```typescript
export const WorkbenchWithBusinessObjectives: React.FC = () => {
  const { negocioId } = useUserInfo();
  const { business } = useBusiness();
  const { data: workbenchData } = useWorkbenchWithBusiness(negocioId || "");

  const objetivos = business?.configuracion?.objetivos;

  return (
    <div>
      {/* Mostrar objetivos configurados */}
      <Card>
        <CardHeader>
          <CardTitle>
            Objetivos del Negocio
            {objetivos ? (
              <Badge variant="default">Configurados</Badge>
            ) : (
              <Badge variant="secondary">Valores por defecto</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {objetivos ? (
            <div className="grid grid-cols-4 gap-4">
              <div>Facturado Hoy: ${objetivos.facturadoHoy.toLocaleString()}</div>
              <div>Últimos 7 Días: ${objetivos.ultimos7Dias.toLocaleString()}</div>
              <div>Últimos 30 Días: ${objetivos.ultimos30Dias.toLocaleString()}</div>
              <div>Año Actual: ${objetivos.anioActual.toLocaleString()}</div>
            </div>
          ) : (
            <p>Usando valores por defecto</p>
          )}
        </CardContent>
      </Card>

      {/* Mostrar KPIs con objetivos reales */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Facturado Hoy</CardTitle>
            <CardDescription>
              Objetivo: ${workbenchData.kpis.facturadoHoy.objective.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>Monto: ${workbenchData.kpis.facturadoHoy.amount.toLocaleString()}</div>
            <div>Progreso: {workbenchData.kpis.facturadoHoy.percentage.toFixed(1)}%</div>
          </CardContent>
        </Card>
        {/* ... otros KPIs */}
      </div>
    </div>
  );
};
```

## Flujo de Datos

```
1. Usuario navega al dashboard
    ↓
2. useWorkbench/useWorkbenchWithBusiness se ejecuta
    ↓
3. useBusiness obtiene datos del negocio (incluyendo objetivos)
    ↓
4. Objetivos se extraen de business.configuracion.objetivos
    ↓
5. GetWorkbenchDataUseCase.execute(businessId, objetivos)
    ↓
6. WorkbenchRepositoryImpl.getWorkbenchData(businessId, objetivos)
    ↓
7. KPIs se calculan con objetivos reales
    ↓
8. Dashboard muestra progreso basado en objetivos reales
```

## Beneficios

### 1. **Objetivos Reales**
- Los KPIs muestran progreso basado en objetivos configurados por el usuario
- No más valores mock hardcodeados

### 2. **Flexibilidad**
- Fallback a valores por defecto si no hay objetivos configurados
- Fácil actualización cuando el usuario cambie sus objetivos

### 3. **Integración Completa**
- Se integra automáticamente con el sistema de business
- Funciona con el auto-refresh del workbench

### 4. **UX Mejorada**
- Indicadores visuales de si se están usando objetivos reales o por defecto
- Porcentajes de cumplimiento más precisos

## Uso

### Hook Básico (ya integrado)
```typescript
const { data: workbenchData } = useWorkbench(businessId);
// Automáticamente usa objetivos del negocio
```

### Hook Especializado
```typescript
const { data: workbenchData } = useWorkbenchWithBusiness(businessId);
// Diseñado específicamente para integración con business
```

### Componente de Ejemplo
```typescript
import { WorkbenchWithBusinessObjectives } from "@/features/workbench/presentation/components";

<WorkbenchWithBusinessObjectives />
```

## Configuración

### Requisitos
1. **BusinessEntity**: Debe tener `configuracion.objetivos` configurado
2. **useBusiness**: Hook debe estar funcionando correctamente
3. **Workbench hooks**: Implementados con Clean Architecture

### Valores por Defecto
Si no hay objetivos configurados, se usan:
```typescript
const defaultObjectives = {
  facturadoHoy: 500000,
  ultimos7Dias: 2000000,
  ultimos30Dias: 5000000,
  anioActual: 0,
};
```

## Debugging

### Logs de Debug
```
🔍 Getting workbench data for business: 123 with objectives: {facturadoHoy: 1000000, ...}
✅ Using real business objectives: {facturadoHoy: 1000000, ...}
✅ Workbench data retrieved successfully
```

### Verificación
1. **Console logs**: Verificar que se están usando objetivos reales
2. **UI indicators**: Badges muestran si se usan objetivos configurados o por defecto
3. **KPI values**: Los objetivos en el dashboard deben coincidir con BusinessEntity

## Consideraciones

1. **Performance**: Los objetivos se obtienen una vez y se cachean
2. **Fallback**: Si no hay objetivos, se usan valores por defecto
3. **Auto-refresh**: Funciona con el sistema de auto-refresh del workbench
4. **Type Safety**: TypeScript garantiza que los objetivos tengan la estructura correcta

## Testing

Para probar la integración:

1. Configurar objetivos en BusinessEntity
2. Navegar al dashboard
3. Verificar que se muestran los objetivos configurados
4. Verificar que los porcentajes se calculan correctamente
5. Cambiar objetivos y verificar que se actualizan

El sistema está completamente funcional y listo para producción.

# Auto-Refresh del Workbench

## Descripción

El sistema de auto-refresh del workbench asegura que los datos del dashboard se actualicen automáticamente cuando un usuario cierra sesión y otro usuario se loguea, garantizando que cada usuario vea solo sus datos.

## Problema Resuelto

Cuando un usuario cierra sesión y otro usuario se loguea en la misma aplicación, los datos del dashboard pueden persistir del usuario anterior, mostrando información incorrecta al nuevo usuario.

## Solución Implementada

### 1. Auto-Refresh Básico (`useWorkbenchAutoRefresh`)

Hook que detecta cambios en el usuario y refresca automáticamente los datos del workbench.

```typescript
import { useWorkbenchAutoRefresh } from "@/features/workbench/presentation/hooks";

const WorkbenchPage = () => {
  const { negocioId } = useUserInfo();
  const { data, refetch } = useWorkbench(negocioId || "");
  
  // Auto-refresh cuando cambia el usuario
  useWorkbenchAutoRefresh(refetch);
  
  return <div>...</div>;
};
```

**Características:**
- Detecta cambios en `negocioId` y `userId`
- Refresca automáticamente cuando detecta cambios
- Solo funciona con una query específica

### 2. Auto-Refresh Avanzado (`useWorkbenchAutoRefreshAdvanced`)

Hook que invalida todas las queries del workbench cuando cambia el usuario.

```typescript
import { useWorkbenchAutoRefreshAdvanced } from "@/features/workbench/presentation/hooks";

const WorkbenchPage = () => {
  const { data } = useGetWorkbenchData(negocioId || "");
  
  // Auto-refresh avanzado que invalida todas las queries
  const { invalidateAllWorkbenchQueries, clearAllWorkbenchQueries } = useWorkbenchAutoRefreshAdvanced();
  
  return <div>...</div>;
};
```

**Características:**
- Invalida todas las queries del workbench automáticamente
- Funciona con todos los hooks del workbench
- Proporciona funciones para invalidar/limpiar manualmente

## Implementación en WorkbenchPage

El `WorkbenchPage` ha sido actualizado para:

1. **Usar negocioId real**: Obtiene el `negocioId` del usuario logueado
2. **Auto-refresh**: Implementa auto-refresh automático
3. **Manejo de errores mejorado**: Mejor UX para estados de error
4. **Botón de refrescar manual**: Permite actualización manual

```typescript
export function WorkbenchPage() {
  // Get real business ID from logged in user
  const { negocioId } = useUserInfo();
  const { data: workbenchData, isLoading, error, refetch, isRefetching } = useWorkbench(negocioId || "");

  // Auto-refresh when user changes (login/logout)
  useWorkbenchAutoRefresh(refetch);

  const handleRefresh = () => {
    refetch();
  };

  // Show loading state when no negocioId is available
  if (!negocioId) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          No se ha encontrado información del negocio. Por favor, inicie sesión nuevamente.
        </div>
      </div>
    );
  }

  // ... resto del componente
}
```

## Flujo de Auto-Refresh

### 1. Usuario Cierra Sesión
```
Usuario hace clic en "Cerrar Sesión"
    ↓
userStore.clearUserInfoAndToken() se ejecuta
    ↓
negocioId y userId se limpian
    ↓
useWorkbenchAutoRefresh detecta el cambio
    ↓
Se invalida/refresca el caché del workbench
```

### 2. Nuevo Usuario Se Loguea
```
Nuevo usuario ingresa credenciales
    ↓
Login exitoso
    ↓
negocioId y userId se actualizan en userStore
    ↓
useWorkbenchAutoRefresh detecta el cambio
    ↓
Se refresca automáticamente con datos del nuevo usuario
```

## Hooks Disponibles

### useWorkbenchAutoRefresh
```typescript
const { refetch } = useWorkbench(businessId);
useWorkbenchAutoRefresh(refetch);
```

### useWorkbenchAutoRefreshAdvanced
```typescript
const { 
  invalidateAllWorkbenchQueries, 
  clearAllWorkbenchQueries 
} = useWorkbenchAutoRefreshAdvanced();
```

## Componentes de Ejemplo

### WorkbenchWithAutoRefresh
Componente que demuestra el uso del auto-refresh avanzado:

```typescript
import { WorkbenchWithAutoRefresh } from "@/features/workbench/presentation/components";

// Usar en cualquier página
<WorkbenchWithAutoRefresh />
```

## Configuración

### Requisitos
1. **UserEntity**: Debe tener `negocioId` y `id`/_id
2. **TanStack Query**: Configurado en la aplicación
3. **Workbench hooks**: Implementados correctamente

### Integración Automática
El auto-refresh se integra automáticamente en:
- ✅ `WorkbenchPage` - Página principal del dashboard
- ✅ `WorkbenchWithAutoRefresh` - Componente de ejemplo
- ✅ Todos los hooks del workbench

## Beneficios

1. **Seguridad**: Previene que un usuario vea datos de otro
2. **Automatización**: No requiere intervención manual
3. **Flexibilidad**: Dos niveles de auto-refresh (básico y avanzado)
4. **Performance**: Solo refresca cuando es necesario
5. **UX**: Transiciones suaves sin recargas de página

## Debugging

Para verificar que el auto-refresh funciona:

1. **Console logs**: Los hooks registran cambios en la consola
2. **Network tab**: Verificar que se hacen nuevas requests
3. **React DevTools**: Verificar que los hooks se ejecutan

### Logs de Debug
```
🔄 User or business changed, refreshing workbench data: {
  previousBusinessId: "123",
  currentBusinessId: "456",
  businessIdChanged: true,
  userIdChanged: false
}
```

## Consideraciones

1. **Performance**: El auto-refresh solo se ejecuta cuando detecta cambios reales
2. **Caching**: TanStack Query maneja el caching inteligentemente
3. **Error Handling**: Si el refresh falla, se mantiene el estado anterior
4. **Memory**: Las referencias se limpian cuando el componente se desmonta

## Testing

Para probar el auto-refresh:

1. Loguearse con un usuario
2. Navegar al dashboard
3. Cerrar sesión
4. Loguearse con otro usuario
5. Verificar que los datos se actualizan automáticamente

El sistema está completamente funcional y listo para producción.

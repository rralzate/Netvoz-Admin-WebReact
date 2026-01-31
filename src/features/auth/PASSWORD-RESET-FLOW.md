# Flujo de Restablecimiento de Contraseña

Este documento describe la implementación del flujo completo de restablecimiento de contraseña siguiendo Clean Architecture.

## Arquitectura Implementada

### 1. Casos de Uso (Use Cases)

- **SendVerificationCodeUseCase**: Envía código de verificación por email
- **ValidateVerificationCodeUseCase**: Valida el código de verificación ingresado
- **ChangePasswordUseCase**: Cambia la contraseña del usuario

### 2. Repositorio (Repository)

El `AuthRepository` ya tenía implementados los métodos necesarios:
- `sendVerificationCode(email: string): Promise<boolean>`
- `validateVerificationCode(code: string): Promise<boolean>`
- `changePassword(email: string, newPassword: string): Promise<boolean>`

### 3. Data Source

El `AuthDatasource` implementa las llamadas a la API:
- `POST /auth/send-code-email` - Enviar código de verificación
- `POST /auth/validate-reset-code` - Validar código de verificación
- `POST /auth/change-password-public` - Cambiar contraseña

### 4. Hooks Personalizados

Se crearon hooks para consumir los casos de uso con TanStack Query:
- `useSendVerificationCode()` - Hook para enviar código de verificación
- `useValidateVerificationCode()` - Hook para validar código
- `useChangePassword()` - Hook para cambiar contraseña

### 5. Interfaz de Usuario

La página `PasswordResetPage` implementa el flujo completo con 3 pasos:

#### Paso 1: Ingreso de Email
- Usuario ingresa su email
- Se envía código de verificación usando `sendVerificationCode`

#### Paso 2: Validación de Código
- Usuario ingresa el código de 4 dígitos recibido por email
- Se valida el código usando `validateVerificationCode`
- Opción de reenviar código si es necesario

#### Paso 3: Nueva Contraseña
- Usuario ingresa nueva contraseña y confirmación
- Se cambia la contraseña usando `changePassword`
- Validación de que las contraseñas coincidan y tengan mínimo 6 caracteres

## Flujo de Uso

```typescript
// 1. El usuario ingresa su email y hace clic en "Enviar Correo"
const sendCodeMutation = useSendVerificationCode();
await sendCodeMutation.mutateAsync(email);

// 2. El usuario ingresa el código recibido y hace clic en "Validar Código"
const validateCodeMutation = useValidateVerificationCode();
await validateCodeMutation.mutateAsync(code);

// 3. El usuario ingresa nueva contraseña y hace clic en "Cambiar Contraseña"
const changePasswordMutation = useChangePassword();
await changePasswordMutation.mutateAsync({ email, newPassword });
```

## Características de la Implementación

### ✅ Clean Architecture
- Separación clara de responsabilidades
- Casos de uso independientes del framework
- Repositorio que abstrae el acceso a datos
- Data source que maneja las llamadas HTTP

### ✅ Manejo de Estados
- Estados de carga para cada operación
- Manejo de errores con mensajes descriptivos
- Estados de éxito con feedback visual

### ✅ Experiencia de Usuario
- Flujo paso a paso intuitivo
- Validaciones en tiempo real
- Opción de reenviar código
- Navegación hacia atrás entre pasos
- Enmascaramiento de email para privacidad

### ✅ Validaciones
- Email requerido y formato válido
- Código de 4 dígitos numéricos
- Contraseña mínimo 6 caracteres
- Confirmación de contraseña que coincida

### ✅ Accesibilidad
- Labels apropiados para screen readers
- Iconos descriptivos
- Mensajes de error claros
- Botones con estados de carga

## Integración con el Sistema

Para usar esta funcionalidad en tu aplicación:

1. **Agregar la ruta** en tu configuración de rutas:
```typescript
{ path: "password-reset", element: Component("/features/auth/presentation/pages/password-reset") }
```

2. **El contenedor DI ya está configurado** - los casos de uso se registran automáticamente

3. **Los hooks están listos para usar** en cualquier componente que necesite funcionalidad de restablecimiento de contraseña

## API Endpoints Esperados

El sistema espera que el backend implemente estos endpoints:

- `POST /auth/send-code-email` - Body: `{ email: string }`
- `POST /auth/validate-reset-code` - Body: `{ code: string }`
- `POST /auth/change-password-public` - Body: `{ email: string, newPassword: string }`

Todos los endpoints deben devolver respuestas HTTP estándar (200 para éxito, 4xx para errores).

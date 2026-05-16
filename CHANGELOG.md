# Changelog — Grid ERP Backend

Registro de todos los cambios relevantes del backend. Formato: `[FECHA] — Área — Descripción`.

---

## [2026-05-16]

### `purchase-order` — Endpoint de actualización de pedido

**Archivos:** `purchase-order.controller.ts`, `purchase-order.service.ts`

- **Nuevo endpoint** `PUT /purchase-order/update/:id` para editar un pedido existente.
- El método `updateOrder` en el servicio realiza:
  1. Expande los `details` con `expandDetails` (mismo comportamiento que `create`).
  2. Recalcula `totalOrder` e `itemsQuantity` desde los items expandidos.
  3. Procesa `methodOfPayment` con lógica completa:
     - Si existe un Income en la misma posición → actualiza `value`, `accountId`, `paymentDate`, `customerId` en el documento Income existente.
     - Si es una posición nueva → resuelve la cuenta/anticipo y crea un nuevo documento Income (misma lógica que `create`).
  4. Actualiza el array `methodOfPayment` en el documento `PurchaseOrder` con los IDs de Income resultantes.
  5. Actualiza `clientId`, `zoneId`, `createdBy`, `deliveryDate`, `notes`, `status`, `updatedAt`.
- **Bug prevenido:** No recrear incomes/deudas existentes al editar; solo actualizar los ya vinculados.

---

### `purchase-order` — Optimización de consultas N+1

**Archivo:** `purchase-order.service.ts` — métodos `getById` y `getByOrderNumber`

- Reemplazados bucles `for` secuenciales por `Promise.all` para popular `productId` e `id_category` en paralelo.
- Añadido `categoryName: product?.id_category?.name ?? ''` al mapa de detalles.
- Ordenamiento alfabético de productos con `localeCompare('es', { sensitivity: 'base' })`.
- Eliminados bucles de lookup del historial (removida sección HISTORIAL).

---

### `reports` — Eliminar fila sintética "TOTAL GENERAL"

**Archivo:** `reports/reports.service.ts`

- Removidas las etapas `$group`, `$project`, `$unwind`, `$replaceRoot` del pipeline de agregación que inyectaban un documento sintético `{ sede: "TOTAL GENERAL" }` al final de los resultados.
- Reemplazadas por `{ $sort: { fecha: 1 } }`.
- **Bug prevenido:** Este documento sintético inflaba el total final en el reporte de ventas detallado del frontend.

---

### `users` — Campo `skipOtp`

**Archivos:** `users/users.schema.ts`, `users/users.service.ts`, `users/users.controller.ts`, `auth/dtos/login.dto.ts`

- Añadido campo `skipOtp: boolean` (default `false`) al schema de `User`.
- Añadido `skipOtp` al DTO de login (`LoginResponseDto`) para que el frontend pueda leerlo.
- Nuevo método `updateSkipOtp(id, skipOtp)` en el servicio: actualiza `$set: { skipOtp: !!skipOtp }`.
- Nuevo endpoint `PUT /users/skip-otp/:id` en el controlador.
- `findAll` ahora incluye `skipOtp` en la respuesta mapeada.
- **Propósito:** Permitir que usuarios específicos omitan la validación OTP al iniciar sesión.

---

### `products` — Búsqueda insensible a acentos y filtro de tipo de producto

**Archivos:** `products/products.service.ts`, `products/products.controller.ts`

- Añadido método privado `buildAccentInsensitiveRegex(term)` que expande cada vocal/ñ a una clase de caracteres: `[aáàäâã]`, `[eéèëê]`, etc., permitiendo buscar "baul" y encontrar "BAÚL".
- El filtro `typeProduct` ahora es opcional: si no se encuentra el tipo, se omite el filtro en lugar de lanzar `NotFoundException`.
- Removida validación `BadRequestException('TypeProduct are required')` del controlador — el parámetro es completamente opcional.
- El filtro `$or` por categorías solo se aplica cuando `categoryIds.length > 0`.
- **Bugs solucionados:**
  - Productos con caracteres acentuados (ej. "BAÚL") no aparecían al buscar sin acento ("baul").
  - Productos con `typeProduct` diferente a "Livianos" (ej. "1. AUTOMOVIL") no aparecían.

---

## Convención de versiones

- `x.x.Z` patch → bug fixes  
- `x.Y.0` minor → features nuevas o mejoras  
- `X.0.0` major → cambios de arquitectura o breaking changes

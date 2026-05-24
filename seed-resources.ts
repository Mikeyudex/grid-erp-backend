/**
 * seed-resources.ts
 *
 * Inserta (o actualiza) todos los recursos granulares del sistema.
 * Idempotente: usa upsert por `path`, nunca duplica.
 *
 * Uso:
 *   npx ts-node -r tsconfig-paths/register seed-resources.ts
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌  No MONGODB_URI encontrado en .env');
  process.exit(1);
}

const resourceSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  path:        { type: String, required: true },
  module:      { type: String, default: '' },
  createdAt:   { type: Date,   default: Date.now },
  updatedAt:   { type: Date,   default: null },
});

const ResourceModel = mongoose.model('Resource', resourceSchema);

// ─────────────────────────────────────────────
// Catálogo completo de recursos
// ─────────────────────────────────────────────
const resources = [
  // ── General ──────────────────────────────
  {
    name: 'home',
    description: 'Página de inicio',
    path: '/home',
    module: 'general',
  },
  {
    name: 'dashboard',
    description: 'Dashboard principal',
    path: '/dashboard',
    module: 'general',
  },

  // ── Clientes ─────────────────────────────
  {
    name: 'customers',
    description: 'Módulo de clientes (acceso al menú)',
    path: '/customers',
    module: 'customers',
  },
  {
    name: 'customers-list',
    description: 'Ver listado de clientes',
    path: '/customers/list-v2',
    module: 'customers',
  },
  {
    name: 'customers-create',
    description: 'Crear nuevo cliente',
    path: '/customers/create-v2',
    module: 'customers',
  },
  {
    name: 'customers-types-list',
    description: 'Ver categorías de clientes',
    path: '/customers/types-list-v2',
    module: 'customers',
  },
  {
    name: 'customers-type-of-customer',
    description: 'Gestionar tipos de cliente',
    path: '/customers/type-of-customer-list',
    module: 'customers',
  },
  {
    name: 'customers-type-of-document',
    description: 'Gestionar tipos de documento',
    path: '/customers/type-of-document-list',
    module: 'customers',
  },

  // ── Pedidos ──────────────────────────────
  {
    name: 'purchase-orders',
    description: 'Módulo de pedidos (acceso al menú)',
    path: '/purchase-orders',
    module: 'purchase-orders',
  },
  {
    name: 'purchase-orders-create',
    description: 'Crear nuevo pedido',
    path: '/purchase-orders/create',
    module: 'purchase-orders',
  },

  // ── Producción ───────────────────────────
  {
    name: 'production',
    description: 'Módulo de producción (acceso al menú)',
    path: '/production',
    module: 'production',
  },
  {
    name: 'production-items',
    description: 'Ver ítems de producción',
    path: '/production/items',
    module: 'production',
  },

  // ── Productos ────────────────────────────
  {
    name: 'products',
    description: 'Módulo de productos (acceso al menú)',
    path: '/products',
    module: 'products',
  },
  {
    name: 'products-list',
    description: 'Ver listado de productos',
    path: '/products/list-v2',
    module: 'products',
  },
  {
    name: 'products-create',
    description: 'Crear nuevo producto',
    path: '/products/lobby',
    module: 'products',
  },
  {
    name: 'products-categories',
    description: 'Gestionar marcas / categorías',
    path: '/products/category-v2',
    module: 'products',
  },
  {
    name: 'products-mat-material',
    description: 'Gestionar tipos y materiales',
    path: '/products/mat-material-price-v2',
    module: 'products',
  },
  {
    name: 'products-uploads',
    description: 'Historial de cargues masivos',
    path: '/products/uploads',
    module: 'products',
  },

  // ── Contabilidad ─────────────────────────
  {
    name: 'accounting',
    description: 'Módulo de contabilidad (acceso al menú)',
    path: '/accounting',
    module: 'accounting',
  },
  {
    name: 'accounting-accounts',
    description: 'Ver cuentas bancarias',
    path: '/accounting/accounts',
    module: 'accounting',
  },
  {
    name: 'accounting-payments',
    description: 'Ver listado de pagos',
    path: '/accounting/payments-list',
    module: 'accounting',
  },
  {
    name: 'accounting-purchases',
    description: 'Ver compras',
    path: '/accounting/purchases',
    module: 'accounting',
  },
  {
    name: 'accounting-retentions',
    description: 'Ver retenciones',
    path: '/accounting/retentions-list',
    module: 'accounting',
  },
  {
    name: 'accounting-taxes',
    description: 'Ver impuestos',
    path: '/accounting/taxes-list',
    module: 'accounting',
  },
  {
    name: 'accounting-expenses-types',
    description: 'Gestionar tipos de egreso',
    path: '/accounting/expenses-types-list',
    module: 'accounting',
  },
  {
    name: 'accounting-expenses-list',
    description: 'Ver listado de egresos',
    path: '/accounting/expenses-list',
    module: 'accounting',
  },
  {
    name: 'accounting-expenses-register',
    description: 'Registrar nuevo egreso',
    path: '/accounting/expenses-register',
    module: 'accounting',
  },

  // ── Reportes ─────────────────────────────
  {
    name: 'reports',
    description: 'Hub del módulo de reportes (acceso al menú)',
    path: '/reports',
    module: 'reports',
  },
  {
    name: 'reports-cumulative-sales',
    description: 'Reporte de ventas acumuladas por sede y asesor',
    path: '/reports-cumulative-sales',
    module: 'reports',
  },
  {
    name: 'reports-detailed-sales',
    description: 'Reporte detallado de ventas por factura',
    path: '/reports-detailed-sales',
    module: 'reports',
  },
  {
    name: 'reports-product-sales',
    description: 'Reporte de ventas por producto, tipo y material',
    path: '/reports-product-sales',
    module: 'reports',
  },
  {
    name: 'reports-receivables',
    description: 'CXC consolidado por cliente',
    path: '/reports-receivables',
    module: 'reports',
  },
  {
    name: 'reports-receivables-detailed',
    description: 'CXC detallado por pedidos',
    path: '/reports-receivables-detailed',
    module: 'reports',
  },
  {
    name: 'reports-bank-accounts-balance',
    description: 'Saldos de cuentas bancarias',
    path: '/reports-bank-accounts-balance',
    module: 'reports',
  },
  {
    name: 'reports-bank-movements',
    description: 'Movimientos detallados por cuenta bancaria',
    path: '/reports-bank-movements',
    module: 'reports',
  },
  {
    name: 'reports-shipping-labels',
    description: 'Generador de rótulos de envío',
    path: '/reports-shipping-labels',
    module: 'reports',
  },

  // ── Configuraciones ──────────────────────
  {
    name: 'configurations',
    description: 'Módulo de configuraciones (acceso al menú)',
    path: '/settings',
    module: 'configurations',
  },
  {
    name: 'configurations-zones',
    description: 'Gestionar sedes',
    path: '/settings/zones',
    module: 'configurations',
  },
  {
    name: 'configurations-warehouses',
    description: 'Gestionar bodegas',
    path: '/settings/warehouses',
    module: 'configurations',
  },

  // ── Administración ───────────────────────
  {
    name: 'administration',
    description: 'Módulo de administración (acceso al menú)',
    path: '/admin',
    module: 'administration',
  },
  {
    name: 'administration-users',
    description: 'Gestionar usuarios',
    path: '/admin/users',
    module: 'administration',
  },
  {
    name: 'administration-roles',
    description: 'Gestionar roles y permisos',
    path: '/admin/roles',
    module: 'administration',
  },
  {
    name: 'administration-resources',
    description: 'Gestionar recursos del sistema',
    path: '/admin/resources',
    module: 'administration',
  },
];

// ─────────────────────────────────────────────
// Ejecución
// ─────────────────────────────────────────────
async function seed() {
  try {
    console.log('🔌  Conectando a MongoDB...');
    await mongoose.connect(uri);
    console.log('✅  Conectado.\n');

    let inserted = 0;
    let updated  = 0;

    for (const resource of resources) {
      const result = await ResourceModel.updateOne(
        { path: resource.path },           // filtro por path (único de negocio)
        { $set: { name: resource.name, description: resource.description, module: resource.module },
          $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        console.log(`  ➕  [${resource.module}] ${resource.name} → ${resource.path}`);
        inserted++;
      } else if (result.modifiedCount > 0) {
        console.log(`  ✏️   [${resource.module}] ${resource.name} → actualizado`);
        updated++;
      } else {
        console.log(`  ✔️   [${resource.module}] ${resource.name} → sin cambios`);
      }
    }

    console.log(`\n📊  Resumen: ${inserted} insertados, ${updated} actualizados, ${resources.length - inserted - updated} sin cambios.`);
  } catch (error) {
    console.error('❌  Error durante el seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Desconectado.');
  }
}

seed();

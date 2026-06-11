/**
 * audit-orphans.ts
 *
 * Detecta y opcionalmente elimina documentos Income y Debt que no están
 * referenciados por ningún PurchaseOrder (huérfanos).
 *
 * Un Income es huérfano si:
 *   - purchaseOrderId es null/undefined, O
 *   - el PurchaseOrder referenciado ya no existe en la BD
 *
 * Un Debt es huérfano si:
 *   - el PurchaseOrder referenciado ya no existe en la BD
 *
 * Uso (solo auditar, sin borrar):
 *   npx ts-node -r tsconfig-paths/register audit-orphans.ts
 *
 * Uso (auditar y borrar):
 *   npx ts-node -r tsconfig-paths/register audit-orphans.ts --delete
 */

import mongoose, { Types } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

const shouldDelete = process.argv.includes('--delete');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌  No MONGODB_URI encontrado en .env');
  process.exit(1);
}

// ── Schemas mínimos ──────────────────────────────────────────────────────────

const purchaseOrderSchema = new mongoose.Schema(
  { orderNumber: Number, clientId: Types.ObjectId, status: String },
  { collection: 'purchaseorders' },
);

const incomeSchema = new mongoose.Schema(
  {
    purchaseOrderId: { type: Types.ObjectId, ref: 'PurchaseOrder', default: null },
    sequence: Number,
    typeOperation: String,
    value: Number,
    paymentDate: Date,
    createdAt: Date,
    deletedAt: { type: Date, default: null },
  },
  { collection: 'incomes' },
);

const debtSchema = new mongoose.Schema(
  {
    purchaseOrderId: { type: Types.ObjectId, ref: 'PurchaseOrder' },
    customerId: Types.ObjectId,
    amountPayable: Number,
    status: String,
    createdAt: Date,
    deletedAt: { type: Date, default: null },
  },
  { collection: 'debts' },
);

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(uri!);
  console.log('✅  Conectado a MongoDB\n');

  const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
  const Income = mongoose.model('Income', incomeSchema);
  const Debt = mongoose.model('Debt', debtSchema);

  // 1. Obtener todos los IDs de PurchaseOrder existentes
  const allOrderDocs = await PurchaseOrder.find({}, { _id: 1 }).lean();
  const validOrderIds = new Set(allOrderDocs.map((o) => o._id.toString()));
  console.log(`📦  PurchaseOrders en BD: ${validOrderIds.size}`);

  // ── INCOMES ──────────────────────────────────────────────────────────────
  const allIncomes = await Income.find({ deletedAt: null }, {
    _id: 1, purchaseOrderId: 1, sequence: 1, typeOperation: 1, value: 1, paymentDate: 1,
  }).lean();

  const orphanIncomes = allIncomes.filter((inc) => {
    if (!inc.purchaseOrderId) return true; // sin referencia
    return !validOrderIds.has(inc.purchaseOrderId.toString()); // referencia rota
  });

  console.log(`\n💰  Total Incomes activos: ${allIncomes.length}`);
  console.log(`❌  Incomes huérfanos:     ${orphanIncomes.length}`);

  if (orphanIncomes.length > 0) {
    console.log('\n  ID                        | Seq  | Tipo         | Valor       | purchaseOrderId');
    console.log('  ' + '-'.repeat(90));
    orphanIncomes.forEach((inc) => {
      const seq    = String(inc.sequence ?? '-').padEnd(4);
      const type   = String(inc.typeOperation ?? '-').padEnd(12);
      const value  = String(inc.value ?? 0).padStart(11);
      const podId  = inc.purchaseOrderId ? inc.purchaseOrderId.toString() : '(null)';
      console.log(`  ${inc._id}  | ${seq} | ${type} | ${value} | ${podId}`);
    });
  }

  // ── DEBTS ────────────────────────────────────────────────────────────────
  const allDebts = await Debt.find({ deletedAt: null }, {
    _id: 1, purchaseOrderId: 1, customerId: 1, amountPayable: 1, status: 1, createdAt: 1,
  }).lean();

  const orphanDebts = allDebts.filter((debt) => {
    if (!debt.purchaseOrderId) return true;
    return !validOrderIds.has(debt.purchaseOrderId.toString());
  });

  console.log(`\n🏦  Total Debts activos:   ${allDebts.length}`);
  console.log(`❌  Debts huérfanos:       ${orphanDebts.length}`);

  if (orphanDebts.length > 0) {
    console.log('\n  ID                        | Estado   | Monto       | purchaseOrderId');
    console.log('  ' + '-'.repeat(90));
    orphanDebts.forEach((debt) => {
      const status = String(debt.status ?? '-').padEnd(8);
      const amount = String(debt.amountPayable ?? 0).padStart(11);
      const podId  = debt.purchaseOrderId ? debt.purchaseOrderId.toString() : '(null)';
      console.log(`  ${debt._id}  | ${status} | ${amount} | ${podId}`);
    });
  }

  // ── BORRAR ───────────────────────────────────────────────────────────────
  if (shouldDelete) {
    if (orphanIncomes.length === 0 && orphanDebts.length === 0) {
      console.log('\n✅  No hay huérfanos que borrar.');
    } else {
      console.log('\n🗑️   Iniciando eliminación...');

      if (orphanIncomes.length > 0) {
        const incomeIds = orphanIncomes.map((i) => i._id);
        const result = await Income.deleteMany({ _id: { $in: incomeIds } });
        console.log(`  ✅  Incomes eliminados: ${result.deletedCount}`);
      }

      if (orphanDebts.length > 0) {
        const debtIds = orphanDebts.map((d) => d._id);
        const result = await Debt.deleteMany({ _id: { $in: debtIds } });
        console.log(`  ✅  Debts eliminados:   ${result.deletedCount}`);
      }

      console.log('\n✅  Limpieza completada.');
    }
  } else {
    if (orphanIncomes.length > 0 || orphanDebts.length > 0) {
      console.log('\n⚠️   Modo solo-auditoría. Para eliminar ejecuta con --delete:');
      console.log('    npx ts-node -r tsconfig-paths/register audit-orphans.ts --delete\n');
    } else {
      console.log('\n✅  No se encontraron huérfanos.');
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌  Error:', err);
  mongoose.disconnect();
  process.exit(1);
});

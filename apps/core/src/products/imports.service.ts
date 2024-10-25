import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import * as Excel from 'exceljs';
import { JobsQueuesEnum, QueuesEnum } from '../common/config/queues.enum';

export class ImportsService {

    constructor(
        @InjectQueue(QueuesEnum.Imports) private readonly importQueue: Queue,
    ) { }

    async importProductsFromXlsxQueue(file:any, companyId: string) {
        try {
            // Añadir el trabajo de importación a la cola
            await this.importQueue.add(
                JobsQueuesEnum.ImportProductsFromXlsx,
                { file, companyId },
                { attempts: 3, backoff: { type: 'exponential', delay: 60000 }, });
            return { message: 'Producto en cola de importación.' };
        } catch (error) {
            throw new Error('Error al encolar la importación.');
        }
    }

    async importProductsFromXlsx(file: any, companyId: string, job: Job) {
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(file.buffer);

        const sheet = workbook.worksheets['Productos'];

        const products = [];
        let progress = 0;
        for (let i = 2; i <= sheet.lastRow.number; i++) {
            const row = sheet.getRow(i);
            const product = {
                companyId: companyId,
                externalId: row.getCell(1).value,
                warehouseId: row.getCell(2).value,
                providerId: row.getCell(3).value,
                name: row.getCell(4).value,
                description: row.getCell(5).value,
                idTypeProduct: row.getCell(6).value,
                idCategory: row.getCell(7).value,
                idSubCategory: row.getCell(8).value,
                quantity: row.getCell(9).value,
                unitOfMeasureId: row.getCell(10).value,
                taxId: row.getCell(11).value,
                costPrice: row.getCell(12).value,
                salePrice: row.getCell(13).value,
                sku: row.getCell(14).value,
                attributes: {
                    color: row.getCell(15).value,
                    size: row.getCell(16).value,
                    material: row.getCell(17).value,
                    peso: row.getCell(18).value,
                    isLimitedEdition: row.getCell(19).value,
                },
                additionalConfigs: {
                    hasBarcode: row.getCell(20).value,
                    images: row.getCell(21).value.split(','),
                },
            };
            products.push(product);
            progress = (i / sheet.lastRow.number) * 100;
            job.progress(progress);
        }

        // Procesa los productos aquí (guardar en base de datos, etc.)

        console.log(products);
        //TODO notificar al usuario que la importación se ha completado correctamente
        return products;
    }

}
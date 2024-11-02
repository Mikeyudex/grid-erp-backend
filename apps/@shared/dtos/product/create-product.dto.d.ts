export declare class CreateProductDto {
    uuid?: string;
    readonly externalId: string;
    companyId?: string;
    readonly warehouseId: string;
    readonly providerId: string;
    readonly name: string;
    readonly description: string;
    readonly id_type_product: string;
    readonly sku: string;
    unitOfMeasureId: string;
    taxId: string;
    readonly id_category: string;
    readonly id_sub_category: string;
    readonly quantity: number;
    readonly salePrice: number;
    readonly costPrice: number;
    readonly attributes: Record<string, any>;
    readonly additionalConfigs: Record<string, any>;
}

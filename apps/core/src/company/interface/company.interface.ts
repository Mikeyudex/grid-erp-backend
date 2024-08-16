export interface CompanyInterface {
    uuid?: string;
    companyCode: string;
    name: string;
    description: string;
    active?: boolean;
    required: boolean;
    createdAt?: Date,
    updatedAt?: Date
}

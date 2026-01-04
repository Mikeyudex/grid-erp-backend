import { Types } from 'mongoose';

export interface PayloadToken {
    role: string | Types.ObjectId,
    sub: string,
    companyId: string | Types.ObjectId
}
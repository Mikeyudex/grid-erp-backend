import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account.schema';
import { AccountClass, AccountClassSchema } from './schemas/accountClass.schema';
import { AccountGroup, AccountGroupSchema } from './schemas/accountGroup.schema';
import { SubAccount, SubAccountSchema } from './schemas/subAccount.schema';
import { SubAccountCategory, SubAccountCategorySchema } from './schemas/subAccountCategory.schema';
import { MethodOfPayment, MethodOfPaymentSchema } from './schemas/methodOfPayment.schema';
import { PaymentMethod, PaymentMethodSchema } from './schemas/paymentMethod.schema';
import { PaymentMethodService } from './services/paymentMethod.service';
import { RelatedToService } from './services/relatedTo.service';
import { RelatedTo, RelatedToSchema } from './schemas/relatedTo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: AccountClass.name, schema: AccountClassSchema }]),
    MongooseModule.forFeature([{ name: AccountGroup.name, schema: AccountGroupSchema }]),
    MongooseModule.forFeature([{ name: SubAccount.name, schema: SubAccountSchema }]),
    MongooseModule.forFeature([{ name: SubAccountCategory.name, schema: SubAccountCategorySchema }]),
    MongooseModule.forFeature([{ name: MethodOfPayment.name, schema: MethodOfPaymentSchema }]),
    MongooseModule.forFeature([{ name: PaymentMethod.name, schema: PaymentMethodSchema }]),
    MongooseModule.forFeature([{ name: RelatedTo.name, schema: RelatedToSchema }]),
  ],
  providers: [AccountingService, PaymentMethodService, RelatedToService],
  controllers: [AccountingController],
  exports: [AccountingService, PaymentMethodService, RelatedToService]
})
export class AccountingModule { }

import { ResponseWooCommerceCategoryDto } from "../../woocommerce/dto/Category.dto";
import { ResponseProducWootDto } from "../../woocommerce/dto/ResponseProduct.dto";


export class HttpResponseWooDto {
    success: boolean;
    errorCodeWoo: string;
    messageWoo: string;
    dataWoo: ResponseProducWootDto | ResponseWooCommerceCategoryDto | any;
    httpStatus: number;
}
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateProductWooDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  price: string;

  @IsString()
  regular_price: string;

  @IsOptional()
  @IsString()
  sale_price?: string;

  @IsOptional()
  @IsDateString()
  date_on_sale_from?: string;

  @IsOptional()
  @IsDateString()
  date_on_sale_from_gmt?: string;

  @IsOptional()
  @IsDateString()
  date_on_sale_to?: string;

  @IsOptional()
  @IsDateString()
  date_on_sale_to_gmt?: string;

  @IsBoolean()
  on_sale: boolean;

  @IsBoolean()
  purchasable: boolean;

  @IsNumber()
  total_sales: number;

  @IsBoolean()
  virtual: boolean;

  @IsBoolean()
  downloadable: boolean;

  @IsOptional()
  @IsArray()
  downloads?: any[];

  @IsOptional()
  @IsString()
  external_url?: string;

  @IsOptional()
  @IsString()
  button_text?: string;

  @IsString()
  tax_status: string;

  @IsOptional()
  @IsString()
  tax_class?: string;

  @IsBoolean()
  manage_stock: boolean;

  @IsOptional()
  @IsNumber()
  stock_quantity?: number;

  @IsString()
  stock_status: string;

  @IsString()
  backorders: string;

  @IsBoolean()
  backorders_allowed: boolean;

  @IsBoolean()
  backordered: boolean;

  @IsBoolean()
  sold_individually: boolean;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsObject()
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };

  @IsBoolean()
  shipping_required: boolean;

  @IsBoolean()
  shipping_taxable: boolean;

  @IsOptional()
  @IsString()
  shipping_class?: string;

  @IsNumber()
  shipping_class_id: number;

  @IsBoolean()
  reviews_allowed: boolean;

  @IsString()
  average_rating: string;

  @IsNumber()
  rating_count: number;

  @IsArray()
  related_ids: number[];

  @IsOptional()
  @IsArray()
  upsell_ids?: number[];

  @IsOptional()
  @IsArray()
  cross_sell_ids?: number[];

  @IsNumber()
  parent_id: number;

  @IsOptional()
  @IsString()
  purchase_note?: string;

  @IsArray()
  categories: {
    id: number;
    name?: string;
    slug?: string;
  }[];

  @IsOptional()
  @IsArray()
  tags?: any[];

  @IsArray()
  images: {
    id?: number;
    src: string;
  }[];

  @IsOptional()
  @IsArray()
  attributes?: any[];

  @IsOptional()
  @IsArray()
  default_attributes?: any[];

  @IsOptional()
  @IsArray()
  variations?: any[];

  @IsOptional()
  @IsArray()
  grouped_products?: any[];

  @IsNumber()
  menu_order: number;
}

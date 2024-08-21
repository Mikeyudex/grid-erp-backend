import { ApiProperty } from '@nestjs/swagger';

export class UpdateValueSettingByKeyDto {

  @ApiProperty({ example: 'correlativeSku', description: 'Nombre de la key a modificar' })
  readonly keyToUpdate: string;

  @ApiProperty({ example: '1000', description: 'Nuevo valor' })
  readonly newValue: any;

}
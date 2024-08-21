import { Controller, Get, Post, Body, Param, Put, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './settings.schema';
import { UpdateValueSettingByKeyDto } from './dto/update-value-settings-byKey.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Post('/create')
    @ApiOperation({ summary: 'Crear una configuración' })
    @ApiResponse({ status: 201, description: 'La configuración ha sido creado exitosamente.' })
    async create(@Body() createSettingsDto: CreateSettingsDto): Promise<Settings> {
        return this.settingsService.create(createSettingsDto);
    }

    @Get('getAll')
    @ApiOperation({ summary: 'Obtener todas las configuraciones' })
    @ApiResponse({ status: 200, description: 'Lista de configuraciones obtenida exitosamente.' })
    async findAll(): Promise<Settings[]> {
        return this.settingsService.findAll();
    }

    @Get('getbyCompany')
    @ApiOperation({ summary: 'Obtener todos las configuraciones por compañía' })
    @ApiResponse({ status: 200, description: 'Lista de configuraciones obtenida exitosamente.' })
    async findAllByCompany(@Query('companyId') companyId: string, @Res() res: Response) {
        try {
            let data = await this.settingsService.findAllByCompany(companyId);
            return res.status(200).json({
                success: true,
                data,
                errorMessage: ""
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                data: [],
                errorMessage: "Internal Error"
            });
        }
    }

    @Get('getBySettingName')
    @ApiOperation({ summary: 'Obtener configuración por nombre' })
    @ApiResponse({ status: 200, description: 'Configuración obtenida exitosamente.' })
    async findBySettingName(@Query('name') name: string, @Res() res: Response) {
        try {
            let data = await this.settingsService.findBySettingName(name);
            return res.status(200).json({
                success: true,
                data,
                errorMessage: ""
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                data: [],
                errorMessage: "Internal Error"
            });
        }
    }

    @Get('get/:id')
    @ApiOperation({ summary: 'Obtener una configuración por UUID' })
    @ApiResponse({ status: 200, description: 'Registro encontrado.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async findOne(@Param('id') id: string): Promise<Settings> {
        return this.settingsService.findOne(id);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Actualizar una configuración por ID' })
    @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async update(@Param('id') id: string, @Body() updateSettingsDto: UpdateSettingsDto): Promise<boolean> {
        return this.settingsService.update(id, updateSettingsDto);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Eliminar una configuración por ID' })
    @ApiResponse({ status: 200, description: 'Registro eliminado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async delete(@Param('id') id: string): Promise<boolean> {
        return this.settingsService.delete(id);
    }

    @Put('updateValueByKey/:settingId')
    @ApiOperation({ summary: 'Actualizar un valor de una configuración' })
    @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    async updateValueByKey(
        @Param('settingId') settingId: string,
        @Body() updateValueSettingByKeyDto: UpdateValueSettingByKeyDto, @Res() res: Response) {
        if (!settingId) {
            return res.status(400).json({ success: false, message: 'El parámetro settingId es obligatorio.' });
        }
        if (!updateValueSettingByKeyDto.keyToUpdate && !updateValueSettingByKeyDto.newValue) {
            return res.status(400).json({ success: false, message: 'El parámetro keyToUpdate y newValue es obligatorio.' });
        }
        try {
            await this.settingsService.updateSettingValue(settingId, updateValueSettingByKeyDto);
            res.status(200).json({ success: true, message: 'Operación exitosa.' });
        } catch (error:any) {
            console.error(error);
            res.status(500).json({ success: false, message: error });
        } 
    }

    @Post('/addValue/:name')
    @ApiOperation({ summary: 'Agregar un valor a la configuración' })
    @ApiResponse({ status: 201, description: 'Operación exitosa.' })
    async addValue(@Param('name') name: string, @Body() payload: Record<string, any>, @Res() res: Response){
        if (!name) {
            return res.status(400).json({ success: false, message: 'El parámetro name es obligatorio.' });
        }
        try {
            await this.settingsService.addValueByName(name, payload);
            res.status(200).json({ success: true, message: 'Operación exitosa.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Ocurrió un error interno, intente más tarde.' });
        }
        
    }
}
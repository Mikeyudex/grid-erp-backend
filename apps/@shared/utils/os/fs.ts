
import { Logger } from "@nestjs/common";
import * as fs from "fs";
import path from "path";


export class UtilFiles {

    logger = new Logger(UtilFiles.name);
    async saveFile(nameFile: string, file: Buffer): Promise<string> {

        return new Promise<string>(async (resolve, reject) => {
            try {
                let folder: string = path.resolve('./dist/temp');
                let route: string = path.join(folder, nameFile);
                fs.writeFileSync(route, file);
                resolve(route);
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })

    }

    async removeFile(route: string): Promise<string> {

        return new Promise<string>(async (resolve, reject) => {
            try {
                this.logger.log(`Iniciando eliminación de archivo ${route}`);
                fs.unlinkSync(route);
                this.logger.log('Archivo elminado correctamente');
                resolve('Archivo eliminado');
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })

    }

    async convertBase64ToBuffer(fileBase64: string): Promise<Buffer> {

        return new Promise<Buffer>(async (resolve, reject) => {
            try {
                this.logger.log(`Iniciando Conversión de base64 a Buffer`);
                let fileBuffer: Buffer = Buffer.from(fileBase64, 'base64')
                this.logger.log('Archivo convertido correctamente');
                resolve(fileBuffer);
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })

    }

    async saveFilestring(filedata: string, path: string): Promise<boolean> {

        return new Promise<boolean>(async (resolve, reject) => {
            try {
                fs.writeFile(path, filedata, (err) => {
                    if (!err) {
                        console.log('done');
                        resolve(true);
                    }
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })

    }




}
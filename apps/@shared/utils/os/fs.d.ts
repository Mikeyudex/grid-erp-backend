import { Logger } from "@nestjs/common";
export declare class UtilFiles {
    logger: Logger;
    saveFile(nameFile: string, file: Buffer): Promise<string>;
    removeFile(route: string): Promise<string>;
    convertBase64ToBuffer(fileBase64: string): Promise<Buffer>;
    saveFilestring(filedata: string, path: string): Promise<boolean>;
}

import { Inject, Injectable } from '@nestjs/common';
import * as oci from 'oci-sdk';
import * as fs from 'fs';
import { ConfigType } from '@nestjs/config';
import config from './config';


@Injectable()
export class OracleCloudService {
    private objectStorageClient: oci.objectstorage.ObjectStorageClient;
    private namespaceName: string;

    constructor(
        @Inject(config.KEY) private configService: ConfigType<typeof config>,
    ) {
        const provider = new oci.ConfigFileAuthenticationDetailsProvider();
        this.objectStorageClient = new oci.objectstorage.ObjectStorageClient({
            authenticationDetailsProvider: provider,
        });
        this.initializeNamespace();
    }

    private async initializeNamespace() {
        const getNamespaceResponse = await this.objectStorageClient.getNamespace({});
        this.namespaceName = getNamespaceResponse.value;
    }

    async uploadFileToBucket(bucketName: string, objectName: string, filePath: string, mimetype: string): Promise<string> {
        try {
            const fileStream = fs.createReadStream(filePath);
            const fileSizeInBytes = fs.statSync(filePath).size;

            const uploadDetails = {
                namespaceName: this.namespaceName,
                bucketName: bucketName,
                putObjectBody: fileStream,
                objectName: objectName,
                contentLength: fileSizeInBytes,
                contentType: mimetype
            };

            let urlObject = `https://objectstorage.${this.configService.oci.region}.oraclecloud.com/n/${this.namespaceName}/b/${bucketName}/o/${objectName}`

            await this.objectStorageClient.putObject(uploadDetails);
            this.cleanupFile(filePath).then(() => console.log('Archivo temporal eliminado:', filePath)).catch(e => console.log(e))
            return urlObject;
        } catch (err) {
            console.error('Error uploading file: ', err);
            throw err;
        }
    }

    async deleteFile(bucketName: string, filename: string): Promise<void> {
        const deleteObjectRequest: oci.objectstorage.requests.DeleteObjectRequest = {
            namespaceName: this.namespaceName,
            bucketName: bucketName,
            objectName: filename,
        };

        await this.objectStorageClient.deleteObject(deleteObjectRequest);
    }

    makeStorageId(): string {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        return uniqueSuffix;
    }

    private async cleanupFile(filePath: string) {
        try {
            fs.unlinkSync(filePath);
            return;
        } catch (error) {
            return `Error al eliminar el archivo temporal: ${error}`;
        }
    }
}

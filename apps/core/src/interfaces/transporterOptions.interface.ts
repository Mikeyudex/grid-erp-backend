export interface TransporterOptions {
    from ?: string,
    to: string[],
    cc?: string[],
    subject: string,
    html: string,
    isAttach?: boolean,
    attachments?: 
        {
            filename: string,
            content: Buffer,
            encoding?: string
        }[]
    
}
export interface SettingsTypes {

    host: string,
    port: string,
    secure?: boolean,
    auth: {
        user:string,
        pass:string
    }
}
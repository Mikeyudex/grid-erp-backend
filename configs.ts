import { configDotenv } from 'dotenv';
configDotenv();

export const globalConfigs = {

    APP_NAME: `${process.env.APP_NAME} - ${process.env.ENV}` || "GRID ERP",
    ENV: process.env?.ENV || 'DEV',
    MONGODB_URI : process.env.ENV === 'PROD' ? process.env.MONGODB_URI : process.env.MONGODB_URI_DEV,
    PORT : process.env.PORT || 4000 ,
    NUMBER_PHONE : process.env.NUMBER_PHONE || "+12283358719",
    ACCOUNT_SID : process.env.ACCOUNT_SID || "AC43d284507be0872e06ecfabd4fcf97e8",
    AUTH_TOKEN_TWILIO : process.env.AUTH_TOKEN_TWILIO || "da08309f910de0e2e1c11a4451640a14",
    MAILER_USER : process.env.MAILER_USER || "",
    MAILER_PASS : process.env.MAILER_PASS || "",
    MAILER_USER_INFO : process.env.MAILER_USER_INFO || "",
    MAILER_PASS_INFO : process.env.MAILER_PASS_INFO || "",
    MAILER_HOST : process.env.MAILER_HOST || "",
    MAILER_SECURE : process.env.MAILER_SECURE || false,
    MAIL_PORT : process.env.MAIL_PORT || ""
}
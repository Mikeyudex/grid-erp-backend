import { configDotenv } from 'dotenv';
configDotenv();

export const configs = {
    ENV: process.env?.ENV || 'DEV',
    PORT : process.env.PORT || 4000 ,
    MAILER_USER_INFO : process.env.MAILER_USER_INFO || "",
    MAILER_PASS_INFO : process.env.MAILER_PASS_INFO || "",
    MAILER_HOST : process.env.MAILER_HOST || "",
    MAILER_SECURE : process.env.MAILER_SECURE || false,
    MAIL_PORT : process.env.MAIL_PORT || "",
}
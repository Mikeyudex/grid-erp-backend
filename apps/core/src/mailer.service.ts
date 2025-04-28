import { createTransport, Transporter } from 'nodemailer';
import { SettingsTypes } from "./interfaces/settingsTypes.interface";
import { TransporterOptions } from './interfaces/transporterOptions.interface';
import { configs } from 'configs';


export class MailerService {

    private settingsMailer: SettingsTypes = {
        host: configs.MAILER_HOST,
        port: configs.MAIL_PORT,
        secure: Boolean(configs.MAILER_SECURE),
        auth: {
            user: configs.MAILER_USER_INFO,
            pass: configs.MAILER_PASS_INFO
        }
    }
    private transporter: Transporter;

    constructor() {
        let transporterOptions: any = this.settingsMailer
        this.transporter = createTransport(transporterOptions);
    }

    /**
     * sendMail
     */
    public async sendEmail(optionsMail: TransporterOptions) {
        let info: any;
        try {
            if (optionsMail.isAttach) {
                info = await this.transporter.sendMail({
                    from: optionsMail.from || '"Quality ERP" <ayuda@quality.co>',
                    to: optionsMail.to,
                    subject: optionsMail.subject,
                    html: optionsMail.html,
                    attachments: optionsMail.attachments
                });
            } else {
                info = await this.transporter.sendMail({
                    from: optionsMail.from || '"Quality ERP" <ayuda@quality.co>',
                    to: optionsMail.to,
                    subject: optionsMail.subject,
                    html: optionsMail.html
                });
            }
            return {
                error: false,
                message: 'Correo enviado exitosamente'
            }
        } catch (error: any) {
            console.log(error?.message);
            return {
                error: true,
                message: error?.message
            }
        }

    }
}
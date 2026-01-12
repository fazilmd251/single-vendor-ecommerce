import nodemailer from 'nodemailer';
import path from 'path'
import ejs from 'ejs'
import { EmailError } from '../../utils/errors/errors';

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '',
            port: Number(process.env.SMTP_PORT),
           // service: process.env.SMTP_SERVICE,
           // secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    async sendEmail(to: string, subject: string, template: string, data: Record<string, any>) {
        const html = await this.renderEmailTemplate(template, data);
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject,
                html
            });
        } catch (error) {
            console.log("Error sending email :", error)
            throw new EmailError();
        }

    }

    private async renderEmailTemplate(template: string, data: Record<string, any>): Promise<string> {
        const templatePath = path.join(path.resolve(), 'utils', 'templates', `${template}.ejs`);
        return ejs.renderFile(templatePath, data);
    }


}

export const emailService = new EmailService();
const nodemailer = require('nodemailer');
const ApiError = require('../exceptions/api.error');
const userModel = require('../models/user.model');

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация аккаунта на ' + process.env.API_URL,
            text: '',
            html:
                `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
        })
    }

    async confirmEmail(activationLink) {
        const userData = await userModel.findOne({ activationLink });

        if (!userData)
            return new ApiError.NotFound('Пользователь не найден!');

        await userModel.findByIdAndUpdate(userData._id, { isActivated: true });

        return {
            msg: 'Ваша почта подтверждена!'
        }
    }
}

module.exports = new MailService();
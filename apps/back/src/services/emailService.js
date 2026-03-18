import nodemailer from 'nodemailer'

class EmailService {

    createTransport() {
       return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mail.cert.e@gmail.com',
                pass: 'iafdcbjjvyumyomf'
            }
        });
    }

    async sendEmail(email, subject, text) {
        const mailOptions = {
            from: 'mail.cert.e@gmail.com',
            to: email,
            subject,
            text
        };

        return this.createTransport().sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Email enviado: ' + info.response);
        });
    }
}

export default new EmailService();
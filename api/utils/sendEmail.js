const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Note: For production, use real credentials via environment variables.
    // Here we use a fake ethereal account or just log the action since we don't have real SMTP details yet.
    // But we will format it so it *would* send to winnerchinazor@gmail.com.
    
    console.log(`[EMAIL SIMULATOR] Sending email to: ${options.email}`);
    console.log(`[EMAIL SIMULATOR] Subject: ${options.subject}`);
    console.log(`[EMAIL SIMULATOR] Message: \n${options.message}`);
    
    /* 
    // REAL NODEMAILER SETUP (Uncomment and configure .env when SMTP is ready)
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    let mailOptions = {
        from: 'Rentam Notifications <noreply@rentam.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(mailOptions);
    */
};

module.exports = sendEmail;

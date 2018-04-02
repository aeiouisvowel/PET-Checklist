module.exports.sendMail = (toEmail, PID, checklistType, message) => {
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mailscheck123@gmail.com',
            pass: 'Testing#123'
        }
    });

    // var transporter = nodemailer.createTransport({
    //     host: 'mail.cisco.com',
    //     port: 587,
    //     secure: false,
    //     auth: {
    //         user: '',
    //         pass: ''
    //     }
    // });

    var mailOptions = {
        from: 'mailscheck123@gmail.com',
        to: toEmail,
        subject: checklistType + " Checklist : " + PID,
        html: message,
        attachments: [{
            path: './Data/newRequest/' + PID + '-' + checklistType + '.json'
        }]
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports.sendMail = (toEmail, requestID) => {
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mailscheck123@gmail.com',
            pass: 'Testing#123'
        }
    });

    var mailOptions = {
        from: 'mailscheck123@gmail.com',
        to: toEmail,
        subject: "requestID: "+requestID,
        text: "Hi,\nAll approvals has been granted to requestID: "+requestID+". User response with respect to checklist has been attached. Please check & inform user for further procedures.",
        attachments: [{
            path: './Data/newRequest/kuabhis4@cisco.com-comments.json'
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
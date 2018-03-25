module.exports.pingApprover = (level,requestID) => {
    const request = require('request');
    const fs = require("fs");

    var approvers = JSON.parse(fs.readFileSync('./../PET_Checklist/Data/approvers/approverList.json'));
    console.log(approvers[level]);

    var message = "requestID: "+requestID+" has been added to your approval queue.\nTo approve/cancel any request reply : approve/cancel <request ID>";

    var options = {
        url: 'https://api.ciscospark.com/v1/messages',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer ZGYzOTQ1OWItMzkzZS00NWQ0LTljOTYtZTBhOWZhZjVmZWU3NDRiN2Y0MGUtNmEz'
        },
        form: {
            'toPersonEmail': approvers[level],
            'text': message
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            console.log(error);
        }
        else {
            console.log("informed approver!!");
        }
    });
}
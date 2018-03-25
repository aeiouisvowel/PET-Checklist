module.exports.ping = (email,message) => {
    const request = require('request');
    var options = {
        url: 'https://api.ciscospark.com/v1/messages',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer ZGYzOTQ1OWItMzkzZS00NWQ0LTljOTYtZTBhOWZhZjVmZWU3NDRiN2Y0MGUtNmEz'
        },
        form: {
            'toPersonEmail': email,
            'text': message
        }
    };
    request(options, function (error, response, body) {
        if(error){
            console.log(error);
        }
        else {
            console.log("informed user to provide checklist data!!");
        }
    });
}
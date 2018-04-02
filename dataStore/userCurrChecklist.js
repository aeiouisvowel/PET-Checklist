module.exports.store = (email, data2store) => {
    const fs = require("fs");

    var filename = "./Data/userCurrChecklist/" + email + ".json";
    
    fs.writeFile(filename, JSON.stringify(data2store, null, 4), 'utf-8', function (err) {
        if (err) {
            console.log(err);
        }
        console.log("user current checklist PID updated!!");
    });
}
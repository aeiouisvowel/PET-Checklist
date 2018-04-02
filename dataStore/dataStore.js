module.exports.store = (data2store,successComment,checklistType) => {
    const fs = require("fs");

    var filename = "./Data/newRequest/" + data2store.pidNumber + "-"+checklistType+".json";
    fs.writeFile(filename, JSON.stringify(data2store, null, 4), 'utf-8', function (err) {
        if (err) {
            console.log(err);
        }
        console.log(successComment);
    });
}
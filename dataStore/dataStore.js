module.exports.store = (filename,data2store,successComment) => {
    const fs = require("fs");

    fs.writeFile(filename, JSON.stringify(data2store, null, 4), 'utf-8', function (err) {
        if (err) {
            console.log(err);
        }
        console.log(successComment);
    });
}
module.exports.readfile = (email, comment, checklist) => {
    const fs = require("fs");
    const dataStore = require("./dataStore");

    fs.readFile('./Data/newRequest/' + email + '-comments.json', 'utf-8', function (err, data) {
        if (err) console.log(err);
        userComments = JSON.parse(data);

        if (checklist === "LoE")
            userComments.LoE = comment;
        if(checklist === "ResourceType_PM_Risk_Margins")
            userComments.ResourceType_PM_Risk_Margins = comment;
        if (checklist === "TandEorPCOGs")
            userComments.TandEorPCOGs = comment;
        if (checklist === "scopeDocDeliverablesAandE")
            userComments.scopeDocDeliverablesAandE = comment;
        if (checklist === "docsAttached")
            userComments.docsAttached = comment;

        filename = "./Data/newRequest/" + email + "-comments.json";
        successComment = "saved user comment!!";
        dataStore.store(filename,userComments,successComment);
        console.log("----------------------");

    });

}
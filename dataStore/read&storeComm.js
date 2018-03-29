module.exports.readfile = (data2store,checklist,checklistType) => {
    const fs = require("fs");
    const dataStore = require("./dataStore");

    fs.readFile('./Data/newRequest/'+ data2store.petFileNumber+'-'+checklistType+'.json', 'utf-8', function (err, data) {
        if (err) console.log(err);
        userComments = JSON.parse(data);

        if (checklist === "LoE")
            userComments.LoE = data2store.LoE;
        if(checklist === "ResourceType_PM_Risk_Margins")
            userComments.ResourceType = data2store.ResourceType;
        if (checklist === "TandEorPCOGs")
            userComments.TandE = data2store.TandE;
        if (checklist === "scopeDocDeliverablesAandE")
            userComments.scope = data2store.scope;
        if (checklist === "docsAttached")
            userComments.DealDocs = data2store.DealDocs;

        filename = './Data/newRequest/'+ data2store.petFileNumber+'-'+checklistType+'.json';
        successComment = "saved user comment!!";
        dataStore.store(userComments,successComment,checklistType);
        console.log("----------------------");

    });

}
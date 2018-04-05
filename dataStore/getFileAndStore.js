module.exports.readfile = (data2store, checklist, checklistType, email) => {
    const fs = require("fs");
    const dataStore = require("./dataStore");

    fs.readFile("./Data/userCurrChecklist/" + email + ".json", 'utf-8', function (err, edata) {

        fs.readFile('./Data/newRequest/' + JSON.parse(edata).pidNumber + '-' + checklistType + '.json', 'utf-8', function (err, data) {
            if (err) console.log(err);
            userComments = JSON.parse(data);

            //**** PET Checklist ****//
            if (checklist === "LoE")
                userComments.LoE = data2store.LoE;
            if (checklist === "ResourceType_PM_Risk_Margins")
                userComments.ResourceType = data2store.ResourceType;
            if (checklist === "TandEorPCOGs")
                userComments.TandE = data2store.TandE;
            if (checklist === "scopeDocDeliverablesAandE")
                userComments.scope = data2store.scope;
            if (checklist === "docsAttached")
                userComments.DealDocs = data2store.DealDocs;

            //**** SOW Checklist ****//
            if (checklist === "template")
                userComments.template = data2store.template;

            if (checklist === "customer")
                userComments.customer = data2store.customer;

            if (checklist === "mcc")
                userComments.mcc = data2store.mcc;

            if (checklist === "spa")
                userComments.spa = data2store.spa;

            if (checklist === "comment")
                userComments.comment = data2store.comment;

            if (checklist === "deliverables")
                userComments.deliverables = data2store.deliverables;

            if (checklist === "draft")
                userComments.draft = data2store.draft;

            if (checklist === "milestone")
                userComments.milestone = data2store.milestone;

            if (checklist === "header")
                userComments.header = data2store.header;

            if (checklist === "standard")
                userComments.standard = data2store.standard;
            
            //****  ****//

            successComment = "saved user comment!!";
            dataStore.store(userComments, successComment, checklistType);
            console.log("----------------------");
        });
    });
}
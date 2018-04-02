"use strict";

var env = require('node-env-file');
env(__dirname + '/.env');

const port = process.env.PORT || 3010;

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const pingUser = require("./SparkApiCall/pingUser");
const readStoreComm = require("./dataStore/read&storeComm");
const getFileAndStore = require("./dataStore/getFileAndStore");
const dataStore = require("./dataStore/dataStore");
const userCurrChecklist = require("./dataStore/userCurrChecklist")
const approver = require("./SparkApiCall/pingApprover");
const mail = require("./sendMail/sendMail");

const app = express();
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

app.post("/sendChecklistData", (req, res) => {

    if (req.body.result.metadata.intentId === "2abdcf9a-431b-4f36-9c96-ece85e904168") {
        var speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Proposal Checklist";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    //****************** PET Checklist ********************//

    if (req.body.result.metadata.intentId === "96d1b65d-76a1-448a-80ae-94b1b4ff4b15") {
        var speech = "Please provide the PID number";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "42017ae9-a1b8-4a20-b67d-783835238a3b") {
        var data2store = {
            petFileNumber: req.body.result.parameters.petFileNumber
        }
        var successComment = "Created file for user information on Checklist!";
        dataStore.store(data2store, successComment, "PET");

        var speech = "Please reply in 'yes' / 'no'-followed by reason:\n1st Check: Check LoE against requirement.";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "c0c0ddda-4cc2-4a0e-80f7-18bfe33d8a52") {
        var data2store = {
            petFileNumber: req.body.result.parameters.petFileNumber
        }
        if (req.body.result.parameters.LoE === "yes") {
            data2store.LoE = req.body.result.parameters.LoE
        }
        else {
            data2store.LoE = req.body.result.resolvedQuery
        }
        readStoreComm.readfile(data2store, "LoE", "PET");

        var speech = "2nd Check: Resource Type/ P M/ Risks/ Margin";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "2d093862-4daf-4ae3-b58a-7f0983f708c2") {
        var data2store = {
            petFileNumber: req.body.result.parameters.petFileNumber
        }
        if (req.body.result.parameters.ResourceType === "yes") {
            data2store.ResourceType = req.body.result.parameters.ResourceType
        }
        else {
            data2store.ResourceType = req.body.result.resolvedQuery
        }
        readStoreComm.readfile(data2store, "ResourceType_PM_Risk_Margins", "PET");

        var speech = "3rd Check: T&E, PCOGs";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "4a31e4b2-2541-4673-a56a-35c11113f60b") {
        var data2store = {
            petFileNumber: req.body.result.parameters.petFileNumber
        }
        if (req.body.result.parameters.TandE === "yes") {
            data2store.TandE = req.body.result.parameters.TandE
        }
        else {
            data2store.TandE = req.body.result.resolvedQuery
        }
        readStoreComm.readfile(data2store, "TandEorPCOGs", "PET");

        var speech = "4th Check: Scope, Doc Deliverable, A&E";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "84143a0f-6b84-4990-9aff-e57aaff74f58") {
        var data2store = {
            petFileNumber: req.body.result.parameters.petFileNumber
        }
        if (req.body.result.parameters.scope === "yes") {
            data2store.scope = req.body.result.parameters.scope
        }
        else {
            data2store.scope = req.body.result.resolvedQuery
        }
        readStoreComm.readfile(data2store, "scopeDocDeliverablesAandE", "PET");

        var speech = "5th Check: Deal docs attached in PET?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "bcefab4f-219a-4686-8560-5b76eec8768a") {

        var userData = JSON.parse(fs.readFileSync('./Data/newRequest/' + req.body.result.parameters.petFileNumber + '-PET.json', "utf8"));
        if (req.body.result.parameters.DealDocs === "yes") {
            userData.DealDocs = req.body.result.parameters.DealDocs
        }
        else {
            userData.DealDocs = req.body.result.resolvedQuery
        }

        //console.log(userData);
        readStoreComm.readfile(userData, "docsAttached", "PET");

        var checklistData = "\n    Check LoE against requirement. If not, Flag :\n        " + userData.LoE + "\n    Resource Type/ P M/ Risks/ Margin :\n        " + userData.ResourceType + "\n    T&E, PCOGs :\n        " + userData.TandE + "\n    Scope, Doc Deliverable, A&E :\n        " + userData.scope + "\n    Deal docs attached in PET? :\n        " + userData.DealDocs + "\n";

        var managerMessage = "Hi,\n\nPET Checklist for PID : " + userData.petFileNumber + " has been filled by " + req.body.originalRequest.data.data.personEmail + " with the following data :\n" + checklistData + "\nplease do the needful";
        mail.sendMail('kuabhis4@cisco.com', userData.petFileNumber, "PET", managerMessage);
        var speech = "PET Checklist completed with following details:" + checklistData + "Thanks for the information.\nDo you wish to fill any other Checklist?";

        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "b1310558-4a1a-424f-b6ac-f63b23186d22") {
        var speech = "";
        if (req.body.result.parameters.fillMoreChecklist === "yes") {
            speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Proposal Checklist";
        }
        else {
            speech = "Ok"
        }
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    //****************** SOW Checklist ********************//
    if (req.body.result.metadata.intentId === "6f4c9323-5a62-4677-86e5-28368da48112") {
        var speech = "Please provide the PID number";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "c1f03738-f383-485b-aa2e-b36fd5f6febe") {
        var data2store = {
            pidNumber: req.body.result.parameters.pidNumber
        }

        userCurrChecklist.store(req.body.originalRequest.data.data.personEmail,data2store);

        var successComment = "Created file for user information on Checklist!";
        dataStore.store(data2store, successComment, "SOW");

        var speech = "Please reply in 'yes' / 'no'-followed by reason:\n1st Check : Template (Direct/Indirect Technology / Customer Specific)";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "a05e5fd9-073f-4fe4-ae6f-a0dacbe1ab2a") {
        var data2store = {
            template : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "template", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "2nd Check : Customer / Integrator Info";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "bcdaff92-b4c3-45a2-be1a-ec9aa45c11a9") {
        var data2store = {
            customer : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "customer", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "3rd Check : MCC sign off";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "52c45e9c-d30b-4c09-8070-5ce001d4b804") {
        var data2store = {
            mcc : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "mcc", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "4th Check : SPA/DA Review";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "5c87cbaf-678a-4c11-aff4-6cb60ef31ebd") {
        var data2store = {
            spa : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "spa", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "5th Check : Add comment if in doubt";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "6e14c286-c97f-4c49-8bb7-f1b0ba447621") {
        var data2store = {
            comment : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "comment", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "6th Check : Deliverables/Activities/A&E matches LoE/PET?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "8af744d1-1f9f-4daf-a643-2234659a8e83") {
        var data2store = {
            deliverables : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "deliverables", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "7th Check : Draft Watermark?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "7c1784f1-7e66-4d3f-ac6b-b6f1a730d3df") {
        var data2store = {
            draft : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "draft", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "8th Check : Milestone / Pricing matches the quota?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "9e5b51ae-07be-4029-9762-f9ba5399ba59") {
        var data2store = {
            milestone : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "milestone", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "9th Check : Header & Footer Content?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "ee82d9cc-d062-4097-9b04-0526faaf8e6c") {
        var data2store = {
            header : req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "header", "SOW",req.body.originalRequest.data.data.personEmail);

        var speech = "10th Check : Standard filename convention";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "9469eabd-1df8-4405-98f5-b0fd57277b4a") {

        var email = req.body.originalRequest.data.data.personEmail;
        var currPidNumber = JSON.parse(fs.readFileSync("./Data/userCurrChecklist/" + email + ".json", "utf8")).pidNumber;
        var userData = JSON.parse(fs.readFileSync('./Data/newRequest/' + currPidNumber + '-SOW.json', "utf8"));

        var data2store = {
            standard : req.body.result.resolvedQuery
        };
        getFileAndStore.readfile(data2store, "standard", "SOW",email);


        var managerMessage = "</head><body>Hi,<br><br>SOW Checklist for PID : "+userData.pidNumber+" has been filled by "+email+" with the following data :<br><br><div class=WordSection1><table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none'><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Checklist<o:p></o:p></span></b></p></td><td width=256 valign=top style='width:297.0pt;border:solid windowtext 1.0pt;border-left:none;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Comments/Reviews<o:p></o:p></span></b></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Template (Direct/Indirect Technology / Customer Specific)<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.template+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Customer / Integrator Info<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.customer+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>MCC sign off<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.mcc+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>SPA/DA Review<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.spa+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Add comment if in doubt<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.comment+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Deliverables/Activities/A&amp;E matches LoE/PET?<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.deliverables+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Draft Watermark?<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.draft+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Milestone / Pricing matches the quota?<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.milestone+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Header &amp; Footer Content?<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.header+"<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Standard filename convention<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+data2store.standard+"<o:p></o:p></p></td></tr></table><br><br>please do the needful";
        mail.sendMail('kuabhis4@cisco.com', userData.pidNumber, "SOW", managerMessage);

        var checklistData = "\n - Template (Direct/Indirect Technology / Customer Specific)\n        "+userData.template+"\n - Customer / Integrator Info\n        "+userData.customer+"\n - MCC sign off\n        "+userData.mcc+"\n - SPA/DA Review\n        "+userData.spa+"\n - Add comment if in doubt\n        "+userData.comment+"\n - Deliverables/Activities/A&E matches LoE/PET?\n        "+userData.deliverables+"\n - Draft Watermark?\n        "+userData.draft+"\n - Milestone / Pricing matches the quota?\n        "+userData.milestone+"\n - Header & Footer Content?\n        "+userData.header+"\n - Standard filename convention\n        "+data2store.standard+"\n";
        var speech = "SOW Checklist completed with following details:" + checklistData + "Thanks for the information.\nDo you wish to fill any other Checklist?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "3eba7c76-e435-415b-9931-c63495f516f1") {
        var speech = "";
        if (req.body.result.parameters.fillMoreChecklist === "yes") {
            speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Proposal Checklist";
        }
        else {
            speech = "Ok"
        }
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }
    //****************** Testing ********************//

    console.log("*******************************");
    console.log(req.body.result.metadata.intentId);
    console.log("*******************************");

    return res.json({
        speech: "testing",
        displayText: "testing",
    });

});

//start server
app.listen(port, function () {
    console.log("Server up and listening");
});
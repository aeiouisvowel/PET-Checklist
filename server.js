"use strict";

var env = require('node-env-file');
env(__dirname + '/.env');

const port = process.env.PORT || 3010;

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const pingUser = require("./SparkApiCall/pingUser");
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
        var speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Preliminary Budgetary Proposal (PBP) Checklist";
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
            pidNumber: req.body.result.resolvedQuery
        }

        userCurrChecklist.store(req.body.originalRequest.data.data.personEmail, data2store);

        var successComment = "Created file for user information on Checklist!";
        dataStore.store(data2store, successComment, "PET");

        var speech = "Please reply in 'yes' / 'no'-followed by reason:\n1st Check: Check LoE against requirement";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "3bdfe94d-2c36-4801-b45b-875f50576e80") {
        var data2store = {
            LoE: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "LoE", "PET", req.body.originalRequest.data.data.personEmail);

        var speech = "2nd Check: Resource Type/ P M/ Risks/ Margin";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "e60c4333-ce70-456e-98ee-965b5e6a276a") {
        var data2store = {
            ResourceType: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "ResourceType_PM_Risk_Margins", "PET", req.body.originalRequest.data.data.personEmail);

        var speech = "3rd Check: T&E, PCOGs";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "c246cb57-7674-48a0-8961-c37e68b63049") {
        var data2store = {
            TandE: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "TandEorPCOGs", "PET", req.body.originalRequest.data.data.personEmail);

        var speech = "4th Check: Scope, Doc Deliverable, A&E";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "ebc6f43a-0ce6-4c1b-a1f3-79c50e49bf53") {
        var data2store = {
            scope: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "scopeDocDeliverablesAandE", "PET", req.body.originalRequest.data.data.personEmail);

        var speech = "5th Check: Deal docs attached in PET?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "b3f17aab-a7da-4616-b915-bf52116c0ae9") {

        var email = req.body.originalRequest.data.data.personEmail;
        var currPidNumber = JSON.parse(fs.readFileSync("./Data/userCurrChecklist/" + email + ".json", "utf8")).pidNumber;
        var userData = JSON.parse(fs.readFileSync('./Data/newRequest/' + currPidNumber + '-PET.json', "utf8"));

        var data2store = {
            DealDocs: req.body.result.resolvedQuery
        };
        getFileAndStore.readfile(data2store, "docsAttached", "PET", email);

        var managerMessage ="</head><body>Hi,<br><br>PET Checklist for PID : " + userData.pidNumber + " has been filled with the following data :<br><br><table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none'><tr><td width=239 valign=top style='width:233.75pt;border:solid windowtext 1.0pt;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Checklist</span></b><o:p></o:p></p></td><td width=232 valign=top style='width:233.75pt;border:solid windowtext 1.0pt;border-left:none;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal style='mso-margin-top-alt:auto;mso-margin-bottom-alt:auto'><b><span style='color:white'>Comments/Reviews</span></b><o:p></o:p></p></td></tr><tr><td width=239 valign=top style='width:233.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Check LoE against requirement; if not, flag<o:p></o:p></p></td><td width=232 valign=top style='width:233.75pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.LoE+"<o:p></o:p></p></td></tr><tr><td width=239 valign=top style='width:233.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Resource Type/PM/Risk/Margins<o:p></o:p></p></td><td width=232 valign=top style='width:233.75pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.ResourceType + "<o:p></o:p></p></td></tr><tr><td width=239 valign=top style='width:233.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>T&amp;E, PCOGs<o:p></o:p></p></td><td width=232 valign=top style='width:233.75pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData.TandE+"<o:p></o:p></p> </td></tr><tr><td width=239 valign=top style='width:233.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Scope, Doc Deliverables, A&amp;E<o:p></o:p></p></td><td width=232 valign=top style='width:233.75pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.scope + "<o:p></o:p></p></td></tr><tr><td width=239 valign=top style='width:233.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Deal docs attached in PET<o:p></o:p></p></td><td width=232 valign=top style='width:233.75pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + data2store.DealDocs + "<o:p></o:p></p></td></tr></table>";
        mail.sendMail(email, userData.pidNumber, "PET", managerMessage); 

        var checklistData = "\n - Check LoE against requirement. If not, Flag :\n        " + userData.LoE + "\n - Resource Type/ P M/ Risks/ Margin :\n        " + userData.ResourceType + "\n - T&E, PCOGs :\n        " + userData.TandE + "\n - Scope, Doc Deliverable, A&E :\n        " + userData.scope + "\n - Deal docs attached in PET? :\n        " + data2store.DealDocs + "\n";
        var speech = "PET Checklist completed with following details:" + checklistData + "Thanks for the information.\nDo you wish to fill any other Checklist?";

        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "e703989e-d43c-4896-9b6c-3f990bd7b075") {
        var speech = "";
        if (req.body.result.parameters.fillMoreChecklist === "yes") {
            speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Preliminary Budgetary Proposal (PBP) Checklist";
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
            pidNumber: req.body.result.resolvedQuery
        }

        userCurrChecklist.store(req.body.originalRequest.data.data.personEmail, data2store);

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
            template: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "template", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "2nd Check : Customer / Integrator Info";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "35b24218-f813-4476-80ef-735710ffe50f") {
        var data2store = {
            customer: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "customer", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "3rd Check : MCC sign off (APJC-specific)";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "09fa3906-2dc0-4376-9768-e08e104a1a4c") {
        var data2store = {
            mcc: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "mcc", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "4th Check : SPA/DA Review";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "b68ef97e-c65e-4421-91ae-053232f4cae0") {
        var data2store = {
            spa: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "spa", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "5th Check : Add a comment if in doubt regarding incomplete or missing info and who should review, update or provide it";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "d2a52f0e-fffc-4b5a-8529-9e0caa471449") {
        var data2store = {
            comment: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "comment", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "6th Check : Deliverables/Activities/A&E matches LoE/PET";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "ec11f03f-126c-4034-91b6-af07d392838f") {
        var data2store = {
            deliverables: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "deliverables", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "7th Check : Draft Watermark";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "a57835e5-561f-4e26-a45c-087c707d610a") {
        var data2store = {
            draft: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "draft", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "8th Check : DID/PID/Milestone/Pricing matches the quote";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "59b74074-faae-425b-aeb1-ec7c901a2bff") {
        var data2store = {
            milestone: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "milestone", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "9th Check : Header / Footer Content";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "5e07c461-2cba-4f58-82de-12edac26267f") {
        var data2store = {
            header: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "header", "SOW", req.body.originalRequest.data.data.personEmail);

        var speech = "10th Check : Standard filename convention";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "5e85c4f7-2b4e-40b7-8223-ee6e7c824fd7") {

        var email = req.body.originalRequest.data.data.personEmail;
        var currPidNumber = JSON.parse(fs.readFileSync("./Data/userCurrChecklist/" + email + ".json", "utf8")).pidNumber;
        var userData = JSON.parse(fs.readFileSync('./Data/newRequest/' + currPidNumber + '-SOW.json', "utf8"));

        var data2store = {
            standard: req.body.result.resolvedQuery
        };
        getFileAndStore.readfile(data2store, "standard", "SOW", email);

        var managerMessage = "</head><body>Hi,<br><br>SOW Checklist for PID : " + userData.pidNumber + " has been filled with the following data :<br><br><div class=WordSection1><table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none'><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Checklist<o:p></o:p></span></b></p></td><td width=256 valign=top style='width:297.0pt;border:solid windowtext 1.0pt;border-left:none;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Comments/Reviews<o:p></o:p></span></b></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Template (Direct/Indirect Technology / Customer Specific)<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.template + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Customer / Integrator Info<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.customer + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>MCC sign off (APJC -specific)<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.mcc + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>SPA/DA Review<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.spa + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Add a comment if in doubt regarding incomplete or missing info and who should review, update or provide it<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.comment + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Deliverables/Activities/A&amp;E matches LoE/PET<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.deliverables + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Draft Watermark<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.draft + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>DID/PID/Milestone/Pricing matches the quote<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.milestone + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Header/Footer Content<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.header + "<o:p></o:p></p></td></tr><tr><td width=215 valign=top style='width:193.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Standard filename convention<o:p></o:p></p></td><td width=256 valign=top style='width:297.0pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + data2store.standard + "<o:p></o:p></p></td></tr></table>";
        mail.sendMail(email, userData.pidNumber, "SOW", managerMessage);

        var checklistData = "\n - Template (Direct/Indirect Technology / Customer Specific)\n        " + userData.template + "\n - Customer / Integrator Info\n        " + userData.customer + "\n - MCC sign off\n        " + userData.mcc + "\n - SPA/DA Review\n        " + userData.spa + "\n - Add comment if in doubt\n        " + userData.comment + "\n - Deliverables/Activities/A&E matches LoE/PET?\n        " + userData.deliverables + "\n - Draft Watermark?\n        " + userData.draft + "\n - Milestone / Pricing matches the quota?\n        " + userData.milestone + "\n - Header & Footer Content?\n        " + userData.header + "\n - Standard filename convention\n        " + data2store.standard + "\n";
        var speech = "SOW Checklist completed with following details:" + checklistData + "Thanks for the information.\nDo you wish to fill any other Checklist?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "1ad99497-15ce-4757-b21f-84506cf98d3e") {
        var speech = "";
        if (req.body.result.parameters.fillMoreChecklist === "yes") {
            speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Preliminary Budgetary Proposal (PBP) Checklist";
        }
        else {
            speech = "Ok"
        }
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    //****************** RSVP Checklist ********************//
    if (req.body.result.metadata.intentId === "da6761b2-9f81-4f56-978f-cb2d11e8cbf2") {
        var speech = "Please provide the PID number";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "b0f5f736-79e0-4085-a2e9-d269f1798a32") {
        var data2store = {
            pidNumber: req.body.result.resolvedQuery
        }

        userCurrChecklist.store(req.body.originalRequest.data.data.personEmail, data2store);

        var successComment = "Created file for user information on Checklist!";
        dataStore.store(data2store, successComment, "RSVP");

        var speech = "Please reply in 'yes' / 'no'-followed by reason:\n1st Check: Work-type";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "8b907837-3db6-4ab5-8fc7-80d471d6db65") {
        var data2store = {
            workType: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "workType", "RSVP", req.body.originalRequest.data.data.personEmail);

        var speech = "2nd Check: Status Change on actual time";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "08ac9239-9d9a-4b0d-9dac-df87d4d04e3c") {
        var data2store = {
            statusChange: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "statusChange", "RSVP", req.body.originalRequest.data.data.personEmail);

        var speech = "3rd Check: Deal Categorization";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "30429d6e-f201-4f89-97ec-22b934baba44") {
        var data2store = {
            dealCategorization: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "dealCategorization", "RSVP", req.body.originalRequest.data.data.personEmail);

        var speech = "4th Check: List Price,Net Price and cost";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "42fb56f3-e440-4d43-98ad-b09df4f52f07") {
        var data2store = {
            listPrice: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "listPrice", "RSVP", req.body.originalRequest.data.data.personEmail);

        var speech = "5th Check: Primary/Secondary Technology";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "750e13f2-cd76-42c1-b196-876543d872cf") {
        var data2store = {
            primary: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "primary", "RSVP", req.body.originalRequest.data.data.personEmail);

        var speech = "6th Check: Request Feedback on case closure";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "f91db156-9664-4eb8-9754-fd2bb1b550a7") {
        var email = req.body.originalRequest.data.data.personEmail;
        var currPidNumber = JSON.parse(fs.readFileSync("./Data/userCurrChecklist/" + email + ".json", "utf8")).pidNumber;
        var userData = JSON.parse(fs.readFileSync('./Data/newRequest/' + currPidNumber + '-RSVP.json', "utf8"));

        var data2store = {
            reqFeedback: req.body.result.resolvedQuery
        };
        getFileAndStore.readfile(data2store, "reqFeedback", "RSVP", email);

        var managerMessage ="</head><body>Hi,<br><br>RSVP Checklist for PID : " + userData.pidNumber + " has been filled with the following data :<br><br><table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none'><tr><td width=182 valign=top style='width:166.25pt;border:solid windowtext 1.0pt;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Checklist</span></b><o:p></o:p></p></td><td width=289 valign=top style='width:301.25pt;border:solid windowtext 1.0pt;border-left:none;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Comments/Reviews</span></b><o:p></o:p></p></td></tr><tr><td width=182 valign=top style='width:166.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Work-type<o:p></o:p></p></td><td width=289 valign=top style='width:301.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData. workType +"<o:p></o:p></p></td></tr><tr><td width=182 valign=top style='width:166.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Status Change on actual time<o:p></o:p></p></td><td width=289 valign=top style='width:301.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData. statusChange+"<o:p></o:p></p></td></tr><tr><td width=182 valign=top style='width:166.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Deal Categorization<o:p></o:p></p></td><td width=289 valign=top style='width:301.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData. dealCategorization+"<o:p></o:p></p></td></tr><tr><td width=182 valign=top style='width:166.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>List Price, Net Price and Cost<o:p></o:p></p></td><td width=289 valign=top style='width:301.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData. listPrice+"<o:p></o:p></p></td></tr><tr><td width=182 valign=top style='width:166.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Primary/Secondary Technology<o:p></o:p></p></td><td width=289 valign=top style='width:301.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+userData. primary+"<o:p></o:p></p></td></tr><tr><td width=182 valign=top style='width:166.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Request Feedback on case closure<o:p></o:p></p></td><td width=289 valign=top style='width:301.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+data2store. reqFeedback+"<o:p></o:p></p></td></tr></table>";
        mail.sendMail(email, userData.pidNumber, "RSVP", managerMessage); 

        var checklistData = "\n - Work-type :\n        " + userData.workType + "\n - Status Change on actual time :\n        " + userData.statusChange + "\n - Deal Categorization :\n        " + userData.dealCategorization + "\n - List Price, Net Price and Cost :\n        " + userData.listPrice + "\n - Primary/Secondary Technology :\n        " + userData.primary + "\n - Request Feedback on case closure :\n        " + data2store. reqFeedback + "\n";
        var speech = "RSVP Checklist completed with following details:" + checklistData + "Thanks for the information.\nDo you wish to fill any other Checklist?";

        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "8564928a-b214-482e-8fbe-1d81b4f645a3") {
        var speech = "";
        if (req.body.result.parameters.fillMoreChecklist === "yes") {
            speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Preliminary Budgetary Proposal (PBP) Checklist";
        }
        else {
            speech = "Ok"
        }
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    //****************** AST Checklist ********************//
    if (req.body.result.metadata.intentId === "cc0a4d85-3100-49e6-a859-c644105a4870") {
        var speech = "Please provide the PID number";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "be9c4844-b82c-42d0-a9fd-f79839577b95") {
        var data2store = {
            pidNumber: req.body.result.resolvedQuery
        }

        userCurrChecklist.store(req.body.originalRequest.data.data.personEmail, data2store);

        var successComment = "Created file for user information on Checklist!";
        dataStore.store(data2store, successComment, "AST");

        var speech = "Please reply in 'yes' / 'no'-followed by reason:\n1st Check: Cost, Net Price and Margin";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "cd22c14c-fdca-4e56-8fac-8a9fc865ebe0") {
        var data2store = {
            cost: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "cost", "AST", req.body.originalRequest.data.data.personEmail);

        var speech = "2nd Check: SKU, Resource Type";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "ee2e5490-5414-4d08-a34c-5500aa290546") {
        var data2store = {
            sku: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "sku", "AST", req.body.originalRequest.data.data.personEmail);

        var speech = "3rd Check: Partner Cost and T&E";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "bce54bfe-9b2a-4655-82bc-eb59d43f06d1") {
        var data2store = {
            partner: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "partner", "AST", req.body.originalRequest.data.data.personEmail);

        var speech = "4th Check: Correct DID/PID";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "b7b818f0-6be5-47a8-b5f7-36db9a8c828f") {
        var data2store = {
            correct: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "correct", "AST", req.body.originalRequest.data.data.personEmail);

        var speech = "5th Check: LOE/SOW attached (APJC-specific)";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "80153cc3-9b87-4700-8733-9eb42aff5c46") {
        var data2store = {
            lowSow: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "lowSow", "AST", req.body.originalRequest.data.data.personEmail);

        var speech = "6th Check: Send an email to CRT Approver to approve the quote";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "3dd951e8-4d27-4ae5-8857-27ef606cd940") {
        var email = req.body.originalRequest.data.data.personEmail;
        var currPidNumber = JSON.parse(fs.readFileSync("./Data/userCurrChecklist/" + email + ".json", "utf8")).pidNumber;
        var userData = JSON.parse(fs.readFileSync('./Data/newRequest/' + currPidNumber + '-AST.json', "utf8"));

        var data2store = {
            sendMail: req.body.result.resolvedQuery
        };
        getFileAndStore.readfile(data2store, "sendMail", "AST", email);

        var managerMessage ="</head><body>Hi,<br><br>AST Checklist for PID : " + userData.pidNumber + " has been filled with the following data :<br><br><table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none'><tr><td width=172 valign=top style='width:175.25pt;border:solid windowtext 1.0pt;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Checklist</span></b><o:p></o:p></p></td><td width=299 valign=top style='width:292.25pt;border:solid windowtext 1.0pt;border-left:none;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Comments/Reviews</span></b><o:p></o:p></p></td></tr><tr><td width=172 valign=top style='width:175.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Cost, Net Price and Margin<o:p></o:p></p></td><td width=299 valign=top style='width:292.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal> "+ userData.cost +"<o:p></o:p></p></td></tr><tr><td width=172 valign=top style='width:175.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>SKU, Resource Type<o:p></o:p></p></td><td width=299 valign=top style='width:292.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.sku +"<o:p></o:p></p></td></tr><tr><td width=172 valign=top style='width:175.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Partner Cost and T&amp;E<o:p></o:p></p></td><td width=299 valign=top style='width:292.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.partner +"<o:p></o:p></p></td></tr><tr><td width=172 valign=top style='width:175.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Correct DID/PID<o:p></o:p></p></td><td width=299 valign=top style='width:292.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.correct +"<o:p></o:p></p></td></tr><tr><td width=172 valign=top style='width:175.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>LOE/SOW attached (APJC-specific)<o:p></o:p></p></td><td width=299 valign=top style='width:292.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.lowSow +"<o:p></o:p></p></td></tr><tr><td width=172 valign=top style='width:175.25pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Send an email to CRT Approver to approve the quote<o:p></o:p></p></td><td width=299 valign=top style='width:292.25pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+data2store.sendMail +"<o:p></o:p></p></td></tr></table>";
        mail.sendMail(email, userData.pidNumber, "AST", managerMessage); 

        var checklistData = "\n - Cost, Net Price and Margin :\n        " + userData.cost + "\n - SKU, Resource Type :\n        " + userData.sku + "\n - Partner Cost and T&E :\n        " + userData.partner + "\n - Correct DID/PID :\n        " + userData.correct + "\n - LOE/SOW attached (APJC-specific) :\n        " + userData.lowSow + "\n - Send an email to CRT Approver to approve the quote :\n        " + data2store.sendMail + "\n";
        var speech = "AST Checklist completed with following details:" + checklistData + "Thanks for the information.\nDo you wish to fill any other Checklist?";

        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "060f6315-7cf9-45d6-a07d-ad8b16db46dc") {
        var speech = "";
        if (req.body.result.parameters.fillMoreChecklist === "yes") {
            speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Preliminary Budgetary Proposal (PBP) Checklist";
        }
        else {
            speech = "Ok"
        }
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    //****************** PBP Checklist ********************//
    if (req.body.result.metadata.intentId === "21204381-8561-4b8c-a48d-5d7d58718971") {
        var speech = "Please provide the PID number";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "da2f78b4-39af-4054-9a79-86c979a449e5") {
        var data2store = {
            pidNumber: req.body.result.resolvedQuery
        }

        userCurrChecklist.store(req.body.originalRequest.data.data.personEmail, data2store);

        var successComment = "Created file for user information on Checklist!";
        dataStore.store(data2store, successComment, "PBP");

        var speech = "Please reply in 'yes' / 'no'-followed by reason:\n1st Check: Send an email to CRT Approver to approve the PBP";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "82a50d02-19b0-4a74-9e2f-c9fae3379d17") {
        var data2store = {
            sendEmail: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "sendEmail", "PBP", req.body.originalRequest.data.data.personEmail);

        var speech = "2nd Check: DID, PID, Customer/Project name";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "518987a5-855b-4ddb-9675-8abd68bd16ee") {
        var data2store = {
            did: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "did", "PBP", req.body.originalRequest.data.data.personEmail);

        var speech = "3rd Check: Customer requirements";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "c152468c-d43a-4f5c-b5a7-a46e712ad79b") {
        var data2store = {
            customerReq: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "customerReq", "PBP", req.body.originalRequest.data.data.personEmail);

        var speech = "4th Check: Scope/Deliverables/Activities/A&E matches LoE/PET";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "96fafd99-013a-45bc-970f-4f99f00582ae") {
        var data2store = {
            scopeDel: req.body.result.resolvedQuery
        };

        getFileAndStore.readfile(data2store, "scopeDel", "PBP", req.body.originalRequest.data.data.personEmail);

        var speech = "5th Check: Milestone/Pricing matches the PET";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "7f81e883-d74a-455d-8d2c-5d8783da8cc6") {
        var email = req.body.originalRequest.data.data.personEmail;
        var currPidNumber = JSON.parse(fs.readFileSync("./Data/userCurrChecklist/" + email + ".json", "utf8")).pidNumber;
        var userData = JSON.parse(fs.readFileSync('./Data/newRequest/' + currPidNumber + '-PBP.json', "utf8"));

        var data2store = {
            milePrice: req.body.result.resolvedQuery
        };
        getFileAndStore.readfile(data2store, "milePrice", "PBP", email);

        var managerMessage ="</head><body>Hi,<br><br>PBP Checklist for PID : " + userData.pidNumber + " has been filled with the following data :<br><br><table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none'><tr><td width=255 valign=top style='width:242.75pt;border:solid windowtext 1.0pt;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Checklist</span></b><o:p></o:p></p></td><td width=216 valign=top style='width:256.5pt;border:solid windowtext 1.0pt;border-left:none;background:black;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal><b><span style='color:white'>Comments/Reviews</span></b><o:p></o:p></p></td></tr><tr><td width=255 valign=top style='width:242.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Send an email to CRT Approver to approve the PBP<o:p></o:p></p></td><td width=216 valign=top style='width:256.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.sendEmail +"<o:p></o:p></p></td></tr><tr><td width=255 valign=top style='width:242.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>DID, PID, Customer/Project name<o:p></o:p></p></td><td width=216 valign=top style='width:256.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.did +"<o:p></o:p></p></td></tr><tr><td width=255 valign=top style='width:242.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Customer requirements<o:p></o:p></p></td><td width=216 valign=top style='width:256.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.customerReq +"<o:p></o:p></p></td></tr><tr><td width=255 valign=top style='width:242.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Scope/Deliverables/Activities/A&amp;E matches LoE/PET<o:p></o:p></p></td><td width=216 valign=top style='width:256.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>" + userData.scopeDel +"<o:p></o:p></p></td></tr><tr><td width=255 valign=top style='width:242.75pt;border:solid windowtext 1.0pt;border-top:none;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>Milestone/Pricing matches the PET<o:p></o:p></p></td><td width=216 valign=top style='width:256.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0in 5.4pt 0in 5.4pt'><p class=MsoNormal>"+data2store.milePrice +"<o:p></o:p></p></td></tr></table>";
        mail.sendMail(email, userData.pidNumber, "PBP", managerMessage); 

        var checklistData = "\n - Send an email to CRT Approver to approve the PBP :\n        " + userData.sendEmail + "\n - DID, PID, Customer/Project name :\n        " + userData.did + "\n - Customer requirements :\n        " + userData.customerReq + "\n - Scope/Deliverables/Activities/A&E matches LoE/PET :\n        " + userData.scopeDel + "\n - Milestone/Pricing matches the PET :\n        " + data2store.milePrice + "\n";
        var speech = "PBP Checklist completed with following details:" + checklistData + "Thanks for the information.\nDo you wish to fill any other Checklist?";

        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "fdebf6e9-9a96-4012-bf69-b467a5a11829") {
        var speech = "";
        if (req.body.result.parameters.fillMoreChecklist === "yes") {
            speech = "Which checklist you want to fill. Select from the options:\n1. PET Checklist\n2. SoW Checklist\n3. RSVP Checklist\n4. AST quote Checklist\n5. Preliminary Budgetary Proposal (PBP) Checklist";
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
    console.log(req.body.result.contexts);
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
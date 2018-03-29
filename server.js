"use strict";

var env = require('node-env-file');
env(__dirname + '/.env');

const port = process.env.PORT || 3010;

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const pingUser = require("./SparkApiCall/pingUser");
const readStoreComm = require("./dataStore/read&storeComm");
const dataStore = require("./dataStore/dataStore");
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

    if (req.body.result.metadata.intentId === "96d1b65d-76a1-448a-80ae-94b1b4ff4b15") {
        var speech = "Please provide the PID number";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "42017ae9-a1b8-4a20-b67d-783835238a3b") {
        var data2store = {
            petFileNumber : req.body.result.parameters.petFileNumber
        }
        var successComment = "Created file for user information on Checklist!";
        dataStore.store(data2store, successComment,"PET");

        var speech = "Please reply in 'yes' / 'no'-followed by reason:\n1st Check: Check LoE against requirement.";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "c0c0ddda-4cc2-4a0e-80f7-18bfe33d8a52") {
        var data2store = {
            petFileNumber : req.body.result.parameters.petFileNumber
        }
        if (req.body.result.parameters.LoE === "yes"){
            data2store.LoE = req.body.result.parameters.LoE
        }
        else {
            data2store.LoE = req.body.result.resolvedQuery
        }
        readStoreComm.readfile(data2store,"LoE","PET");

        var speech = "2nd Check: Resource Type/ P M/ Risks/ Margin";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "2d093862-4daf-4ae3-b58a-7f0983f708c2") {
        var data2store = {
            petFileNumber : req.body.result.parameters.petFileNumber
        }
        if (req.body.result.parameters.ResourceType === "yes"){
            data2store.ResourceType = req.body.result.parameters.ResourceType
        }
        else {
            data2store.ResourceType = req.body.result.resolvedQuery
        }
        readStoreComm.readfile(data2store,"ResourceType_PM_Risk_Margins","PET");

        var speech = "3rd Check: T&E, PCOGs";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "4a31e4b2-2541-4673-a56a-35c11113f60b") {
        var data2store = {
            petFileNumber : req.body.result.parameters.petFileNumber
        }
        if (req.body.result.parameters.TandE === "yes"){
            data2store.TandE = req.body.result.parameters.TandE
        }
        else {
            data2store.TandE = req.body.result.resolvedQuery
        }
        readStoreComm.readfile(data2store,"TandEorPCOGs","PET");

        var speech = "4th Check: Scope, Doc Deliverable, A&E";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "84143a0f-6b84-4990-9aff-e57aaff74f58") {
        var data2store = {
            petFileNumber : req.body.result.parameters.petFileNumber
        }
        if (req.body.result.parameters.scope === "yes"){
            data2store.scope = req.body.result.parameters.scope
        }
        else {
            data2store.scope = req.body.result.resolvedQuery
        }
        readStoreComm.readfile(data2store,"scopeDocDeliverablesAandE","PET");

        var speech = "5th Check: Deal docs attached in PET?";
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "bcefab4f-219a-4686-8560-5b76eec8768a") {

        var userData = JSON.parse(fs.readFileSync('./Data/newRequest/'+ req.body.result.parameters.petFileNumber+'-PET.json', "utf8"));
        if (req.body.result.parameters.DealDocs === "yes"){
            userData.DealDocs = req.body.result.parameters.DealDocs
        }
        else {
            userData.DealDocs = req.body.result.resolvedQuery
        }

        console.log(userData);
        readStoreComm.readfile(userData,"docsAttached","PET");

        var checklistData = "\n    Check LoE against requirement. If not, Flag :\n        "+userData.LoE+"\n    Resource Type/ P M/ Risks/ Margin :\n        "+userData.ResourceType+"\n    T&E, PCOGs :\n        "+userData.TandE+"\n    Scope, Doc Deliverable, A&E :\n        "+userData.scope+"\n    Deal docs attached in PET? :\n        "+userData.DealDocs+"\n";
        
        var managerMessage = "Hi,\n\nPET Checklist for PID : "+userData.petFileNumber+" has been filled by "+req.body.originalRequest.data.data.personEmail+" with the following data :\n"+checklistData+"\nplease do the needful";
        mail.sendMail('kuabhis4@cisco.com', userData.petFileNumber,"PET", managerMessage);
        var speech = "PET Checklist completed with following details:"+checklistData+"Thanks for the information.\nDo you wish to fill any other Checklist?";
        
        return res.json({
            speech: speech,
            displayText: speech,
        });
    }

    if (req.body.result.metadata.intentId === "b1310558-4a1a-424f-b6ac-f63b23186d22") {
        var speech = "";
        if (req.body.result.parameters.fillMoreChecklist === "yes"){
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

    console.log(req.body.result);
    return res.json({
        speech: "testing",
        displayText: "testing",
    });

});

//start server
app.listen(port, function () {
    console.log("Server up and listening");
});
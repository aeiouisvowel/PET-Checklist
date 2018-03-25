"use strict";

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

// whenever a new request is raised by user
app.post("/newRequest", (req, res) => {
    if (req.body.RequestID && req.body.emailID) {
        //store user requestID
        var filename = "./Data/newRequest/" + req.body.RequestID + ".json";
        var data2store = req.body;
        var successComment = "stored new request!";
        dataStore.store(filename, data2store, successComment);

        //file tostore user comments
        var filename = "./Data/newRequest/" + req.body.emailID + "-comments.json";
        var data2store = {
            requestID: req.body.RequestID,
            requestorEmailID: req.body.emailID
        }
        successComment = "Created file for user comments on Checklist!";
        dataStore.store(filename, data2store, successComment);

        //message to inform user regarding checklist
        var message = "we have received your request.\nWe need few details before we send your reuest for further approvals.\nCould you please provide your name & email-ID?";

        //ping user regarding checklist
        pingUser.ping(req.body.emailID, message);

        return res.json({
            success: true
        });
    }
    else {
        return res.json({
            success: false,
            reason: "insufficient data"
        });
    }
});

app.post("/sendChecklistData", (req, res) => {
    var email = req.body.originalRequest.data.data.personEmail;
    if (req.body.result.metadata.intentId === "2516e72d-342a-4bff-be1f-a8965b807fdb") {
        var comment = {
            description: "Deal docs attached in PET?",
            comments: req.body.result.resolvedQuery
        }
        readStoreComm.readfile(email, comment, "docsAttached");

        approver.pingApprover("level1", JSON.parse(fs.readFileSync('./Data/newRequest/' + email + '-comments.json', 'utf-8')).requestID);

        return res.json({
            speech: "Checklist completed",
            displayText: "Checklist completed",
        });
    }
    if (req.body.result.metadata.intentId === "d017b6b5-4f04-4e5d-a70d-88e970d7803c") {

        var comment = {
            description: "Check LoE against requirement. If not, Flag",
            comments: req.body.result.resolvedQuery
        };
        readStoreComm.readfile(email, comment, "LoE");

        return res.json({
            speech: "Kindly provide details on Resource Type/ P M/ Risks/ Margin",
            displayText: "Kindly provide details on Resource Type/ P M/ Risks/ Margin",
        });
    }
    if (req.body.result.metadata.intentId === "aa5a4466-6998-40fa-aa2b-0c7c2573ac70") {

        var comment = {
            description: "Resource Type/PM/Risk/Margins",
            comments: req.body.result.resolvedQuery
        }
        readStoreComm.readfile(email, comment, "ResourceType_PM_Risk_Margins");

        return res.json({
            speech: "Details of T&E , PCOGs",
            displayText: "Details of T&E , PCOGs",
        });
    }
    if (req.body.result.metadata.intentId === "97b9c799-abf7-47b9-a4af-1e6fa1f4bdcb") {
        var comment = {
            description: "T&E , PCOGs",
            comments: req.body.result.resolvedQuery
        }
        readStoreComm.readfile(email, comment, "TandEorPCOGs");

        return res.json({
            speech: "Description about Scope/ Doc Deliverables/ A & E ",
            displayText: "Description about Scope/ Doc Deliverables/ A & E",
        });
    }
    if (req.body.result.metadata.intentId === "c03d2f06-d2f4-4e72-9256-3a73bc6cdded") {
        var comment = {
            description: "Scope, Doc Deliverables, A&E",
            comments: req.body.result.resolvedQuery
        }
        readStoreComm.readfile(email, comment, "scopeDocDeliverablesAandE");

        return res.json({
            speech: "Have you attached any Deal Docs in PET?",
            displayText: "Have you attached any Deal Docs in PET?",
        });
    }
    if (req.body.result.metadata.intentId === "0718052e-5702-4b0d-b88e-54b56e7e5581") {
        console.log(req.body.result.parameters.approvalStatus);

        var requestor = JSON.parse(fs.readFileSync('./Data/newRequest/' + req.body.result.parameters.requestID + '.json', 'utf-8')).emailID;

        if (req.body.result.parameters.approvalStatus === "cancel") {
            var message = "your Request has been cancelled by" + req.body.originalRequest.data.data.personEmail;
            pingUser.ping(requestor, message);

            return res.json({
                speech: "ok",
                displayText: "ok"
            });
        }

        if (req.body.result.parameters.approvalStatus === "approve") {
            
            var approvers = JSON.parse(fs.readFileSync('./Data/approvers/approverList.json'));

            //ping next approver if required
            if (approvers.level2 !== req.body.originalRequest.data.data.personEmail) {
                approver.pingApprover("level2", req.body.result.parameters.requestID);
            }

            else {
                var message = "All approvals has been granted to"+req.body.result.parameters.requestID+". Our manager will get in touch with you asap.";
                pingUser.ping(requestor, message);

                //send mail to manager once all approvals done
                mail.sendMail('mailscheck123@gmail.com',req.body.result.parameters.requestID);
            }
            return res.json({
                speech: "Ok",
                displayText: "Ok"
            });
        }
    }
});

//start server
app.listen(3010, function () {
    console.log("Server up and listening");
});
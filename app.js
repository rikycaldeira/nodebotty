var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================


// Initialize LUIS
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/ba201298-343e-4c62-a2c5-0467be470b3c?subscription-key=aae67084eee5475eabc88be6a08c8706&timezoneOffset=0&verbose=true');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });



intents.matches(/^alterar nome/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... alterei o teu nome para %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Olá %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Olá! Qual o teu nome?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.dialog('/greeting', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.endDialog(' Olá do LUIS, %s!', session.userData.name);
    }
]);

bot.dialog('/whatis', [
    function (session, args, next) {
        session.endDialog("Eu não sei o que significa \"" + args.entities[0].entity + "\" ainda...");
    }
]);

intents.matches('Greeting', '/greeting');
intents.matches('WhatIs', '/whatis');
bot.dialog('/', intents);
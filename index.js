"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = __importStar(require("ws"));
var express = require("express");
var http = require("http");
var uuidv4 = require("uuid/v4");
var app = express();
var port = process.env.PORT || 9000;
//initialize a http server
var server = http.createServer(app);
//initialize the WebSocket server instance
var wss = new WebSocket.Server({ server: server });
var users = {};
// const sendTo = (connection, user) => {
//   connection.send()
// }
wss.on("connection", function (ws) {
    ws.on("message", function (msg) {
        var data;
        try {
            data = JSON.parse(msg);
        }
        catch (e) {
            console.log("Invalid JSON");
            data = {};
        }
    });
    //send immediate a feedback to the incoming connection
    ws.send(JSON.stringify({
        type: "connect",
        message: "Well hello there, I am a WebSocket server"
    }));
});
//start our server
server.listen(port, function () {
    console.log("Signalling Server running on port: " + port);
});

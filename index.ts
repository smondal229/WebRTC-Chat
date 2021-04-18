
import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import * as WebSocket from 'ws';

const app = express();

const port = process.env.PORT || 9000;

// initialize a http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

const users: any = {};

const sendTo = (connection: WebSocket, message: object) => {
  connection.send(JSON.stringify(message));
}

const sendToAll = (clients: object, type: string, { id, name: userName }: { id: string, name: string }) => {
  Object.values(clients).forEach(client => {
    if (client.name !== userName) {
      client.send(
        JSON.stringify({
          type,
          user: { id, userName }
        })
      );
    }
  });
};

interface ConnectionData {
  name?: string,
  type?: string,
  offer?: string,
  reply?: string
}

interface UserWebSocket extends WebSocket {
  id: string,
  name: string
}

wss.on("connection", (ws: UserWebSocket) => {
  ws.on("message", (msg: string) => {
    let data: ConnectionData;
    console.log(msg);
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.log("Invalid JSON", e);
      data = {};
    }

    const { type, name, offer, reply } = data;

    if (typeof(name) === 'string') {
      switch(type) {
        case 'login':
          if (users[name]) {
            sendTo(ws, {
              type: "login",
              success: false,
              message: "Username is unavailable"
            });
          } else {
            const id = uuidv4();
            const loggedIn = Object.values(
              users
            // @ts-ignore
            // tslint:disable-next-line: no-shadowed-variable
            ).map(({ id, name: userName }) => ({ id, userName }));
            users[name] = ws;
            ws.name = name;
            ws.id = id;
            sendTo(ws, {
              type: "login",
              success: true,
              users: loggedIn
            });
            sendToAll(users, "updateUsers", ws);
          }
          break;
        case 'broadcast':
          const receiver = users[name];
          if (!!receiver) {
            sendTo(receiver, {
              type: "offer",
              offer,

              name: ws.name
            });
          } else {
            sendTo(ws, {
              type: "error",
              message: `User ${name} does not exist!`
            });
          }
          break;
        case 'reply':
          const sender = users[name];
          if (!!sender) {
            sendTo(sender, {
              type: "reply",
              reply,
              name: ws.name
            });
          } else {
            sendTo(ws, {
              type: "error",
              message: `User ${name} does not exist!`
            });
          }
          break;
        case 'leave':
          sendToAll(users, "leave", ws);
          break;
      }
    }
  });

  ws.on("close", () => {
    delete users[ws.name];
    sendToAll(users, "leave", ws);
  });

  // send immediate a feedback to the incoming connection
  ws.send(
    JSON.stringify({
      type: "connect",
      message: "Well hello there, I am a WebSocket server"
    })
  );
});

// start our server
server.listen(port, () => {
  console.log(`Signalling Server running on port: ${port}`);
})

require('dotenv').config()
const express = require("express")
const http = require('http')
const socketio = require('socket.io')
const bodyParser = require('body-parser')

const config = require('./app/utils/config')
const routes = require('./app/utils/routes')

class Server {

    constructor(){
        this.port =  process.env.SOCKET_PORT || 81;
        this.host = process.env.SOCKET_HOST || `localhost`;
        
        this.app = express();
        this.http = http.createServer(this.app);
        this.socket = socketio(this.http, {
            cors: {
                origin: '*',
                methods: ["GET", "POST"],
            }
        });
    }

    appConfig(){        
        this.app.use(
            bodyParser.json()
        );
        new config(this.app);
    }

    /* Including app Routes starts*/
    includeRoutes(){
        new routes(this.app,this.socket).routesConfig();
    }
    /* Including app Routes ends*/ 

    appExecute(){

        this.appConfig();
        this.includeRoutes();

        this.http.listen(this.port, this.host, () => {
            console.log(`Listening on http://${this.host}:${this.port}`);
        });
    }
}

const app = new Server();
app.appExecute();
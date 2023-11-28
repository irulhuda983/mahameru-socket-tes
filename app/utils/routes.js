class Routes {

    constructor(app,socket){
		this.app = app
		this.io = socket
		this.users = []
	}

    appRoutes(){
		this.app.get('/', (req, res) => {
			return res.json({
                'status': 'connected',
            }).status(200)
		});

	}

    socketEvents(){

		this.io.on('connection', (socket) => {

			// join event
            socket.on('joinChannel', (data) => {
                socket.join(data.roomId)

                const userData = {
					username: 'System',
					text: `${data.username} has joined!`,
				}

				this.users.push({
					id: socket.id,
		      		username : data.username,
					roomId: data.roomId
		      	});

                socket.broadcast.to(data.roomId).emit('message', userData)

                console.log(`[CONNECT] : user ${data.username} Join to room id ${data.roomId}`)
            })
			// end join event

			// message event
			socket.on('message', (data) => {
				const userInfo = this.users.find((item) => { return item.id == socket.id })
				socket.broadcast.to(userInfo.roomId).emit('message', data)
				console.log(`[MESSAGE] : sending message to room id ${userInfo.roomId} = ${data}`)
			})
			// end message event

			// tracking event
			socket.on('tracking', (data) => {
				const userInfo = this.users.find((item) => { return item.id == socket.id })
				socket.broadcast.to(userInfo.roomId).emit('tracking', data)
				console.log(`[TRACKING] : sending gps to room id ${userInfo.roomId} = ${JSON.stringify(data)}`)
			})
			// end tracking event

			// disconnect event
		    socket.on('disconnect', () => {				
				for(let i=0; i < this.users.length; i++){
					
					if(this.users[i].id === socket.id){
						socket.broadcast.to(this.users[i].roomId).emit('message', { data: `${this.users[i].username} has disconnect`})
						console.log('[DISCONECT] : a user '+ this.users[i].username +' disconnected')
						this.users.splice(i,1)
		        	}
		      	}
		    });
			// end disconnect event

		});

	}

    routesConfig(){
		this.appRoutes();
		this.socketEvents();
	}
}

module.exports = Routes;
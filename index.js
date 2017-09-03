var express = require('express'),app=express(),http = require('http').Server(app),
sio= require("socket.io"),io=sio(http),mongo=require('mongodb').MongoClient,
parser=require('body-parser'),connections=0;
clients=[];
//t=0;

var friend=require(("chatfriend"));

var port=8080,url="mongodb://jlbaker361:Password1@ds161483.mlab.com:61483/chat";

mongo.connect(url,function(err,db){
	app.use(express.static('public'));
	app.use( parser.json() );       // to support JSON-encoded bodies
app.use(parser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
	app.set('view engine', 'ejs');

	app.get('/',function(req,res){
		res.render('index');
	});

	http.listen(port, function(){
		console.log('listening on *:'+port.toString());
    });

    io.on('connection', function(socket){
  		console.log('a client connected with socket id '+socket.id);
  		clients.push(socket);
  		for(var t=0;t<clients.length;t++){
  			if(clients[t].id==socket.id){
  				clients[t].emit("hello",{name: socket.id.toString()});
  			}
  		}

  		connections++;

		socket.on("login",function(data){
			//console.log(data);
			var success=false;
			for(var t=0;t<clients.length;t++){
				console.log("index of "+clients[t].id.toString()+" is "+t.toString())
  				if(socket.id==clients[t].id){
  					db.collection("users").findOne({name:data.username,password:data.password},{},function(err,out){
  						friend.targetClient(socket,clients,function(boi){
  							boi.emit("user",out);
  							success=(1==1);
  						});
  					});
  				}
  			}
  			if(success==false){
  				console.log("success is false");
  				friend.targetClient(socket,clients,function(boi){
  					boi.emit("tryAgain");
  				});
  			}
		});

		socket.on("joinButtonReq",function(data){
			//console.log(data);
			db.collection("convo").findOne({key:data.convoKey},{},function(err,out){
				console.log("out.name is "+out.name);
  					friend.targetClient(socket,clients,function(boi){
						var y=out;
  						y.id=data.id;
  						boi.emit("joinButtonRes",out);
  					});
			});
		});

		socket.on("joinConvoReq",function(data){
			db.collection("convo").findOne({key:data.convo},{},function(err,out){
				friend.targetClient(socket,clients,function(boi){
					boi.emit("joinConvoRes",out);
				})
			});
		});

		socket.on("newMessageRes",function(data){
			//console.log(data);
			var mess={
				time:Date.now(),
				content:data.content,
				userKey: data.user,
				username:data.name
			}
			db.collection("convo").updateOne({key:data.convo},{$push:{messages:mess}},{},function(err,out){
				/*db.collection("convo").findOne({key:data.convo},{},function(err,out){
				friend.targetClient(socket,clients,function(boi){
					boi.emit("joinConvoRes",out);
				})
			});*/
			//friend.sendConvo(db,data,socket,clients);
			db.collection("convo").findOne({key:data.convo},{},function(err,out){
				console.log(out);
				//socket.emit("updateConvo",out);
				io.sockets.emit("updateConvo",out);
			});
			});
		});

		socket.on("newNameRes",function(data){
			db.collection("convo").updateOne({key:data.convo},{$set:{name:data.newName}},{},function(err,out){
			db.collection("convo").findOne({key:data.convo},{},function(err,out){
				console.log(out);
				//socket.emit("updateConvo",out);
				io.sockets.emit("updateConvo",out);
			});
			});
		});

		socket.on("registerReq",function(data){
			db.collection("users").find({name:data.name},{}).toArray(function(err,out){
				//console.log(out);
				if(out.length>0){
					friend.targetClient(socket,clients,function(boi){
						boi.emit("registerRes");
					});
				}else{
					friend.newUser(db,data.name,data.password,function(u){
						friend.targetClient(socket,clients,function(boi){
							var y={okay:true};
							boi.emit("registerRes",y);
						})
					})
				}
			})
		});

		socket.on("userListReq",function(data){
			//console.log(data);
			db.collection("users").find({key:{$ne: data.userKey}}).toArray(function(err,out){
				friend.targetClient(socket,clients,function(boi){
					boi.emit("userListRes",out);
				})
			})
		});

		socket.on("newChatReq",function(data){
			friend.newConvo(db,data.users,function(convo){
				console.log(convo);
				db.collection("users").findOne({key:data.main.key},{},function(err,out){
					friend.targetClient(socket,clients,function(boi){
  						boi.emit("user",out);
  					});
				});
			})
		})

  		socket.on("disconnect",function(){
  			console.log('a user disconnected; goodbye '+socket.id.toString());
  			connections--;
  			for(var t=0;t<clients.length;t++){
  				if(socket.id==clients[t].id){
  					clients.splice(t,1);
  				}
  			}
  		});
	});
});
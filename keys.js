var port=8080,url="mongodb://jlbaker361:Password1@ds161483.mlab.com:61483/chat",
mongo=require('mongodb').MongoClient,friend=require(("chatfriend")),quantity=5;

mongo.connect(url,function(err,db){
	console.log("making "+quantity.toString()+" keys");
	friend.generateKeys(db,quantity);
});
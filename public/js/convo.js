$("#messageForm").submit(function(e){
	e.preventDefault();
	socket.emit("newMessageRes",{convo:convo.key,user:user.key,name:user.name,content:$("#messageInput").val()});
});

$("#renameButton").submit(function(e){
	e.preventDefault();
	socket.emit("newNameRes",{convo:convo.key,newName:$("#renameInput").val()});
});

$(".message").css("background-color", yourColor);

$("."+user.key).parent().css("background-color", myColor).css("margin-left","30vw");

var element = document.getElementById("messagesBox");
element.scrollTop = element.scrollHeight;

$("#backButton").click(function(){
	convo.key="null";
	socket.emit("login",{username:user.name,password:user.password});
});
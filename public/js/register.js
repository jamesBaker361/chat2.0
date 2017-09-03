console.log(">:)");

$(document).ready(function(){
	socket=io();
$("#registerForm").submit(function(e){
	e.preventDefault();
	socket.emit("registerReq",{name:$("#name").val(),password:$("#password").val()});
	$("#result").html(" ");
});

socket.on("registerRes",function(data){
	console.log("nnnnuuuttt");
	console.log(data);
	if(data){
		$("#result").html("Success. You will be redirected to Login").css("color","green");
		$.get("/");
		/*window.setTimeout(function(){
			$.get("http://chat-asschat.193b.starter-ca-central-1.openshiftapps.com/");
			window.location.replace("http://chat-asschat.193b.starter-ca-central-1.openshiftapps.com/");
		},800);*/
	}else{
		$("#result").html("Username taken! Try Again!").css("color","red")
	}
});
});
<h1>E5O-G4A-Chat-NodeJS</h1>
<h3>1- Start server</h3>
<h3>2- Add DIV Wrapper to your page like this: id="g4a-chat-container"</h3>
<h3>3- Add a JS and copy paste the next code:</h3>
<br>
<p>
$(document).ready(function(){
	console.log("G4A Chat","load");
	// ajax for get the chat and put data content in some wrapper
	var server_address = "http://192.168.0.104:3000";
	$.ajax( server_address+"/g4a_chat_get_base" )
           .done(function(data) {
			   console.log("G4A Chat","Chat Base Loaded");
			   $("#g4a-chat-container").html(data);
           })
           .fail(function() {
			   console.log("G4A Chat","Chat Base Loaded Fail");
           });
});
</p>

/*---------------------SCRIPT FOR CLIENT--------------------*/
var server_address = '';
var messages = [];
var socket = null;
var this_socket_id = "";
var this_name = "";
var this_email = ""
var agent_id = "";


var chat_time_innactivity = 99000000000000;//30mins
var chat_time_close_innactivity = null;

var close_window_chat = null;
/*
$(document).on('ready',function(){
    server_address = document.getElementById("g4a-chat-base-load").getAttribute("data-server-ip");
});
*/
function init() {
    server_address = document.getElementById("g4a-chat-base-load").getAttribute("data-server-ip");
}
init();

setTimeout(function(){
    ////console.log("chat_init_controller()");
    chat_init_controller();
},2000);


function chat_refresh_timer_close(){
  window.clearInterval(chat_time_close_innactivity);
  chat_time_close_innactivity = null;
  chat_time_close_innactivity = setTimeout(function(){
    this_email = $(".chat-email").val();
    socket.emit('disc',{ id:this_socket_id,email:this_email });
  },chat_time_innactivity);
}

function chat_close_window(){
    $(".olab-close-chat-init").fadeOut();
    $(".chat-step-a").fadeIn();
    $(".chat-step-b").fadeOut();
    $(".chat-step-b").html("");
    $(".chat-controls-ajax").stop().dequeue().animate({
        height: "0px"
    });
    bottom = "0px";
    if( $(window).width() < 768 )
        bottom = "100px";
    $(".chat-button-container").stop().dequeue().animate({
        width: "200px",
        bottom: bottom,
    },function(){
        $(this).css({bottom: "",left: ""});
    });
    $(".chat-button-container").css({position: "fixed","z-index": "5",});
    chat_open = 0;
    agent_id = "";
    window.clearInterval(chat_time_close_innactivity);
    chat_time_close_innactivity = null;
}

function chat_init_controller(){
  //init socket
  socket = io.connect(server_address);
  chat_listenner_init();

  //SART - SOCKET - HANDLER
  socket.on('connecting', function () {
    //console.log('connecting:');
  });
  socket.on('connect', function () {
    this_socket_id = socket.socket.sessionid;
    //console.log('connect: this_socket_id'+this_socket_id);
  });
  socket.on('connect_failed', function () {
    //console.log("Client connect_failed");
  });
  socket.on('reconnect_failed', function () {
    //console.log("Client reconnect_failed");
  });
  socket.on('reconnecting', function () {
    //console.log("reconnecting");
  });
  socket.on('reconnect', function () {
    //console.log("reconnect");
  });
  socket.on('disconnect', function () {
    //console.log("disconnect");
      $(".chat-content").append("<p class='left'>: Error de conexion!</p>");
      socket.disconnect();
      window.clearInterval(close_window_chat);
      close_window_chat = null;
      close_window_chat = setTimeout(function(){
          chat_close_window();
      },3000);
  });
  //END - SOCKET - HANDLER

  //Button send message
  $(".chat-sent").on('click',function(){
    chat_sent_message();
  });
  $(".chat-close-conn").on('click',function(){
    //sent message for disconnect from server
    this_email = $(".chat-email").val();
    socket.emit('disc',{ id:this_socket_id,email:this_email });
  });
  //IF IS ADMIN = AGENT AUTOMATIC SENT MESSAGE
  /*$(".chat-type-client").on("click",function(){
    chat_find_assoc_with_agent();
  });*/
  //listenner for enter button
  $('.chat-message').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      chat_sent_message();
    }
  });
  chat_find_assoc_with_agent();
}

function chat_find_assoc_with_agent(){
  this_name = $(".chat-name").val();
  this_email = $(".chat-email").val();
  socket.emit('type_user',{ message:"client",name:this_name,email:this_email });
}

function chat_sent_message(){
  if( $(".chat-message").val() != "" ){
    //get-selected-ids-to-sent
    this_name = $(".chat-name").val();
    ids_to_sent = $(".chat-current-users").val();
    this_email = $(".chat-email").val();
     if( agent_id != "" ){
      //send to the agent assoc
      msg = $(".chat-message").val();
      $(".chat-message").val("");
         //console.log({ message:msg,ids:[agent_id],name:this_name,email:this_email,im:"client" });
         socket.emit('send',{ message:msg,ids:[agent_id],name:this_name,email:this_email,im:"client" });
    } else
      alert("No hay Agentes disponibles.");
  }
}


function chat_listenner_init(){
  socket.on('message',function(data){
    if(data.message){
      console.log("MSG",data);
      //show message
      type = ((data.type == "right")?"right":"left");
      $(".chat-content").append("<p class='"+type+"'><label class='name'>"+data.name+"</label><label class='message'>"+data.message+"</label><label class='date'>"+data.date+"</label></p>");
      //scroll to the last message
      $(".chat-content").stop().dequeue().scrollTo($(".chat-content p").last(), 500,{offset: 0});
      //chat_refresh_timer_close();
    }
    //save current socket id client
    if(data.this_socket_id){
      this_socket_id = data.this_socket_id;
      //console.log("My ID="+this_socket_id);
    }
    //response cliente assoc_client and extrac the id agent
    if( data.agent_assoc_id ){

      if( data.agent_assoc_id != "-" ){
        agent_id = data.agent_assoc_id;
        $(".chat-content").before("<label class='id_agent'>"+data.name+"</label>");
        //console.log("AGEND-ID-ASSOC="+agent_id+":"+data.name);
      } else {
        agent_id = "";
        chat_close_window();
        ////console.log("NO hay agentes disponibles");
        //show message phone
        $(".button-open-window-chat").stop().dequeue().fadeOut(function(){
            $(this).hide();
        });
        $(".olab-message-without-agents").show();
        $(".olab-message-without-agents").stop().dequeue().animate({
            height: "65px"
        },function(){
            setTimeout(function(){
                $(".button-open-window-chat").fadeIn();
                $(".olab-message-without-agents").hide();
                $(".olab-message-without-agents").stop().dequeue().animate({
                    height: "0px"
                });
            },10000);
        });
      }
    }
    //for disconnect
    if( data.disc ){
       ////console.log( data );
       chat_close_window();
       socket.disconnect();
    }
    //for disconnect client
    if( data.message_disc ){

        //show message
        type = ((data.type == "right")?"right":"left");
        $(".chat-content").append("<p class='"+type+"'>"+data.message_disc+"</p>");
        //scroll to the last message
        $(".chat-content").stop().dequeue().scrollTo($(".chat-content p").last(), 500,{offset: 0});
        //chat_refresh_timer_close();
        //DESCONECTAR
        socket.disconnect();
        window.clearInterval(close_window_chat);
        close_window_chat = null;
        close_window_chat = setTimeout(function(){
            chat_close_window();
        },3000);
    }

    //connected and fill select
    /*if( data.connected ){
      $(".chat-current-users").html("");
      $.each(data.connected,function(id,val){
        if( this_socket_id != id )
          $(".chat-current-users").append("<option value='"+id+"'>"+id+"</option>");
      });
    }*/
  });
}

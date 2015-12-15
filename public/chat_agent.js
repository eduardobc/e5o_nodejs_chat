/**
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.6
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.stop().dequeue().animate(attr,f,g.easing,a&&function(){a.call(this,targ,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

jQuery(function( $ ){
    /**
	 * Demo binding and preparation, no need to read this part
	 */
    //borrowed from jQuery easing plugin
    //http://gsgd.co.uk/sandbox/jquery.easing.php
    $.easing.elasout = function(x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.9;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    };
});


/*---------------------SCRIPT FOR CLIENT--------------------*/

var messages = [];
var socket = null;
var this_socket_id = "";
var this_name = "";
var this_email = "";
var clients_ids_assoc = [];
var total_clients_conn = 0;

var server_address = '';

$(document).on('ready',function(){
    server_address = document.getElementById("g4a-chat-base-load").getAttribute("data-server-ip");
});

$(window).load(function(){
    chat_init_controller();
    chat_scroll_init();
});


function chat_init_controller(){
  //init socket
  socket = io.connect(server_address);
  chat_listenner_init();
  //SART - SOCKET - HANDLER
  socket.on('connecting', function () {
    console.log('connecting:');
  });
  socket.on('connect', function () {
    $(".chat_status").html("Conectado");
    this_socket_id = socket.socket.sessionid;
    console.log('connect: this_socket_id'+this_socket_id);
  });
  socket.on('connect_failed', function () {
    console.log("Client connect_failed");
  });
  socket.on('reconnect_failed', function () {
    console.log("Client reconnect_failed");
  });
  socket.on('reconnecting', function () {
    console.log("reconnecting");
  });
  socket.on('reconnect', function () {
    console.log("reconnect");
  });
  socket.on('disconnect', function () {
    console.log("disconnect");
    $(".chat_status").html("Error de conexion!");
    $(".chat_conn").html("Vuelve a Iniciar");
    //cerrar todos los chats
    $(".chat-container").fadeOut(function(){
      $(this).remove();
    });
    socket.disconnect();
    total_clients_conn = 0;
    $(".clients-num").html("Clientes");
  });
  //END - SOCKET - HANDLER

  //IF IS ADMIN = AGENT AUTOMATIC SENT MESSAGE
  $(".chat-type-agent").on("click",function(){
    this_name = $(".chat-name").val();
    this_email = $(".chat-email").val();
    olab_form_chat_validate_email({user_email:this_email,user_name:this_name},function(data){
        if( data.valid_name && data.valid_email )
            socket.emit('type_user',{ message:"agent",name:this_name,email:this_email });
        else {
            if( !data.valid_name ){
                $(".name-error").html("Nombre esta vacio.  ");
                setTimeout(function(){
                    $(".name-error").html("");
                },7000);
            }
            if( !data.valid_email ){
                $(".email-error").html("email no valido.");
                setTimeout(function(){
                    $(".email-error").html("");
                },7000);
            }
        }
    });

  });

}


var scroll_chats = 0;
function chat_scroll_init(){
    $(".right").on("click",function(){
        if( scroll_chats < total_clients_conn*280 )
            scroll_chats = scroll_chats + 280;
        $(".container-overflow").stop().dequeue().scrollTo(scroll_chats+'px',500,{offset: 0});
    });

    $(".left").on("click",function(){
        if( scroll_chats > 250 )
            scroll_chats = scroll_chats - 280;
        $(".container-overflow").stop().dequeue().scrollTo(scroll_chats+'px',500,{offset: 0});
    });
}


function chat_init_controllers_individual_chat(id){
  //listenner for enter button
  $("#"+id).children('.chat-message').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      chat_sent_message($(this));
    }
  });
  //Button send message
  $("#"+id).children(".chat-button-send").on('click',function(){
    console.log($(this));
    chat_sent_message($(this));
  });
  $("#"+id).children(".close-this").on("click",function(){
      console.log("close with message");
      close_single_chat($(this).parent().attr("id"));
  });

  $(".close-this").on("click",function(){
      console.log("chat-container close without message");
      $(this).stop().dequeue().fadeOut(function(){
          $(this).remove();
          $(".chats-container").width( ($(".chats-container").width()-400)+"px" );
          if( scroll_chats > 250 )
              scroll_chats = scroll_chats - 280;
      });
  });
}

function chat_sent_message(obj_this){
  //get-selected-ids-to-sent
  ids_to_sent = [obj_this.parent().attr("id")];
  message = obj_this.parent().children(".chat-message").val();
  this_name = $(".chat-name").val();
  this_email = $(".chat-email").val();
  console.log(ids_to_sent);
  if( $.type(ids_to_sent) != "null"){
    obj_this.parent().children(".chat-message").val("");
      socket.emit('send',{ message:message,ids:ids_to_sent,name:this_name,email:this_email,im:"agent" });
  } else if( agent_id != "" )
    alert("No hay Clientes disponibles.");
}


function chat_listenner_init(){
  socket.on('message',function(data){
    //message new client is added
    if( data.client_assoc_id ){
        total_clients_more_update();
        chat_client_structure = '<div style="display: inline-block; width: 250px; height:300px;" class="chat-container" id="'+data.client_assoc_id+'"><img src="'+server_address+'/olab_close_icon.png" class="close-this"><label class="client-data">'+data.name+'</label><div class="chat-messages"></div><textarea type="text" class="chat-message" placeholder="Tu mensaje"></textarea><button class="chat-button-send">Enviar</button></div>';
      clients_ids_assoc[data.client_assoc_id] = "Client";
      $(".chats-container").width( ($(".chats-container").width()+400)+"px" );
      $(".chats-container").append(chat_client_structure);
      chat_init_controllers_individual_chat(data.client_assoc_id);
        $("#"+data.client_assoc_id).fadeIn();
    }
    //save current socket id client
    if(data.this_socket_id){
      this_socket_id = data.this_socket_id;
      console.log("My ID="+data.this_socket_id);
    }
    //normal message
    if(data.message){
        //show message and get the id client to show into div content
        id_client = data.who;
        type = ((data.type == "right")?"right":"left");
        $("#"+id_client).children(".chat-messages").append("<p class='"+type+"'><label class='name'>"+data.name+"</label><label class='message'>"+data.message+"</label><label class='date'>"+data.date+"</label></p>");
        //scroll to the last message
        $("#"+id_client).children(".chat-messages").stop().dequeue().scrollTo($("#"+id_client).children(".chat-messages").children("p").last(), 500,{offset: 0});
    } else {
      console.log(data);
    }
    //for disconnect
    if( data.disc ){
        var id_client = data.disc;
        $("#"+id_client).css({"background-color": "#F49C00"});
        setTimeout(function(){
            $("#"+id_client).hide(function(){
                $(this).remove();
            });
        });
      total_clients_less_update();
    }
    //for disconnect client
    if( data.message_disc ){
        var id_client = data.who;
        $("#"+id_client).children(".chat-messages").append(data.message_disc+"<br />");
        $("#"+id_client).css({"background-color": "#F49C00"});
        setTimeout(function(){
            $("#"+id_client).hide(function(){
                $(this).remove();
            });
        });
        total_clients_less_update();
    }
    //message status
    if( data.status ){
        $(".chat_status").html(data.status);
    }
    //result assoc with server
    if( data.assoc ){
        $(".chat_conn").html("Sincronizado");
    }
  });
}

function close_single_chat(id_client){
    $("#"+id_client).fadeOut(function(){
        $(this).remove();
        $(".chats-container").width( ($(".chats-container").width()-400)+"px" );
        if( scroll_chats > 250 )
            scroll_chats = scroll_chats - 280;
    });
    //send message and decrement
    console.log({ client_id:id_client });
    total_clients_less_update();
    socket.emit('disc_client',{ client_id:id_client });
}

function total_clients_more_update(){
    total_clients_conn = total_clients_conn+1;
    //$(".clients-num").html("Clientes - "+total_clients_conn);
}

function total_clients_less_update(){
    total_clients_conn = total_clients_conn-1;
    /*if( total_clients_conn <= 0)
        $(".clients-num").html("Clientes");
    else
        $(".clients-num").html("Clientes - "+total_clients_conn);
    */
}


function olab_form_chat_validate_email(user_data,callback){
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    //return re.test(email);;
    callback({valid_name:((user_data.user_name != "")?true:false),valid_email:re.test(user_data.user_email)});
}

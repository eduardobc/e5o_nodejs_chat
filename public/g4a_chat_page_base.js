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


/*
* Copyright (c) 2014 G4A Dev https://www.g4a.mx/
* @author Eduardo Beltran Carbajal
* @version 1.0
*/
var server_address = "";
/*
$(document).on('ready',function(){
    server_address = document.getElementById("g4a-chat-base-load").getAttribute("data-server-ip");
});
*/
function init() {
    server_address = document.getElementById("g4a-chat-base-load").getAttribute("data-server-ip");
    //alert(server_address);
}
init();
//chat vars
var chat_open = 0;
$(window).on('load',function(){
   console.log("globals.js");
   $( "#olab-chat-form" ).submit(function( event ) {
       event.preventDefault();
   });
   //start chat functions
   $(".button-open-window-chat").on('click',function(){
       if( chat_open == 0 ){
           $(".chat-controls-ajax").stop().dequeue().animate({
               height: "170px",
           },function(){
               //$("body").stop().dequeue().scrollTo(".chat-button-container", 500,{offset: 0});
           });
           $(".chat-button-container").stop().dequeue().animate({
               bottom: "0px",
           });
           $(".chat-button-container").css({position: "fixed","z-index": "5",});
           $(".olab-close-chat-init").fadeIn();
           $(".olab-close-chat-init").on("click",function(){
               chat_close_window_init();
           });
           chat_open = 1;
       }
   });

   $(".chat-ok").on("click",function(){
       if( $(".chat-name").val() != "" && $(".chat-email").val() != "" ){
           $.ajax( server_address+"/olab_chat_client" )
           .done(function(data) {
               console.log(data);
               $(".chat-step-b").html(data);
               $(".chat-step-a").fadeOut();
               $(".chat-step-b").fadeIn();
               $(".chat-g-container").fadeOut();
               if( $(window).width() <= 480 ){
                   $(".chat-button-container").stop().dequeue().animate({
                       width: "300px",
                       left: "12px",
                   });
               } else {
                   $(".chat-button-container").stop().dequeue().animate({
                       width: "300px",
                   });
               }
               $(".chat-controls-ajax").stop().dequeue().animate({
                   height: "260px",
               });
           })
           .fail(function() {
               // console.log("Error!");
               $(".chat-button-container").css({position: "absolute","z-index": "2"});
               $(".chat-controls-ajax").stop().dequeue().animate({
                   height: "0px",
               });
               $(".chat-button-container").stop().dequeue().animate({
                   bottom: "0px",
               },function(){
                   $(this).css({left:""});
                   $(".olab-close-chat-init").hide();
                   chat_open = 0;
               });
               setTimeout(function(){
                   //show message phone
                   $(".button-open-window-chat").stop().dequeue().fadeOut(function(){
                       $(this).hide();
                   });
                   $(".olab-message-without-agents").stop().dequeue().animate({
                       height: "65px"
                   },function(){
                       setTimeout(function(){
                           $(".button-open-window-chat").fadeIn();
                           $(".olab-message-without-agents").stop().dequeue().animate({
                               height: "0px"
                           });
                       },20000);
                   });
               },400);
           });
       }

   });
   //end chat functions
});

$( window ).scroll(function() { });
$(window).on('resize',function(){ });

var chat_time_close_innactivity = null;
function chat_close_window_init(){
   $(".chat-button-container").css({position: "absolute","z-index": "2"});
   $(".chat-controls-ajax").stop().dequeue().animate({
       height: "0px",
   });
   $(".chat-button-container").stop().dequeue().animate({
       bottom: "0px",
   },function(){
       $(".chat-g-container").fadeOut();
       $(this).css({left:""});
       chat_open = 0;
       $(".olab-close-chat-init").fadeOut();
       $(".chat-step-a").fadeIn();
       $(".chat-step-b").fadeOut();
       $(".chat-step-b").html("");
       $(".chat-controls-ajax").stop().dequeue().animate({
           height: "0px"
       });
       bottom = "50px";
       if( $(window).width() < 768 )
           bottom = "100px";
       $(".chat-button-container").stop().dequeue().animate({
           width: "200px",
           bottom: bottom
       },function(){
           $(this).css({bottom: ""});
       });
       agent_id = "";
       // console.log("chat_time_close_innactivity="+chat_time_close_innactivity);
       // console.log("chat_close");
       // console.log({ id:this_socket_id,email:this_email });
       this_email = $(".chat-email").val();
       socket.emit('disc',{ id:this_socket_id,email:this_email });
   });
}

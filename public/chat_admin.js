
var current_agent_email = "";
$(window).load(function(){

    //button agent to get clients for this
    $(".agent").on("click",function(){
        $(".agent").removeClass("selected");
        $(this).addClass("selected");
        email_this = $(this).attr("id");
        current_agent_email = email_this;
        $(".content-clients .agent_data_container").html("<h2>CLIENTES</h2>");
        $(".content-conversation .agent_data_container .conversation-overflow").html("");
        $.ajax({
            type: "POST",
            url: "/ajax",
            data: { admin_ajax: "ok", module: "get_clients", email:email_this}
        })
        .done(function( res_data ) {
            $.each(res_data.rows,function(key,val){
                console.log(val);
                $(".content-clients .agent_data_container").append("<div class='client' id='"+val.email_client+"'>"+val.name+"</div>");
            });
            admin_controllers();
        });
    });
    function admin_controllers(){
        $(".client").on('click',function(){
            $(".client").removeClass("selected");
            $(this).addClass("selected");
            email_this = $(this).attr("id");
            $(".content-conversation .agent_data_container .conversation-overflow").html("");
            $.ajax({
                type: "POST",
                url: "/ajax",
                data: {
                    admin_ajax: "ok",
                    module: "get_conversation",
                    email_agent: current_agent_email,
                    email_client: email_this
                }
            })
            .done(function (res_data) {
                $.each(res_data.rows,function(key,val){
                    if( val.email_agent == val.email_from )
                            $(".content-conversation .agent_data_container .conversation-overflow").append("<div class='c-left'><div class='box'><p>"+val.name+"</p><p>"+val.message+"</p><p>"+val.date+"</p></div></div>");
                    else
                            $(".content-conversation .agent_data_container .conversation-overflow").append("<div class='c-right'><div class='box'><p>"+val.name+"</p><p>"+val.message+"</p><p>"+val.date+"</p></div></div>");
                });

            });
        });
    }



});

######################## START SQLITE3 FUNCTIONS ########################

#timestamp

#init server

#db.run("CREATE TABLE olab_chat_users (Email_agent TEXT, User_name TEXT, User_password TEXT, Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, PRIMARY KEY(Email_agent ASC))");
sqlite_add_agent_user_chat = ->
  console.log "ADD NEW AGENT USER"
  db = new sqlite3.Database(file)
  db.serialize ->
    stmt = db.prepare("INSERT INTO olab_chat_users VALUES (?,?,?,?)")
    stmt.bind "ebc@g4all.mx", "Eduardo Beltran", md5("g4alalo2014"), timestamp("DD-MM-YYYY hh:mm:ss")
    stmt.get (error, rows) ->
      if error
        console.log "ERROR - sqlite_add_agent_user_chat()"
        sqlite_chat_print_all "olab_chat_users"
      else
        console.log "RESULT NEW USER AGENT ADDED"
        sqlite_chat_print_all "olab_chat_users"
      return

    return

  stmt.finalize()
  db.close()
  return

sqlite_validate_user_data = (req, res, user_email, user_pass, callback) ->
  console.log "########################### START VALIDATION ###########################"
  db = new sqlite3.Database(file)
  db.serialize ->
    stmt = "SELECT * FROM cms_chatuser WHERE username = '" + user_email + "';"
    db.all stmt, (err, rows) ->
      unauthorized = (res) ->
        res.render "page_agent_session",
          server_ip_address: "http://" + server_ip_address + ":" + server_port
      console.log "ERROR - sqlite_validate_user_data()"  if err
      if rows.length is 0
        console.log "Error authenticating."
        user_name = req.body.user_name
        user_pass = req.body.user_pass
        user = req.session.user
        if user_name is admin_user and user_pass is admin_pass
          req.session = user:
            user_name: user_name
            user_pass: user_pass

          callback()
        else if not user or not user.user_name or not user.user_pass
          unauthorized res
        else if user.user_name is admin_user and user.user_pass is admin_pass
          req.session = user:
            user_name: user.user_name
            user_pass: user.user_pass

          callback()
        else
          unauthorized res
      else if crypto_hash.validatePassword(user_pass, rows[0].password)
        #console.log callback()
        callback()
        # callback
        #   auth: true
        #   User_name: rows[0].username
        console.log "Correct user"

      return

    return

  db.close()
  console.log "########################### END VALIDATION ###########################"
  return

#sqlite_validate_user_data("ebc@g4all.mx","g4alalo2014",function(data){
#    if( data.auth ){
#        console.log(data);
#        console.log("Redirect agent_chat");
#    } else {
#        console.log("Redirect login");
#    }
#});
#

#olab print all conversations chat
sqlite_chat_print_all = (table) ->
  db = new sqlite3.Database(file)
  db.serialize ->
    db.all "SELECT * FROM " + table + ";", (err, rows) ->
      if err
        console.log "ERROR - sqlite_chat_print_all()"
      else
        console.log rows
      return

    return

  db.close()
  return
sqlite_chat_add_new_message = (object_vals, callback) ->
  db = new sqlite3.Database(file)
  console.log "NEW MESSAGE TO SAVE"
  db.serialize ->
    stmt = db.prepare("INSERT INTO olab_chat_history VALUES (?,?,?,?,?)")
    stmt.bind object_vals.email_agent, object_vals.email_client, object_vals.email_from, object_vals.message, timestamp("DD-MM-YYYY hh:mm:ss")
    stmt.get (error, rows) ->
      if error
        console.log "ERROR - sqlite_chat_add_new_message()"
      else
        console.log "RESULT INSERT NEW MESSAGE"
        sqlite_chat_print_all "olab_chat_history"
        callback status: "ok"
      return

    return

  stmt.finalize()
  db.close()
  return


chat_send_message_for_disc_to_client = (this_client_id) ->
  obj_client = get_ids_fron_email_given("_", this_client_id)
  if obj_client isnt false and typeof obj_client isnt "undefined"
    agent_id = agents_ids_assoc_clients[obj_client.ak].agend_id
    who_is = obj_client.client_or_agent
    if who_is is "client"
      client_id = (agents_ids_assoc_clients[obj_client.ak])[obj_client.ok].client_id
      (agents_ids_assoc_clients[obj_client.ak])[obj_client.ok].client_id = ""
      io.sockets.socket(this_client_id).emit "message",
        message_disc: "SE HA PERDIDO LA CONEXION!"
        type: "right"

  return

#FUNCTIONS HANDLER AGENTS AND CLIENTS
chat_add_agent = (id, data) ->
  
  #check if not exist actually
  exist_agent = 0
  for k of agents_ids_assoc_clients
    if typeof agents_ids_assoc_clients[k] isnt "undefined"
      if agents_ids_assoc_clients[k].agent_email is data.email
        console.log "Este agente ya existe"
        
        #send message to the new agent telling that the current email has been used actually
        io.sockets.socket(id).emit "message",
          status: "Este correo ya esta en uso."

        #To Agent
        exist_agent = 1
  unless exist_agent
    object_clients =
      agend_id: id
      agent_name: data.name
      agent_email: data.email

    i = 0
    while i < max_clients_by_agents
      object_clients["client_id_" + i] =
        client_id: ""
        client_name: ""
        client_email: ""
      i++
    agents_ids_assoc_clients[total_agents++] = object_clients
    
    #console.log(agents_ids_assoc_clients);
    io.sockets.socket(id).emit "message",
      assoc: "ok"

  return
#To Agent

#ASSOC CLIENT TO AGENT MAX 2 BY AGENT
chat_add_client = (id, data) ->
  console.log "#######chat_add_client#########"
  console.log agents_ids_assoc_clients
  console.log "#######chat_add_client#########"
  
  #shuffle Arrayagents_ids_assoc_clients
  agents_ids_assoc_clients = shuffle(agents_ids_assoc_clients)
  
  #check first if exists
  # solucion facil: encontrar el cliente duplicado, eliminarlo y volver a asignarle un nuevo agente
  
  # solucion dificil: encontrar el cliente duplicado y enviarle el id del agente que tenia asociado anteriormente, pero antes verificar si esta online
  
  #CHECK IF THE CLIENTE EXISTS ALREADY
  chat_disconnect_client data.email
  
  #ASSOC WITH NEW AGENT
  agent_id_assoc = ""
  agent_name_assoc = ""
  if total_agents > 0
    assoc_client = false
    
    #ASSOC CLIENT ID TO THE FIRST NULL AGENT
    i = 0

    while i < total_agents
      agent_element = agents_ids_assoc_clients[i]
      if typeof agent_element isnt "undefined"
        agent_id_assoc = agents_ids_assoc_clients[i].agend_id
        agent_name_assoc = agents_ids_assoc_clients[i].agent_name
        for e of agent_element
          if agent_element[e].client_id is ""
            agent_element[e].client_id = id
            agent_element[e].client_name = data.name
            agent_element[e].client_email = data.email
            assoc_client = true
            break
        break  if assoc_client
      i++
    if assoc_client
      
      #RESPONDE TO CLIENT TO ADD ID AGENT AND ONLY SENT MESSAGE TO THIS
      io.sockets.socket(id).emit "message",
        agent_assoc_id: agent_id_assoc
        name: agent_name_assoc

      #To Client
      io.sockets.socket(agent_id_assoc).emit "message",
        client_assoc_id: id
        name: data.name

    #To Agent
    else
      console.log "NO HAY AGENTES DISPONIBLES"
      io.sockets.socket(id).emit "message",
        agent_assoc_id: "-"
        name: "-"

  #To Client
  else
    console.log "NO HAY AGENTES DISPONIBLES"
    io.sockets.socket(id).emit "message",
      agent_assoc_id: "-"
      name: "-"

  return
#To Client
shuffle = (arr) ->
  j = undefined
  x = undefined
  i = arr.length

  while i
    j = parseInt(Math.random() * i, 10)
    x = arr[--i]
    arr[i] = arr[j]
    arr[j] = x
  arr

#FUNCTION RETURN OBJECT WITH PARAMETERS, DUPLICATED EMAIL, FIND ID GIVEN A EMAIL, AND RE-RELATION CLIENT WITH AGENT
get_ids_fron_email_given = (email, id) ->
  client_email = ""
  client_name = ""
  client_id = ""
  agent_name = ""
  agent_id = ""
  array_key = ""
  object_key = ""
  agent_or_client_assoc = ""
  if total_agents > 0
    assoc_client = false
    
    #ASSOC CLIENT ID TO THE FIRST NULL AGENT
    i = 0

    while i < total_agents
      array_key = i
      agent_element = agents_ids_assoc_clients[i]
      if typeof agent_element isnt "undefined"
        agent_id = agents_ids_assoc_clients[i].agend_id
        agent_name = agents_ids_assoc_clients[i].agent_name
        if agent_id is id
          
          #find agent
          agent_or_client_assoc = "agent"
          assoc_client = true
          break
        for e of agent_element
          if agent_element[e].client_email is email or agent_element[e].client_id is id
            object_key = e
            client_email = agent_element[e].client_email
            client_name = agent_element[e].client_name
            client_id = agent_element[e].client_id
            agent_or_client_assoc = "client"
            assoc_client = true
            break
        break  if assoc_client
      else
        console.log "------------------------AGENTE UNDEFINED " + id + "------------------------"
      i++
    if assoc_client
      unless agent_or_client_assoc is ""
        ak: array_key
        ok: object_key
        client_or_agent: agent_or_client_assoc
      else
        ak: array_key
        ok: object_key
    else
      false

#DISCONNECT CLIENTS AND SEND IT MESSAGE
chat_disconnect_client = (email_client) ->
  obj_client = get_ids_fron_email_given(email_client, "_")
  if obj_client isnt false and typeof obj_client isnt "undefined"
    
    #GET IDS
    console.log (agents_ids_assoc_clients[obj_client.ak])
    client_id = (agents_ids_assoc_clients[obj_client.ak])[obj_client.ok].client_id
    agent_id = agents_ids_assoc_clients[obj_client.ak].agend_id
    
    #FREE SPACE ON AGENT OBJECT
    #console.log( (agents_ids_assoc_clients[obj_client.ak])[obj_client.ok]  );
    (agents_ids_assoc_clients[obj_client.ak])[obj_client.ok].client_id = ""
    
    #console.log( (agents_ids_assoc_clients[obj_client.ak])[obj_client.ok]  );
    #SEND MESSAGE FOR CLOSE CONNETION SOCKET TO CLIENT AND AGENT ASSOC
    io.sockets.socket(client_id).emit "message",
      disc: "disc"

    #To Client
    io.sockets.socket(agent_id).emit "message",
      disc: client_id

  return
fs = require("fs")
file = "chat.db"
exists = fs.existsSync(file)
sqlite3 = require("sqlite3").verbose()
db = new sqlite3.Database(file)
timestamp = require("console-timestamp")
now = new Date()
db.serialize ->
  db.run "CREATE TABLE olab_chat_history (Email_agent TEXT, Email_client TEXT, Email_from TEXT, Message TEXT, Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)"  unless exists
  return

db.close()
md5 = require("MD5")
console.log "#################### CRYPTO #####################"
crypto_hash = require("./hasher")
console.log crypto_hash
console.log "#################### CRYPTO #####################"
express = require("express")
basicAuth = require("basic-auth")
bodyParser = require("body-parser")
session = require("cookie-session")
os = require("os")
app = express()
server_port = 3000
server_ip_address = "198.61.147.96"
app.set "view engine", "jade"
app.engine "jade", require("jade").__express
app.use (req, res, next) ->
  res.setHeader "Access-Control-Allow-Origin", "*"
  res.setHeader "Access-Control-Allow-Methods", "GET, POST"
  res.setHeader "Access-Control-Allow-Headers", "X-Requested-With,content-type"
  res.setHeader "Access-Control-Allow-Credentials", true
  next()
  return

app.set "views", __dirname + "/tpl"
app.use express.static(__dirname + "/public")
app.use bodyParser()
app.use session(
  keys: [
    "keyolaba"
    "keyolabb"
  ]
  secureProxy: false
)
admin_user = "olabadminuser"
admin_pass = "olab2014adminchat*"
auth = (req, res, next) ->
  unauthorized = (res) ->
    res.render "page_agent_session",
      server_ip_address: "http://" + server_ip_address + ":" + server_port

  user_name = req.body.user_name
  user_pass = req.body.user_pass
  user = req.session.user
  if req.body.user_logout is "logout"
    req.session = null
    return res.render("page_agent_session",
      server_ip_address: "http://" + server_ip_address + ":" + server_port
    )
  sqlite_validate_user_data req, res, user_name, user_pass, next
  # console.log "Next: " + next
  # if user_name is admin_user and user_pass is admin_pass
  #   req.session = user:
  #     user_name: user_name
  #     user_pass: user_pass

  #   next()
  # else if not user or not user.user_name or not user.user_pass
  #   unauthorized res
  # else if user.user_name is admin_user and user.user_pass is admin_pass
  #   req.session = user:
  #     user_name: user.user_name
  #     user_pass: user.user_pass

  #   next()
  # else
  #   unauthorized res

router = express.Router()
router.get "/", auth, (req, res) ->
  res.render "page_agent",
    server_ip_address: "http://" + server_ip_address + ":" + server_port
    data: req

  return

router.get "/olab_chat_agent", auth, (req, res) ->
  res.render "page_agent",
    server_ip_address: "http://" + server_ip_address + ":" + server_port
    data: req

  return

router.post "/", auth, (req, res) ->
  res.render "page_agent",
    server_ip_address: "http://" + server_ip_address + ":" + server_port
    data: req

  return

router.get "/olab_chat_client", (req, res) ->
  res.render "page_client",
    server_ip_address: "http://" + server_ip_address + ":" + server_port

  return

app.use "/", router
io = require("socket.io").listen(app.listen(server_port))
agents_ids_assoc_clients = []
total_agents = 0
max_clients_by_agents = 10
io.sockets.on "connection", (socket) ->
  socket.on "send", (data) ->
    i = 0
    while client_id = data.ids[i]
      io.sockets.socket(client_id).emit "message",
        message: data.message
        connected: socket.manager.connected
        who: socket.id
        name: data.name
        type: "right"

      i++
    io.sockets.socket(socket.id).emit "message",
      message: data.message
      connected: socket.manager.connected
      who: data.ids
      name: data.name
      type: "left"

    obj = get_ids_fron_email_given("_", data.ids)
    if obj.client_or_agent is "client"
      console.log "agent->client"
      client_email = (agents_ids_assoc_clients[obj.ak])[obj.ok].client_email
      sqlite_chat_add_new_message
        email_agent: data.email
        email_client: client_email
        email_from: data.email
        message: data.message
      , (data) ->
        console.log "saved"
        return

    else
      console.log "client->agent"
      agent_email = (agents_ids_assoc_clients[obj.ak]).agent_email
      sqlite_chat_add_new_message
        email_agent: agent_email
        email_client: data.email
        email_from: data.email
        message: data.message
      , (data) ->
        console.log "saved"
        return

    console.log "SEND - MESSAGE END"
    return

  socket.on "type_user", (data) ->
    if data.message is "agent"
      chat_add_agent socket.id, data
    else chat_add_client socket.id, data  if data.message is "client"
    return

  socket.on "disc", (data) ->
    id_client = data.id
    email_client = data.email
    chat_disconnect_client email_client
    return

  socket.on "disc_client", (data) ->
    chat_send_message_for_disc_to_client data.client_id
    return

  socket.on "connecting", ->
    console.log "connecting:"
    return

  socket.on "connect", ->
    console.log "connect:"
    return

  socket.on "connect_failed", ->
    console.log "connect_failed"
    return

  socket.on "reconnect_failed", ->
    console.log "Client reconnect_failed"
    return

  socket.on "reconnecting", ->
    console.log "reconnecting"
    return

  socket.on "reconnect", ->
    console.log "reconnect"
    return

  socket.on "disconnect", ->
    id_client_disconnect = socket.id
    console.log "START disconnect SE DESCONECTO=" + id_client_disconnect
    obj_client = get_ids_fron_email_given("_", id_client_disconnect)
    console.log "disconnect RESULTADO"
    console.log obj_client
    if obj_client isnt false and typeof obj_client isnt "undefined"
      agent_id = agents_ids_assoc_clients[obj_client.ak].agend_id
      who_is = obj_client.client_or_agent
      if who_is is "client"
        client_id = (agents_ids_assoc_clients[obj_client.ak])[obj_client.ok].client_id
        (agents_ids_assoc_clients[obj_client.ak])[obj_client.ok].client_id = ""
        io.sockets.socket(agent_id).emit "message",
          message_disc: "ESTE USUARIO SE DESCONECTO..."
          who: client_id
          name: ""
          type: "right"

      else
        obj = agents_ids_assoc_clients[obj_client.ak]
        for e of obj
          if typeof agent_element[e].client_id isnt "undefined"
            io.sockets.socket(agent_element[e].client_id).emit "message",
              message_disc: "SE HA PERDIDO LA CONEXION!"
              type: "right"

        console.log "#######REMOVE AGENT#########"
        console.log agents_ids_assoc_clients
        delete agents_ids_assoc_clients[obj_client.ak]

        total_agents = total_agents - 1
        console.log agents_ids_assoc_clients
        console.log "#######REMOVE AGENT#########"
        console.log " END AGENTE SE FUE!"
    return

  return

#To Agent
console.log "IP ADDRESS:" + server_ip_address + "   PORT:" + server_port + "   INIT: " + timestamp("DD-MM-YYYY hh:mm:ss")
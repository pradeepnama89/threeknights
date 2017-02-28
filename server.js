var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var allConnected = {demo: "demo", demo1:"demo1"};

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('new message', function(msg){
    //console.log(msg);
    var myObject = {
        username:  'xyz',
        message: msg
    }
    io.emit('new message', myObject);
  });

  socket.on('join',function(msg){
    var data = msg;
    
    console.log("received msg=> "+JSON.stringify(msg));
    
    var check = true;

    if(allConnected.length == 0){
        allConnected.push({[data.user] : data.user});
    } else {
        for (var i = 0; i < allConnected.length; i++) {
            var obj1 = allConnected[i];
            for (var key in obj1) {
              if (obj1.hasOwnProperty(key)) {
                var val = obj1[key];
                // console.log("values iterate=>"+val);
                if(val == data.user){
                    check = false;
                }
              }
            }
        }
        if(check){
            allConnected[data.user] = data.user;    
        }else{
            // console.log("usre already exists");
        }
    }        

    console.log("all connected users =>"+JSON.stringify(allConnected));

    io.emit('user joined', {
       action: 'join',
       users: allConnected
    });
  });

  socket.on('addUser',function(msg){

    console.log("inside addUser=>"+JSON.stringify(msg));

    var obj = {
        action: "addUser",
        game_status: "start",
        gameNumber: msg.gameNumber,
        user_1: msg.user1,
        user_2: msg.user2
    }

    delete allConnected[msg.user1];
    delete allConnected[msg.user2];

    // for (var i = 0; i < allConnected.length; i++) {
    //     var obj1 = allConnected[i];
    //     for (var key in obj1) {
    //       if (obj1.hasOwnProperty(key)) {
    //         var val = obj1[key];
    //         // console.log("values iterate=>"+val);
    //         if(val == msg.user1){
    //             delete allConnected[i];
                
    //         }
    //         if(val == msg.user2){
    //             delete allConnected[i];
    //         }
    //       }
    //     }
    // }

    console.log("allconnected after removeUser"+ JSON.stringify(allConnected));

    // io.emit('user joined', {
    //    action: 'join',
    //    users: allConnected
    // });

    console.log("user grouped to play game"+JSON.stringify(obj));

    io.emit('user joined', obj);

  });

  socket.on('removeUser',function(msg){
    console.log("remvoe user message => "+ JSON.stringify(msg));
    
    delete allConnected[msg.username];

    console.log("allconnected after remove => "+ JSON.stringify(allConnected));
    io.emit('user joined', {
       action: 'join',
       users: allConnected
    });

  });

  socket.on('play',function(msg){
    
    var obj = {
        action: "play",
        gameNumber: msg.gameNumber,
        turn: msg.turn,
        user_1: msg.user_1,
        user_2: msg.user_2,
        board: msg.board
    }

    console.log(" play game"+JSON.stringify(obj));

    io.emit('board message',obj);


  });

  socket.on('win',function(msg){
        var obj = {
            action: "win",
            gameNumber: msg.gameNumber,
            winner: msg.winner
        }

        console.log(" win game"+JSON.stringify(obj));
        io.emit('board message', obj);
  });


  socket.on('quit',function(msg){
        var obj = {
            action: "quit",
            username: msg.username,
            opponent: msg.opponent,
            gameNumber: msg.gameNumber
        }
        console.log(" quit game"+JSON.stringify(obj));
        io.emit('board message', obj);


  });

});

http.listen(port,ip, function(){
    console.log('Server running on http://%s:%s', ip, port); 
});
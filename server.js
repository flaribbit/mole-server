var WebSocketServer = require('websocket').server;
var http = require('http');
var connections={};
var connectionid=0;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(4000, function() {
    console.log((new Date()) + ' Server is listening on port 4000');
});
//域名过滤
function originIsAllowed(origin) {
	return true;
}
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});
//有新的客户端连接
wsServer.on('request', function(request) {
	//检查域名是否合法
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    //创建连接
    var connection = request.accept('echo-protocol', request.origin);
	connection.id=connectionid++;
	connections[connectionid]=connection;
	
    console.log((new Date())+'id'+connection.id+'已连接');
	//消息回调
    connection.on('message', function(message) {
		var data=JSON.parse(message.utf8Data);
		if(data.target){
			console.log((new Date()) + 'ID: '+connection.id+'移动到'+data.target.x+','+data.target.y);
		}
		
		/*if(message.move){
			console.log((new Date()) + 'ID: '+connection.id+'移动到'+message.move.x+','+message.move.y);
		}
        else if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }*/
    });
	//连接关闭
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.'+'ID: '+connection.id);
		delete connections[connection.id];
    });
});
process.on('SIGINT', function () {
    console.log('Exit now!');
    process.exit();
});

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server, {
    cors: {
        origin: "*"
    }
});
const path = require('path');
const {Game} = require("./game.js");
app.use(express.static(path.join(__dirname,'frontend')));

let games = [];
let currentGameIdx = 0;
let winningCombinations = [
    [0,1,2],
    [0,3,6],
    [3,4,5],
    [1,4,7],
    [6,7,8],
    [2,5,8],
    [0,4,8],
    [2,4,6]
 ];
 
let winSet;

io.on('connection', (socket)=>{

    //will assign player a room and return the room object to client
    assignPlayerRoom(socket);

    socket.on('playYourTurn', (room) => {
        games[room.gameId] = room;
        
        if(room.moves === 9){
            io.to(room.gameId).emit('draw');
            return;
        }

        if(checkWinner(room.grid) === true){
            
            if(socket.id === room.player1Id){

                
                io.to(room.gameId).emit('gameOver',winSet);
                return;

            } else {
                
            
                io.to(room.gameId).emit('gameOver',winSet);
                return;
            }
        }

        io.to(room.gameId).emit('turn',room);
    })
    
    socket.on('clientDisconnect', (room) => {
        io.to(room.gameId).emit('playerDisconnected');
    })

    socket.on('restart', (room)=>{
        io.to(room.gameId).emit('restartRequest');
    })

    socket.on('restartRequestResponse',(response)=>{
        console.log(response);
        io.to(response[0].gameId).emit('restartResponse',response[1]);
    })
   
})

server.listen(3001, () => {
    console.log("server listenig at 3001");
})

function assignPlayerRoom(socket){
    
    if(games.length === 0){
        let game = new Game();
        games.push(game);
      
        let currentGame = games[currentGameIdx];
        currentGame = games[currentGameIdx];
        currentGame.playerCount++;
        currentGame.player1Id = socket.id;
        currentGame.gameId = currentGameIdx;
        
        socket.emit('playerInfo', currentGame);
        socket.join(currentGame.gameId)
        
        return;
    }

    let noOfPlayersInGame = games[currentGameIdx].playerCount;
   
    
    if(noOfPlayersInGame === 2){
        
        let game = new Game();
        games.push(game);
        currentGameIdx++;
        
        let currentGame = games[currentGameIdx];

        currentGame = games[currentGameIdx];
        currentGame.playerCount++;
        currentGame.player1Id = socket.id;
        currentGame.gameId = currentGameIdx;
        
        socket.emit('playerInfo', currentGame);
        socket.join(currentGame.gameId)
        //console.log(games[currentGameIdx]);
       

    } else {
        
        let currentGame = games[currentGameIdx];
        currentGame.playerCount++;
        currentGame.player2Id = socket.id;

        socket.emit('playerInfo', currentGame);
        socket.join(currentGame.gameId)
    
        io.to(currentGame.gameId).emit('start');
        
    }

    
}

function checkWinner(grid){
    if(areEqual(grid[0][0],grid[0][1],grid[0][2],0) || 
    areEqual(grid[0][0],grid[1][0],grid[2][0],1) || 
    areEqual(grid[1][0],grid[1][1],grid[1][2],2) || 
    areEqual(grid[0][1],grid[1][1],grid[2][1],3) || 
    areEqual(grid[2][0],grid[2][1],grid[2][2],4) || 
    areEqual(grid[0][2],grid[1][2],grid[2][2],5) || 
    areEqual(grid[0][0],grid[1][1],grid[2][2],6) || 
    areEqual(grid[0][2],grid[1][1],grid[2][0],7)){
        return true;
    }

    return false;

}

function areEqual(a,b,c,combination){
    if((a === b && b === c) && (a !== -1 || b !== -1 || c !== -1)){
        winSet = winningCombinations[combination]
        return true;
    }
    return false;
}


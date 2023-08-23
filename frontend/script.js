
const socket = io();

//const {Game} = require("../game.js");
let playerInfo;
let grid;
let myTurn = false;
let started = false;
let playerElement;
let restartFlag = false;
let cancelTimeOut;
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

const restartBtn = document.getElementsByClassName('restart')[0];
restartBtn.addEventListener("click", reset);

function reset(){
    if(cancelTimeOut !== undefined){
        clearTimeout(cancelTimeOut); 
    }

    stopbackgroundMusic();
    if(started === false){
        let restartDiv = document.getElementsByClassName('askRestartContainer')[0]
        restartDiv.innerHTML += `
        <div class="askForRestart">
        <div class="restartMessage">Please wait. Match not started. <br> No opponents found, you will informed if opponent is found </div>
        </div>`;

        setTimeout(() => {
            restartDiv.innerHTML = ``
        },3000);

        return;
    }

    if(restartFlag === true){
        return;
    }

    let restartDiv = document.getElementsByClassName('askRestartContainer')[0]
    restartDiv.innerHTML += `
    <div class="askForRestart">
    <div class="restartMessage">Restart Request Sent to Opponent.</div>
        <div class="replyLoader">
            <div>Waiting for Reply</div>
            <div class="loader"></div>
        </div>
    </div>`
    
    restartFlag = true;
    socket.emit('restart',playerInfo);
    
}

socket.on('restartRequest', function(){
    
    if(restartFlag === true){
        return;
    }
    restartFlag = true;

    let restartDiv = document.getElementsByClassName('askRestartContainer')[0]
    restartDiv.innerHTML += `
    <div class="askForRestart">
    <div class="restartMessage">Opponent wants to restart the Match <br> Continue ?</div>
            <div class="restartOptions">
                <button class="restartOptionYes">YES</button>
                <button class="restartOptionNo">NO</button>
            </div>
    </div>`
})

const restartChoice = document.getElementsByClassName('askRestartContainer')[0];
restartChoice.addEventListener('click', (event)=>{
    
    let response = [];
    response.push(playerInfo);
    
    if(event && event.target.matches('.restartOptionYes')){
        response.push(true);    
        socket.emit('restartRequestResponse',response);
    } else if(event && event.target.matches('.restartOptionNo')){
        response.push('false');
        socket.emit('restartRequestResponse',response);
    }
})

socket.on('restartResponse', function(restartPermission){
    
    let restartDiv = document.getElementsByClassName('askRestartContainer')[0]

    if(restartPermission === true){
        defaultGrid();
        renderGrid();
        restartDiv.innerHTML = `
        <div class="askForRestart">
            Game Restarted
        </div>`

    } else {   
        restartDiv.innerHTML = `
        <div class="askForRestart">
            <div class="restartMessage">Opponent Denied request to restart match.</div>
        </div>`    
    }

    restartFlag = false;
    setTimeout(()=>{
        restartDiv.innerHTML = ``;
    },5000);

})

socket.on('playerInfo', (info)=>{
    playerInfo = info;
 
    if(playerInfo.player2Id === ""){
        myTurn = true;
        playerElement = 'X';
    } else {
        playerElement = 'O';
    }

})

socket.on('start', ()=>{
   
    const info = document.getElementsByClassName('loading-info')[0];

    let restartDiv = document.getElementsByClassName('askRestartContainer')[0].innerHTML = '<div class="askForRestart>Match Found</div>'
    
    if(myTurn === true){
        info.innerHTML = `Match Found<br>Start the game, You are playing as ❌`
    }  
    
    if(myTurn === false){
        info.innerHTML = `Match Found<br>You are playing as ⭕. Waiting for ❌ to play`
    }

    setTimeout(()=>{
        restartDiv.innerHTML = ''
    },5000)
    started = true;
})

socket.on('turn', (room) =>{
    playChanceMusic();
    myTurn = myTurn === true ? false : true; 
    playerInfo = room;
    
    if(myTurn === true){
        const info = document.getElementsByClassName('loading-info')[0];
        info.innerHTML = `Your Turn`;
    }
    renderGrid();
})

function renderGrid(){
    grid = playerInfo.grid;
    for(let index = 0 ; index < 9 ; index++){
        let x_index = Math.floor(index/3);
        let y_index = (index % 3);

        let id = `block${index}`;
        if(grid[x_index][y_index] === 'X'){
            document.getElementById(id).innerText = 'X';
            document.getElementById(id).style.color = 'black';
            document.getElementById(id).style.backgroundColor = 'white';    
        } else if(grid[x_index][y_index] === 'O'){
            document.getElementById(id).innerText = 'O';
            document.getElementById(id).style.color = 'white'
            document.getElementById(id).style.backgroundColor = 'black' 
        } else {
            document.getElementById(id).innerText = '';
            document.getElementById(id).style.color = ''
            document.getElementById(id).style.backgroundColor = 'rgb(44, 196, 216)' 
        }
    }
}

function defaultGrid(){

    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 1;
    winnerBoard.style.opacity = 0;
    winnerBoard.innerHTML = ``;

    playerInfo.grid = [[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]];
    playerInfo.moves = 0;
    myTurn = playerElement === 'X' ? true : false;

    const info = document.getElementsByClassName('loading-info')[0];
    if(myTurn === true){
        info.innerHTML = `Your Turn`
    } else if(myTurn === false){
        info.innerHTML = `Opponents Chance! please Wait🕔`;
    }

}

function emitDisconnectEvent() {
    socket.emit('clientDisconnect',playerInfo);
}
  
// Listen for the beforeunload event to notify the server
window.addEventListener('beforeunload', emitDisconnectEvent);
  
// Listen for the disconnect event to remove the beforeunload listener
socket.on('disconnect', () => {
    window.removeEventListener('beforeunload', emitDisconnectEvent);
});

socket.on('playerDisconnected',()=>{
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 0;
    winnerBoard.style.opacity = 1;
    winnerBoard.style.height = `40vh`;
    winnerBoard.innerHTML = `Your Opponent Disconnected!! <br> Reload to Join Another Game`;
});

socket.on('gameOver', (winningSet)=>{
    winSet = winningSet;
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 0;
    winnerBoard.style.opacity = 1;
    
    if(myTurn === false){
        winnerBoard.innerHTML = `You Lost`;
        lightWinningBlocks(winSet,false,playerElement);
        playLoserMusic();
    }

    if(myTurn === true){
        winnerBoard.innerHTML = `You Won`;
        lightWinningBlocks(winSet,true,playerElement);
        playVictoryMusic();
    }
    
});

function lightWinningBlocks(winSet,hasWon,element){
 const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    cancelTimeOut = setTimeout(()=>{
        winnerBoard.style.opacity = 0;
        document.getElementsByClassName('game')[0].style.opacity = 1;

        if(hasWon === false) element = element === 'X' ? 'O' : 'X';
        
        for(let i = 0 ; i < 3 ; i++){
            let index = winSet[i];
            let id = `block${index}`;
            document.getElementById(id).style.color = 'white';
            
            if(hasWon === true){
                document.getElementById(id).style.backgroundColor = 'green';
                document.getElementById(id).innerHTML = element;
            } 
            else 
            {
                
                document.getElementById(id).innerHTML = element;
                document.getElementById(id).style.backgroundColor = 'red';
            }
        }

        document.getElementsByClassName('loading-info')[0].innerHTML = `${element} Won`
    },1500);

}

socket.on('draw', ()=>{
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 0;
    winnerBoard.style.opacity = 1;
    winnerBoard.innerHTML = `It's a Tie`;
    playTieMusic();

    setTimeout(()=>{
        winnerBoard.style.opacity = 0;
        document.getElementsByClassName('game')[0].style.opacity = 1;
    },1500)
});

function playmove(id){
    const info = document.getElementsByClassName('loading-info')[0];
    
    if(started === false){
        info.innerHTML = `Game has not started yet !! please wait 🕐`
        return; 
    }else if(myTurn === false){
        info.innerHTML = `Opponents Chance !! please wait 🕐`
        return; 
    }

    grid = playerInfo.grid;

    let index = id.charAt(id.length - 1);
    let x_index = Math.floor(index/3);
    let y_index = (index % 3);

    if(grid[x_index][y_index] === -1){

        grid[x_index][y_index] = playerElement;
        document.getElementById(id).innerText = playerElement;
        playerElement === 'O' ? document.getElementById(id).style.color = 'white' : document.getElementById(id).style.color = 'black';
        playerElement === 'O' ? document.getElementById(id).style.backgroundColor = 'black' : document.getElementById(id).style.backgroundColor = 'white';
        playerInfo.grid = grid;
        playerInfo.moves++;
        socket.emit('playYourTurn',playerInfo);
    }
    
    info.innerHTML = `Opponents Chance !! please wait 🕐`
}

document.getElementById("block0").addEventListener("click",function() {playmove('block0')});
document.getElementById("block1").addEventListener("click",function() {playmove('block1')});
document.getElementById("block2").addEventListener("click",function() {playmove('block2')});
document.getElementById('block3').addEventListener("click",function() {playmove('block3')});
document.getElementById('block4').addEventListener("click",function() {playmove('block4')});
document.getElementById('block5').addEventListener("click",function() {playmove('block5')});
document.getElementById('block6').addEventListener("click",function() {playmove('block6')});
document.getElementById('block7').addEventListener("click",function() {playmove('block7')});
document.getElementById('block8').addEventListener("click",function() {playmove('block8')});



function playbackgroundMusic(){
    const audioElement = document.getElementById("backgroundMusic");
    const slash = document.getElementsByClassName('slash')[0];
    slash.style.opacity = 0;
    audioElement.volume = 0.2;
    audioElement.play();
};

function stopbackgroundMusic(){
    const audioElement = document.getElementById("backgroundMusic");
    audioElement.pause();
    const slash = document.getElementsByClassName('slash')[0];
    slash.style.opacity = 1;
}

const music = document.getElementsByClassName('music')[0];
let playOrStop = 1;

music.addEventListener("click",function(){
    playOrStop = playOrStop === 1 ? 0 : 1;
    playOrStop === 1 ? playbackgroundMusic() : stopbackgroundMusic();
})

function playVictoryMusic(){
    stopbackgroundMusic();

    const confettiElement = document.getElementById('confetti');
    const jsconfetti = new JSConfetti();
    jsconfetti.addConfetti({
        emojis:['✨','🎉','💖','🎇','✨','👑','🏆','🥇','🥂','💥'],
    });
    const victoryAudioElement = document.getElementById('visctoryMusic');
    victoryAudioElement.volume = 0.4;
    victoryAudioElement.play();
}

function playLoserMusic(){
    stopbackgroundMusic();

    const confettiElement = document.getElementById('confetti');
    const jsconfetti = new JSConfetti();
    jsconfetti.addConfetti({
        emojis:['😯','☹','🙁','📉'],
    });
    const loserAudioElement = document.getElementById('loserMusic');
    loserAudioElement.volume = 0.4;
    loserAudioElement.play();
}

function playTieMusic(){
    stopbackgroundMusic();

    const confettiElement = document.getElementById('confetti');
    const jsconfetti = new JSConfetti();
    jsconfetti.addConfetti({
        emojis:['🤝','😐','⚔','♟'],
    });
    const tieAudioElement = document.getElementById('gameTieMusic');
    tieAudioElement.volume = 0.4;
    tieAudioElement.play();
}

function playChanceMusic(){
    stopbackgroundMusic();

    const chanceAudioElement = document.getElementById('gameChanceMusic');
    chanceAudioElement.volume = 0.4;
    chanceAudioElement.play();
}


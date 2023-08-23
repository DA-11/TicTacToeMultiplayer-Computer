let grid = [-1,-1,-1,-1,-1,-1,-1,-1,-1];

let computer= 'O';
let human = 'X';
let currentChance = 'X';
let moves = 0;
let gameWon = false;
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
let cancelTimeOut;
const restartBtn = document.getElementsByClassName('restart')[0];
restartBtn.addEventListener("click", generateChoiceTemplate);

let scoresX = {
    X: 10,
    O: -10,
    tie: 0
};

let scoresO = {
    X: -10,
    O: 10,
    tie: 0
};

function generateChoiceTemplate(){

    let askRestart = document.getElementsByClassName('askRestartContainer')[0];
    askRestart.innerHTML = `
    <div class="askForRestart">
    <div class="restartMessage">You want to play as</div>
            <div class="restartOptions">
                <button class="chooseX">X</button>
                <button class="chooseO">O</button>
            </div>
    </div>`
}

const choiceContainer = document.getElementsByClassName('askRestartContainer')[0];
choiceContainer.addEventListener("click", function(event){

    if(event && event.target.matches('.chooseX')){
       reset('X');
    } 

    if(event && event.target.matches('.chooseO')){
        reset('O')
    } 
    
});


function reset(choice){

    if(cancelTimeOut !== undefined){
        clearTimeout(cancelTimeOut);
        document.getElementsByClassName('winnerBoard')[0].style.opacity = 0;
        document.getElementsByClassName('game')[0].style.opacity = 1;
    }

    document.getElementsByClassName('loading-info')[0].innerHTML = ``

    let askRestart = document.getElementsByClassName('askRestartContainer')[0];
    askRestart.innerHTML = ``;

    grid = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
    computer= choice === 'X' ? 'O' : 'X';
    human = choice;
    currentChance = 'X';
    moves = 0;
    gameWon = false;
    defaultGrid();
    
    if(choice === 'O'){
        setTimeout(() => {
            bestMove1();
        },200);

    }

}

function defaultGrid(){
    for(let i = 0 ; i < 9 ; i++){
        let id = `block${i}`;
        document.getElementById(id).innerText = ``;
        document.getElementById(id).style.backgroundColor = `rgb(55, 201, 226)`;
    }
}

let winningCombination = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

const playmove = function(idx,player){


    if(player !== currentChance || grid[idx] !== -1 || gameWon === true){
        return;
    }

    playChanceMusic();
    let id = `block${idx}`;
    let color = player === 'X' ? 'black' : 'white';
    let bgc = player === 'X' ? 'white' : 'black';

    document.getElementById(id).innerText = player;
    document.getElementById(id).style.color = color;
    document.getElementById(id).style.backgroundColor = bgc;
    moves++;
    currentChance = currentChance === 'X' ? 'O' : 'X';
    
    grid[idx] = player;

    setTimeout(() => {
        if(moves >= 5){
            if(checkWinner(player) === true){
                gameWon = true;
                return;
            }   
        }
    
       if(player === human) {
            setTimeout(() => {
                bestMove1();
            },200);
        }
    },300);
    
}


function checkWinner(player){
    for(let i = 0 ; i < 8 ; i++){
        let combination = winningCombination[i];
        if(grid[combination[0]] !== -1 && grid[combination[0]] === grid[combination[1]] && grid[combination[0]] === grid[combination[2]]){
            winSet = combination;
            declareWinner(player);     
        }
    }

    if(moves === 9){
        tieBanner();
    }

    return false;
}

function declareWinner(player){
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
    document.getElementsByClassName('game')[0].style.opacity = 0;
    winnerBoard.style.opacity = 1;
    winnerBoard.innerHTML = `Player ${player} wins`;
    
    if(player === computer){
        playLoserMusic();
    } else {
        playVictoryMusic();
    }
        
    cancelTimeOut = setTimeout(()=>{
        winnerBoard.style.opacity = 0;
        document.getElementsByClassName('game')[0].style.opacity = 1;

       for(let i = 0 ; i < 3 ; i++){
            let index = winSet[i];
            let id = `block${index}`;
                 
            document.getElementById(id).innerText = player;
            document.getElementById(id).style.color = 'white';
            document.getElementById(id).style.backgroundColor = 'green';
       }
       
       document.getElementsByClassName('loading-info')[0].innerHTML = `${currentChance} Won`
    },1400);
}

function tieBanner(){
    const winnerBoard = document.getElementsByClassName('winnerBoard')[0];
        document.getElementsByClassName('game')[0].style.opacity = 0;
        winnerBoard.style.opacity = 1;
        winnerBoard.innerHTML = `It's a Tie`;
        playTieMusic();
        cancelTimeOut = setTimeout(()=>{
            winnerBoard.style.opacity = 0;
            document.getElementsByClassName('game')[0].style.opacity = 1;
        },1400)
}

document.getElementById("block0").addEventListener("click",function() {playmove(0,human)});
document.getElementById("block1").addEventListener("click",function() {playmove(1,human)});
document.getElementById("block2").addEventListener("click",function() {playmove(2,human)});
document.getElementById('block3').addEventListener("click",function() {playmove(3,human)});
document.getElementById('block4').addEventListener("click",function() {playmove(4,human)});
document.getElementById('block5').addEventListener("click",function() {playmove(5,human)});
document.getElementById('block6').addEventListener("click",function() {playmove(6,human)});
document.getElementById('block7').addEventListener("click",function() {playmove(7,human)});
document.getElementById('block8').addEventListener("click",function() {playmove(8,human)});

function bestMove1() {
    // AI to make its turn
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        // Is the spot available?
        if (grid[i] === -1) {

            grid[i] = computer;
            let score = minimax1(grid, 0, false);
           
            grid[i] = -1;
            if (score > bestScore) {
                bestScore = score;
                move = i;  
            }
        }
      
    }

    playmove(move,computer);
}
  
function minimax1(board1, depth, isMaximizing) {
   
    let result = checkWinner1();
    
    if (result !== null) {
        
       if(computer === 'X'){
        return scoresX[result];
       } else {
        return scoresO[result];
       } 
    }
  
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
          // Is the spot available?
          if (board1[i] === -1) {
            board1[i] = computer;
            let score = minimax1(board1, depth + 1, false);
            board1[i] = -1;
            bestScore = Math.max(score, bestScore);
          }
        }
      
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
          // Is the spot available?
          if (board1[i] === -1) {
            board1[i] = human;
            let score = minimax1(board1, depth + 1, true);
            board1[i] = -1;
            bestScore = Math.min(score, bestScore);
          }
        }
      
      return bestScore;
    }
}

function checkWinner1(){
    let winner = null;
  
    // horizontal
    for (let i = 0; i < 3; i++) {
      if (equals3(grid[0 + i], grid[3 + i], grid[6 + i])) {
        winner = grid[0 + i];
      }
    }
  
    // Vertical
    for (let i = 0; i < 3; i++) {
      if (equals3(grid[0 + (i * 3)], grid[1 + (i * 3)], grid[2 + (i * 3)])) {
        winner = grid[0 + (i * 3)];
      }
    }
  
    // Diagonal
    if (equals3(grid[0], grid[4], grid[8])) {
      winner = grid[0];
    }
    if (equals3(grid[2], grid[4], grid[6])) {
      winner = grid[2];
    }
  
    let openSpots = 0;
    for (let i = 0; i < 9; i++) {
        if (grid[i] === -1) {
          openSpots++;
        }
      
    }
  
    if (winner == null && openSpots == 0) {
      return 'tie';
    } else {
      return winner;
    }
}

function equals3(a, b, c) {
    return a == b && b == c && a !== -1;
}


const music = document.getElementsByClassName('music')[0];
let playOrStop = 1;

music.addEventListener("click",function(){
    playOrStop = playOrStop === 1 ? 0 : 1;
    playOrStop === 1 ? playbackgroundMusic() : stopbackgroundMusic();
})

function stopbackgroundMusic(){
    const audioElement = document.getElementById("backgroundMusic");
    audioElement.pause();
    const slash = document.getElementsByClassName('slash')[0];
    slash.style.opacity = 1;
}

function playbackgroundMusic(){
    const audioElement = document.getElementById("backgroundMusic");
    const slash = document.getElementsByClassName('slash')[0];
    slash.style.opacity = 0;
    audioElement.volume = 0.2;
    audioElement.play();
};

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

function playChanceMusic(){
    stopbackgroundMusic();

    const chanceAudioElement = document.getElementById('gameChanceMusic');
    chanceAudioElement.volume = 0.4;
    chanceAudioElement.play();
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


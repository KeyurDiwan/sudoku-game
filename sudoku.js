//  --> Developed By Keyur Diwan <--

var timerCount = 0;
var setTimer;

function displayTimer(){
    if (timerCount == null){
        timerCount = 0;
    }
    timerCount += 1;
    let m = Math.floor(timerCount/60);
    let s = timerCount % 60;
    if (s < 10){
        s = "0"+s;
    }
    timerDisplay = document.getElementById("timer").innerHTML = m+":"+s;
}

function getBoard(){
    document.getElementById("overlay").style.display = "block";
    document.getElementById("submitButton").setAttribute("disabled", "");
    document.getElementById("clearButton").setAttribute("disabled", "");
    window.clearInterval(setTimer);
    document.getElementById("actions").classList.add("pending");
    var level = document.getElementById("level").value;
    if (level == null || (level != 1 && level != 2 && level != 3)){
        level = 1
    }
    var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    var targetUrl = "http://www.cs.utep.edu/cheon/ws/sudoku/new/?size=9&level=";
    fetch(proxyUrl+targetUrl+level)
        .then(blob => blob.json())
        .then(response => createBoard(response["squares"]))
        .catch( () => {
            var board = [[3,0,6,5,0,8,4,0,0],[5,2,0,0,0,0,0,0,0],[0,8,7,0,0,0,0,3,1],[0,0,3,0,1,0,0,8,0],
                            [9,0,0,8,6,3,0,0,5],[0,5,0,0,9,0,6,0,0],[1,3,0,0,0,0,2,5,0],[0,0,0,0,0,0,0,7,4],[0,0,5,2,0,6,3,0,0]];
            window.localStorage.setItem("board",JSON.stringify(board));
            setUpBoard();
        });
}

function createBoard(squares){
    const board = new Array(9);
    for (var i = 0; i < 9; i++){
        board[i] = new Array(9).fill(0);
    }
    for (var i = 0; i < squares.length; i++){
        c = squares[i]["x"];
        r = squares[i]["y"];
        v = squares[i]["value"];
        board[r][c] = v;
    }
    window.localStorage.setItem("board",JSON.stringify(board));
    setUpBoard();
}

function setUpBoard(){
    timerCount = 0;
    document.getElementById("timer").innerHTML = "0:00";
    document.getElementById("submitButton").setAttribute("disabled", "");
    document.getElementById("clearButton").setAttribute("disabled", "");
    for (var r = 0; r < 9; r++){
        for (var c = 0; c < 9; c++){
            cl = "row-" + r + " col-"+c;
            el = document.getElementsByClassName(cl)[0];
            el.setAttribute("disabled","");
            el.value = null;
            el.classList.remove("background-salmon");
            document.getElementById("score").style.color = "black";
        }
    }
    var board = window.localStorage.getItem("board");
    board =JSON.parse(board);

    
    for (var r = 0; r < 9; r++){
        for (var c = 0; c < 9; c++){
            let cl = "row-" + r + " col-"+c;
            let el = document.getElementsByClassName(cl)[0];
            if (board[r][c] != 0){
                el.value = board[r][c];
                el.removeAttribute("onfocus");
                el.removeAttribute("onblur");
            }
            else{
                el.removeAttribute("disabled");
                el.value = null;
                el.setAttribute("type", "text");
                el.setAttribute("maxLength", 1);
                el.setAttribute("onfocus","highlight(this)");
                el.setAttribute("onblur","clearHighlight()");
            }
        }
    }

    solveBoard(board);
    window.localStorage.setItem("solved", JSON.stringify(board));
    document.getElementById("submitButton").removeAttribute("disabled");
    document.getElementById("clearButton").removeAttribute("disabled");
    document.getElementById("actions").classList.remove("pending");
    document.getElementById("overlay").style.display = "none";
    setTimer = window.setInterval(displayTimer,1000);
}

function highlight(element){
    element.classList.remove("wrong-answer");
    classes = element.className.split(" ");
    classes.forEach(c => {
        elements = document.getElementsByClassName(c);
        Array.from(elements).forEach((el) => {
            el.classList.add("background-gray");
        });
    });
}

function clearHighlight(){
    elements = document.getElementsByClassName("background-gray");
    Array.from(elements).forEach((el) => {
        el.classList.remove("background-gray");
    })
}

function solveBoard(board){
    const rows = new Array(9);
    const cols = new Array(9);
    const squares = new Array(9);
    for (var i = 0; i < 9; i++){
        rows[i] = new Set();
        cols[i] = new Set();
        squares[i] = new Set();
    }
    for (var r = 0; r < 9; r++){
        for (var c = 0; c < 9; c++){
            let s = 3*Math.floor(r/3) + Math.floor(c/3)
            if (board[r][c] != 0){
                rows[r].add(board[r][c]);
                cols[c].add(board[r][c]);
                squares[s].add(board[r][c]);
            }
        }
    }

    for (var r = 0; r < 9; r ++){
        for (var c = 0; c < 9; c++){
            if (board[r][c] == 0){
                helper(board,r,c, rows, cols, squares);
            }
        }
    }
    
}

function isValid(r,c,rows,cols,squares,board){
    if (rows[r].has(board[r][c])){
        return false;
    }
    if (cols[c].has(board[r][c])){
        return false;
    }
    let s = 3*Math.floor(r/3) + Math.floor(c/3);
    if (squares[s].has(board[r][c])){
        return false;
    }
    return true;
}

function helper(board,r,c,rows,cols,squares){
    if (r == 9 && c == 0){
        return true;
    }
    if (board[r][c] != 0){
        [newR, newC] = nextCell(r,c);
        return helper(board, newR, newC, rows, cols, squares);
    }
    for (var i = 1; i <= 9; i++){
        board[r][c] = i;
        if (!isValid(r,c,rows,cols,squares,board)){
            board[r][c] = 0;
            continue;
        }
        rows[r].add(board[r][c]);
        cols[c].add(board[r][c]);
        let s = 3*Math.floor(r/3) + Math.floor(c/3);
        squares[s].add(board[r][c]);
        [newR,newC] = nextCell(r,c);
        if (helper(board, newR, newC, rows, cols, squares)){
            return true;
        }
        rows[r].delete(board[r][c]);
        cols[c].delete(board[r][c]);
        squares[s].delete(board[r][c]);
        board[r][c] = 0;
        
    }
    return false;
}

function nextCell(r,c){
    if (c < 8){
        return [r, c+1];
    }
    else{
        return [r+1, 0];
    }
}

function check(){
    var board = window.localStorage.getItem("solved");
    board = JSON.parse(board);
    let wrongs = 0;
    for(var r = 0; r < 9; r++){
        for (var c = 0; c < 9; c++){
            var cl = "row-"+r + " col-"+c;
            var el = document.getElementsByClassName(cl)[0];
            if (el.value != board[r][c]){
                el.classList.add("wrong-answer");
                wrongs++;
            }
            else{
                el.classList.remove("wrong-answer");
               // el.classList.add("blue");
               
              // el.classList.add("right-ans");
            }
        }
    }
    if (wrongs == 0){
        window.clearInterval(setTimer);
        document.getElementById("score").style.color = "green";
        document.getElementById("submitButton").setAttribute("disabled", "");
        document.getElementById("clearButton").setAttribute("disabled", "");
        for (var r = 0; r < 9; r++){
            for (var c = 0; c < 9; c++){
                cl = "row-" + r + " col-"+c;
                el = document.getElementsByClassName(cl)[0];
                el.setAttribute("disabled","");
            }
        }
    }
}

function clearboard(){
    var board = window.localStorage.getItem("board");
    board =JSON.parse(board);
    
    for (var r = 0; r < 9; r++){
        for (var c = 0; c < 9; c++){
            let cl = "row-" + r + " col-"+c;
            let el = document.getElementsByClassName(cl)[0];
            if (board[r][c] != 0){
                el.value = board[r][c];
            }
            else{
                el.removeAttribute("disabled");
                el.value = null;
                el.setAttribute("type", "text");
                el.setAttribute("maxLength", 1);
            }
        }
    }
}
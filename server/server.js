const WebSocket = require('ws');

// Web Socket Server
// Websocket server to connect to overlay
const wss = new WebSocket.WebSocketServer({ port: 8000 });
let clients = {};
let games = {};

wss.on('connection', function connection(ws) {

    ws.on('message', function message(data) {
        const result = JSON.parse(data)
        const con = clients[clientID].connection;

        // Host
        if(result.method === "host"){
            hostGame(result);
        }

        // Join
        else if(result.method === "join"){
            joinGame(result);
        }

        // Start Game
        else if(result.method === "start"){
            startGame(result);
        }

        // Demon Chat message
        else if(result.method === "demonchat"){
            demonChatMessage(result);
        }

        // Vote
        else if(result.method === "vote"){
            vote(result);
        }

        // Defense Vote
        else if(result.method === "defensevote"){
            defenseVote(result);
        }

        // Psychic
        else if(result.method === "psychic"){
            chooseTarget(result);
        }
        
        // Demon
        else if(result.method === "demon") {
            chooseTarget(result);
        }

        // Doctor
        else if(result.method === "doctor") {
            chooseTarget(result);
        }

    });

    // Generate a new unique client ID and save them
    let clientID = guid();
    while (clientID in clients) {
        clientID = guid()
    }

    clients[clientID] = {
        "connection": ws
    }

    // Send back the client connect
    const payLoad = {
        "method": "connect",
        "clientID": clientID, 
    }

    ws.send(JSON.stringify(payLoad))
});

// Generate Random Client ID
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}

const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();

// Generate Random Game Code
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const charactersLength = characters.length;
const gameCodeLength = 5
function ggid() {
    let result = '';
    for (let i = 0; i < gameCodeLength; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// New Game
function newGame(hostID, players) {
    return {
        hostID: hostID,
        inProgress: false,
        day: 0,
        phase: 'day',
        countdown: 0,
        players: players,
        defendantIndex: 0,
        defenseVotes: {
            yes: 0,
            no: 0
        },
        demonChat: [],
        result: {
            gameOver: false,
            teamWinners: '',
            playerWinners: ''
        },
    }
}

// New player
function newPlayer(clientID, username, role) {
    return {
        clientID: clientID,
        username: username,
        isDead: false,
        votes: 0,
        votedFor: '',
        role: '',
        team: ''
    }
}

// Get all players
function getPlayerList(gameID, clientID, isDemon, showRole) {
    const game = games[gameID];
    const players = game.players;

    let allPlayers = [];
    for(const player of players) {
        let isSelf = false;
        let role = '';
        let votedFor = '';
        let team = '';
        if(clientID === player.clientID) {
            isSelf = true;
            role = player.role;
            votedFor = player.votedFor
        }

        if(showRole || (isDemon && player.team === 'demon')){
            role = player.role;
            team = player.team;
        }

        allPlayers.push({
            username: player.username,
            isDead: player.isDead,
            role: role,
            team: team,
            isSelf: isSelf,
            votes: player.votes,
            votedFor: votedFor
        })
    }

    return allPlayers;
}

// Join game
const playerCaps = {
    min: 3,
    max: 15
}

function joinGame(result) {
    const clientID = result.clientID;
    const con = clients[clientID].connection;
    
    const gameID = result.partyCode.toUpperCase();
    const username = result.username;
    
    // Check if game exists
    if (!(gameID in games)) {
        let payLoad = {
            "method": "partyJoinError",
            "errorMsg": `The party with code, ${gameID}, does not exist`,
        }
        con.send(JSON.stringify(payLoad));
        return;
    }

    const game = games[gameID];

    // Check if game is in progress
    if (game.inProgress) {
        let payLoad = {
            "method": "partyJoinError",
            "errorMsg": "Game is already in progress",
        }
        con.send(JSON.stringify(payLoad));
        return;
    }

    // Check if the game is full
    if(game.players.length >= playerCaps.max){
        let payLoad = {
            "method": "partyJoinError",
            "errorMsg": "The Party is Full",
        }
        con.send(JSON.stringify(payLoad));
        return;
    }

    // Check if the name is already in the game
    for(const p of game.players){
        if(p.username == username){
            let payLoad = {
                "method": "partyJoinError",
                "errorMsg": "Name is already taken",
            }
            con.send(JSON.stringify(payLoad));
            return;
        }
    }

    let player = newPlayer(clientID, username);
    games[gameID].players.push(player);

    // Add player to game
    let playerList = getPlayerList(gameID, clientID, false, false);

    // Send the new player data to all clients in the game
    for (const p of game.players) {
        let currClientID = p.clientID;
        let currClient = clients[currClientID];
        let currCon = currClient.connection;

        let payLoad = {
            "method": "updatePlayerList",
            "players": playerList
        }
        
        currCon.send(JSON.stringify(payLoad));
    }

    let payLoad = {
        "method": "partyConnect",
        "partyCode": gameID,
        "username": username,
        "players": playerList,
        "isHost": false
    }
    
    con.send(JSON.stringify(payLoad));
}

// Host game
function hostGame(result) {
    const clientID = result.clientID;
    const con = clients[clientID].connection;

    const username = result.username;

    // Generate unique game id
    let gameID = ggid();
    while (gameID in games) {
        gameID = ggid();
    }

    // Create the game room
    let players = [newPlayer(clientID, username)]
    games[gameID] = newGame(clientID, players);

    let payLoad = {
        "method": "partyConnect",
        "partyCode": gameID,
        "username": username,
        "players": [{
            username: username,
            who: 'self'
        }],
        "isHost": true
    }

    con.send(JSON.stringify(payLoad));
}


function sendPlayerList(gameID, clientID, isDemon, showRole) {
    let playerList = getPlayerList(gameID, clientID, isDemon, showRole);

    // Send data to player
    let playerCon = clients[clientID].connection;
    let payLoad = {
        "method": "updatePlayerList",
        "players": playerList
    }

    playerCon.send(JSON.stringify(payLoad));
}

function sendToPlayer(clientID, payLoad) {
    let playerCon = clients[clientID].connection;
    playerCon.send(JSON.stringify(payLoad));
}

function broadcastToAllPlayers(gameID, payLoad) {
    const game = games[gameID];
    for(player of game.players) {
        let playerCon = clients[player.clientID].connection;
        playerCon.send(JSON.stringify(payLoad));
    }
}

function broadcastToAllDemons(gameID, payLoad) {
    const game = games[gameID];
    for(player of game.players) {
        if(player.team !== 'demon') continue;
        let playerCon = clients[player.clientID].connection;
        playerCon.send(JSON.stringify(payLoad));
    }
}

// All roles
const roles = {
    'Villager' :{
        team: 'villager',
        description: 'Find out who is killing off the villagers.'
    },
    'Psychic' :{
        team: 'villager',
        description: 'Use your powers to find out who the demons are.'
    },
    'Doctor' :{
        team: 'villager',
        description: 'Heal others who may be attacked at night.'
    },
    'Demon' :{
        team: 'demon',
        description: 'Kill all of the villagers.'
    },
}

// Give players roles
function assignRoles(gameID) {
    // Get the current game
    const game = games[gameID];

    // Calculate number of demons
    const playerCount = game.players.length;
    const demonCount = Math.floor((playerCount/6) + 1);

    // Add roles to a bank of roles
    let roleBank = [];
    
    // Add roles to bank
    roleBank = roleBank.concat(Array(demonCount).fill('Demon'));
    roleBank.push('Psychic', 'Doctor');

    // Fill the rest with villagers
    const villagerCount = playerCount - roleBank.length;
    roleBank = roleBank.concat(Array(villagerCount).fill('Villager'));

    // Assign Each Player a role
    for(let i = 0; i<game.players.length; i++) {

        // Get random role from list
        let index = Math.floor( Math.random() * roleBank.length );
        let role = roleBank[index];
        roleBank.splice(index, 1); 

        // Update role in object
        game.players[i].isDead = false;
        game.players[i].role = role;
        game.players[i].team = roles[role].team

        // Send data to player
        let player = game.players[i];
        let playerCon = clients[player.clientID].connection;
        let payLoad = {
            "method": "role",
            "role": role,
            "roleDescription": roles[role].description,
            "team": roles[role].team, 
        }
        playerCon.send(JSON.stringify(payLoad));
    }

    // Send demons updated players
    for(let i = 0; i<game.players.length; i++) {
        // Get player
        let player = game.players[i];

        // Check if player is not a demon
        if(player.team !== "demon") continue;
        
        // Send playerlist to player
        let clientID = player.clientID;
        sendPlayerList(gameID, clientID, true, false);
    }
}

// Start game
function startGame(result) {
    const clientID = result.clientID;

    // Make sure request comes from host
    if(!result.isHost) return;

    // Make sure the room exists
    const partyCode = result.partyCode;
    if(!(partyCode in games)) return;

    // Make sure host ID matches
    const game = games[partyCode];
    if(game.hostID !== clientID) return;

    // Make sure there is the minimum number of players
    if(game.players.length < playerCaps.min) return;

    // Reset game
    games[partyCode] = newGame(clientID, games[partyCode].players);

    // Evetything is good, start the game
    assignRoles(partyCode);

    // Tell players game started
    let payLoad = {
        "method": "gamestart",
        "gameStarted": true
    }

    broadcastToAllPlayers(partyCode, payLoad);
    
    // Start Game Loop
    gameLoop(partyCode)
}

// Reset votes
function resetVotes(gameID) {
    const game = games[gameID];
    let mostVoted = ''
    let mostVotedIndex = 0;
    let mostVotes = 0;

    for (let i=0; i<game.players.length; i++){
        // Check if more than most
        if (game.players[i].votes === mostVotes) {
            mostVoted = '';
        }
        else if(game.players[i].votes > mostVotes) {
            mostVoted = game.players[i].username,
            mostVotedIndex = i;
            mostVotes = game.players[i].votes
        }

        // Reset votes for player
        games[gameID].players[i].votes = 0;
        games[gameID].players[i].votedFor = '';
    }

    // Reset votes for client
    let payLoad = {
        method: 'resetvotes'
    }

    broadcastToAllPlayers(gameID, payLoad);

    return [mostVoted, mostVotedIndex];
}

// New Phase
const phases = {
    intro: {
        time: 1,
        updatePlayers: true
    },
    night: {
        time: 10,
        updatePlayers: true
    },
    discussion: {
        time: 2,
        updatePlayers: true
    },
    voting: {
        time: 5,
        updatePlayers: false
    },
    defense: {
        time: 5,
        updatePlayers: false
    },
    defenseVote: {
        time: 5,
        updatePlayers: false
    },
    cooldown: {
        time: 5,
        updatePlayers: true
    }
}

function broadcastGameState(gameID) {
    const game = games[gameID]

    let payLoad = {
        "method": "gamestate",
        "phase": game.phase,
        "day": game.day
    }

    broadcastToAllPlayers(gameID, payLoad);

    // Send new player lists
    if(phases[game.phase].updatePlayers) {
        updateAllPlayerLists(gameID)
    }
}

function broadcastTimer(gameID) {
    const game = games[gameID];
    let payLoad = {
        "method": "timer",
        "timer": game.countdown
    }
    broadcastToAllPlayers(gameID, payLoad);
}

function phaseCountdown(gameID, _callback) {
    // Get info
    const game = games[gameID]
    const phase = game.phase;

    // Send out current info
    broadcastGameState(gameID);
    
    // Set up timer
    let timer = phases[phase].time
    games[gameID].countdown = timer;
    broadcastTimer(gameID);

    let refresh = setInterval(() => {
        timer -= 1;
        games[gameID].countdown = timer;
        if(timer < 0) {
            clearInterval(refresh);
            _callback();
        } else {
            broadcastTimer(gameID);
        }
    }, 1000);
}

function updateAllPlayerLists(gameID) {
    const game = games[gameID];
    const players = game.players;
    for(const player of players){
        let clientID = player.clientID;
        sendPlayerList(gameID, clientID, (player.team==="demon"), false)
    }
}

// Check for win
function checkWin(gameID){
    const game = games[gameID];
    updateAllPlayerLists(gameID);

    // Count demons and villagers alive
    let demonCount = 0;
    let villagerCount = 0;

    let demonList = [];
    let villagerList = [];

    for(player of game.players) {
        if(player.team === 'demon') {
            demonList.push(player.username);
            if(!player.isDead) demonCount += 1;
        } else if(player.team === 'villager') {
            villagerList.push(player.username);
            if(!player.isDead) villagerCount += 1
        }
    }

    // Check if someone won
    let winningTeam = '';
    let winningPlayers = '';
    if(demonCount >= villagerCount) {
        winningTeam = 'Demons';
        winningPlayers = demonList.join(', ')
    } else if(demonCount == 0) {
        winningTeam = 'Villagers';
        winningPlayers = villagerList.join(', ')
    }

    if(winningTeam !== '') {
        games[gameID].result = {
            gameOver: true,
            teamWinners: winningTeam,
            playerWinners: winningPlayers
        }
    }
}

// Broadcast win
function broadcastWin(gameID) {
    const game = games[gameID];
    let payLoad = {
        method: 'gameover',
        teamWinners: game.result.teamWinners,
        playerWinners: game.result.playerWinners
    }

    broadcastToAllPlayers(gameID, payLoad);
}

// Main game loop
function gameLoop(gameID) {
    // Start the game
    games[gameID].inProgress = true;

    // Intro phase
    games[gameID].phase = 'intro';
    phaseCountdown(gameID, function() {

        // Game Loop
        recursiveGameLoop(gameID);
    })
}

function recursiveGameLoop(gameID) {
    // Night phase
    games[gameID].phase = 'night';
    games[gameID].day += 1;

    resetVotes(gameID);

    phaseCountdown(gameID, function() {
        // Discussion
        games[gameID].phase = 'discussion';

        nightEvents(gameID);
        checkWin(gameID);
        resetVotes(gameID);
        
        if(games[gameID].result.gameOver) {
            // Broadcast winner
            broadcastWin(gameID)

            // New game button

        } else {
            phaseCountdown(gameID, function() {
                // Voting
                games[gameID].phase = 'voting';

                phaseCountdown(gameID, function() {
                    let [defendant, defendantIndex] = resetVotes(gameID)
                    if(defendant !== '') {
                        // Defense
                        games[gameID].phase = 'defense';
                        games[gameID].defenseVotes.yes = 0;
                        games[gameID].defenseVotes.no = 0;
                        resetVotes(gameID);

                        // Send the defendant to players
                        let payLoad = {
                            method: 'defendant',
                            username: defendant
                        }
                        broadcastToAllPlayers(gameID, payLoad);

                        phaseCountdown(gameID, function() {
                            // Defense Vote
                            games[gameID].phase = 'defenseVote';
                            resetVotes(gameID);
                            phaseCountdown(gameID, function() {
                                defenseOutcome(gameID, defendantIndex);
                                checkWin(gameID)

                                if(games[gameID].result.gameOver) {
                                    // Broadcast winner
                                    broadcastWin(gameID)

                                } else {
                                    // Time before night
                                    games[gameID].phase = 'cooldown';
                                    phaseCountdown(gameID, function() {
                                        if(gameClosed(gameID)) return;
                                        recursiveGameLoop(gameID);
                                    })
                                }
                            })
                        })
                    }
                    else {
                        if(gameClosed(gameID)) return;
                        recursiveGameLoop(gameID);
                    }
                })
            })
        } 
    })
}

// Demon Chat Message
function demonChatMessage(result) {
    // Get data
    const gameID = result.gameID;
    const username = result.username;
    const message = result.message;

    // Check if game exists
    if(!(gameID in games)) return;
    const game = games[gameID];

    // Save message to messages
    let newMessage = {
        username: username,
        message: message
    }
    game.demonChat.push(newMessage)

    // Send message to all demons
    let payLoad = {
        method: 'demonchatmsg',
        data: newMessage
    }
    broadcastToAllDemons(gameID, payLoad);
}

// Vote
function vote(result){
    // Get data
    const gameID = result.gameID;
    const clientID = result.clientID;
    const voteTarget = result.voteTarget;

    // Find who you voted for, and the vote target
    let clientIndex;
    let targetIndex;

    const game = games[gameID];
    for(let i=0; i<game.players.length; i++) {
        let player = game.players[i]
        if(player.clientID === clientID) {
            clientIndex = i;
        } else if(player.username === voteTarget) {
            targetIndex = i;
        }
    }

    // Check if client already voted for someone
    let votedPrev = game.players[clientIndex].votedFor;
    if(votedPrev !== '') {
        // Find the person they voted for and remove their vote
        for(let i=0; i<game.players.length; i++) {
            let player = game.players[i]
            if(player.username === votedPrev) {
                games[gameID].players[i].votes -= 1;
            }
        }
    }

    // Add vote to new target
    games[gameID].players[clientIndex].votedFor = voteTarget;
    games[gameID].players[targetIndex].votes += 1;

    // Update players
    updateAllPlayerLists(gameID)
}

// Defense Vote
function defenseVote(result) {
    // Get data
    const gameID = result.gameID;
    const clientID = result.clientID;
    const voteType = result.voteType;

    // Check if already voted
    
    const game = games[gameID];
    let alreadyVoted = false;
    let playerIndex;
    for(let i=0; i<game.players.length; i++) {
        let player = game.players[i]
        if(player.clientID === clientID) {
            playerIndex = i;
            // Check if they made the same vote
            if(player.votedFor === voteType) return; 
            
            else if (player.votedFor !== '') {
                alreadyVoted = true;
            } 
            break;
        }
    }

    // Subtract vote
    if(alreadyVoted) {
        if(voteType === 'yes') {
            games[gameID].defenseVotes.no -= 1;
        } else {
            games[gameID].defenseVotes.yes -= 1;
        }
        
    }

    games[gameID].defenseVotes[voteType] += 1;
    games[gameID].players[playerIndex].votedFor = voteType;
}

// Check if plaayer is voted off
function defenseOutcome(gameID, defendantIndex) {
    const game = games[gameID];
    let payLoad;
    let isDead;
    if(game.defenseVotes.yes > game.defenseVotes.no) {
        // Kill the defendant
        games[gameID].players[defendantIndex].isDead = true;

        // Data
        isDead = true;
    } else {
        isDead = false;
    }

    payLoad = {
        method: "defenseoutcome",
        isDead: isDead,
        yesVotes: game.defenseVotes.yes,
        noVotes: game.defenseVotes.no
    }

    broadcastToAllPlayers(gameID, payLoad);
}

// Handle night events
function nightEvents(gameID) {
    const game = games[gameID];

    let players = {}
    let dead = [];
    let doctor = [];
    let information = [];

    let demons = [];
    let demonVotes = {};

    for(let i=0; i<game.players.length; i++) {
        let player = game.players[i];
        players[player.username] = i;

        if(player.votedFor === undefined) continue;

        // Psychic
        if(player.role === 'Psychic') {
            let target = player.votedFor;
            information.push({
                logger: player.clientID,
                infoType: 'psychic',
                target: target
            })
        }
        // Demon
        if(player.role === 'Demon') {
            let target = player.votedFor;
            demons.push(i);
            if(!(target in demonVotes)) {
                demonVotes[target] = 0
            }
            if(target !== '') {
                demonVotes[target] += 1
            }
        }

        // Doctor
        if(player.role === 'Doctor') {
            let target = player.votedFor;
            if(target !== '') doctor = [target, player.clientID];
            else {
                doctor = ['', player.clientID];
            }
        }
    }

    // Determine who the demons voted for
    let demonTarget = '';
    let maxVotes = 0;
    for(const [key, value] of Object.entries(demonVotes)) {
        if(value > maxVotes) {
            maxVotes = value;
            demonTarget = key;
        }
    }

    // Check if the target was saved
    let targetSaved = false;
    if(doctor[0] === demonTarget) {
        targetSaved = true;
    } else if(demonTarget !== '') {
        // Kill the target
        let targetIndex = players[demonTarget];
        games[gameID].players[targetIndex].isDead = true;

        // Send the data to the victim
        let clientID = game.players[targetIndex].clientID
        let con = clients[clientID].connection

        let payLoad = {
            method: 'death',
            isDead: true,
        }

        con.send(JSON.stringify(payLoad))
    }

    if(demonTarget !== '') {
        let targetIndex = players[demonTarget];
        information.push({
            logger: game.players[targetIndex].clientID,
            infoType: 'attacked',
            attacker: 'Demon',
            saved: targetSaved
        })    
    }
    
    if(doctor[0] !== '') {
        information.push({
            logger: doctor[1],
            infoType: 'doctor',
            target: doctor[0],
            targetSaved: targetSaved
        })
    } else {
        information.push({
            logger: doctor[1],
            infoType: 'doctor',
            target: '',
            targetSaved: targetSaved
        })
    }

    // Information
    for(d of demons) {
        information.push({
            logger: game.players[d].clientID,
            infoType: 'demon',
            target: demonTarget,
            targetSaved: targetSaved
        })
    }

    if(demonTarget !== '' && !targetSaved){
        information.push({
            logger: '',
            infoType: 'demonAttack',
            target: demonTarget,
            targetSaved: targetSaved
        })
    }

    // Send information data
    for(info of information) {
        let log;
        // Psychic
        if(info.infoType == 'psychic') {
            const target = info.target;
            if(target === ''){
                log = 'You did not use your ability!'
            } else {
                let targetIndex = players[target];
                log = target + ' is '
                if(game.players[targetIndex].team === 'demon') {
                    log += 'a Demon!';
                } else {
                    log += 'not a Demon!'
                }
            }
        }

        // Demon
        else if(info.infoType == 'demon') {
            const target = info.target;
            if(target === ''){
                log = 'You did not kill anyone!'
            } else {
                log = 'You attacked ' + target + ' '
                if(info.targetSaved) {
                    log += 'and they were saved!'
                } else {
                    log += 'and they were killed!'
                }
            }
        }

        else if(info.infoType == 'demonAttack') {
            log = info.target + " was killed by a Demon!"
        }

        // Doctor
        else if(info.infoType == 'doctor') {
            const target = info.target;
            if(target === ''){
                log = 'You did not heal anyone!'
            } else {
                let targetIndex = players[target];
                if(game.players[targetIndex].clientID === info.logger) {
                    log = 'You healed yourself ';
                    if(info.targetSaved) {
                        log += 'and were saved!'
                    } else {
                        log += 'and nobody attacked you!'
                    }
                } else {
                    log = 'You healed ' + target + ' '
                    if(info.targetSaved) {
                        log += 'and they were saved!'
                    } else {
                        log += 'and nobody attacked them!'
                    }
                }
            }
        }

        // Attacked
        else if(info.infoType == 'attacked') {
            log = 'You were attacked '
            if(info.saved) {
                log += 'and were saved!'
            } else {
                log += 'by a ' + info.attacker + ' and were killed!'
            }
        }

        let payLoad = {
            method: 'log',
            log: log,
            logType: info.infoType
        }

        if(info.logger !== '') {
            sendToPlayer(info.logger, payLoad);
        } else {
            broadcastToAllPlayers(gameID, payLoad);
        }
    }
}

// Demon choose target
function chooseTarget(result) {
    const gameID = result.gameID;
    const game = games[gameID];
    const clientID = result.clientID;
    const targetName = result.voteTarget;

    // Find the demon
    let playerIndex;
    for(let i=0; i<game.players.length; i++) {
        let player = game.players[i]
        if(player.clientID === clientID) {
            playerIndex = i;
            break;
        }
    }

    // Set voted for
    games[gameID].players[playerIndex].votedFor = targetName;
}

// Inactive Game
function gameClosed(gameID) {
    // Get clients from the game and check if they are disconnected
    let allClients = []
    let isDisconnected = false;

    for(player of games[gameID].players) {
        let clientID = player.clientID;
        allClients.push(clientID);

        if(clients[clientID].connection.readyState == WebSocket.CLOSED) {
            isDisconnected = true;
        }
    }

    // Removes disconnected clients
    if(isDisconnected) {
        for (clientID of allClients) {
            delete clients[clientID]
        }

        // Remove the game
        delete games[gameID]
    }

    return isDisconnected;
}
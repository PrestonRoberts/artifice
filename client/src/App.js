import React, { Component} from "react";
import './App.css';
import Home from "./home";
import Game from "./game";

class App extends Component {
    constructor() {
        super();
        this.state = {
            page: 'home',
            ws: '',
            joinError: '',
            isHost: false,
            gameStarted: false,
            clientID: '',
            partyCode: '',
            username: '',
            allPlayers: [],
            votedFor: '',
            defendant: '',
            defenseOutcome: {
                isDead: false,
                yesVotes: 0,
                noVotes: 0
            },
            demonChatMsgs: [],
            playerInfo: {
                isDead: false,
                role: '',
                roleDescription: '',
                team: ''
            },
            logs: [],
            phase: '',
            day: 0,
            timer: 0,
            gameOver: false,
            teamWinners: '',
            playerWinners: '',
            usedSelf: false
        }

        this.startGame = this.startGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
    }

    roleTarget(method, target) {
        this.setState({
            votedFor: target
        })

        let payLoad = {
            method: method,
            gameID: this.state.partyCode,
            clientID: this.state.clientID,
            voteTarget: target
        }

        this.state.ws.send(JSON.stringify(payLoad));
    }

    defenseVote(voteType) {
        this.setState({
            votedFor: voteType
        })

        let payLoad = {
            method: 'defensevote',
            gameID: this.state.partyCode,
            clientID: this.state.clientID,
            voteType: voteType
        }

        this.state.ws.send(JSON.stringify(payLoad));
    }

    vote(voteTarget) {
        this.setState({
            votedFor: voteTarget
        })

        let payLoad = {
            method: 'vote',
            gameID: this.state.partyCode,
            clientID: this.state.clientID,
            voteTarget: voteTarget
        }

        this.state.ws.send(JSON.stringify(payLoad));
    }

    demonChatMessage(message) {
        let payLoad = {
            method: 'demonchat',
            username: this.state.username,
            gameID: this.state.partyCode,
            message: message
        }

        this.state.ws.send(JSON.stringify(payLoad));
    }

    startGame() {
        let payLoad = {
            method: 'start',
            partyCode: this.state.partyCode,
            isHost: this.state.isHost,
            clientID: this.state.clientID,
        }

        this.state.ws.send(JSON.stringify(payLoad));
    }

    joinGame(err, isHost, username, partyCode) {
        partyCode = partyCode.trim();
        if(err.type === 'join') {
            this.setState({
                joinError: err.msg
            })
            return
        }
        let ws = new WebSocket("ws://localhost:8000");

        this.setState({
            ws: ws
        })

        ws.onmessage = message => {
            const response = JSON.parse(message.data);

            // Connected to server
            if(response.method === "connect") {
                // Save generated client ID
                this.setState({
                    clientID: response.clientID
                })

                // Send the room connection request to the server
                let payLoad;
                if(isHost) {
                    // Host Party
                    payLoad = {
                        method: 'host',
                        clientID: response.clientID,
                        username: username
                    }
                } else {
                    // Join Party
                    payLoad = {
                        method: 'join',
                        clientID: response.clientID,
                        partyCode: partyCode,
                        username: username
                    }
                }
                ws.send(JSON.stringify(payLoad));
            }

            // Joined Game Party
            else if(response.method === "partyConnect") {
                // Update State
                this.setState({
                    page: 'game',
                    partyCode: response.partyCode,
                    username: username,
                    allPlayers: response.players,
                    isHost: response.isHost
                })
            }

            // Party Join Error
            else if(response.method === "partyJoinError") {
                this.setState({
                    joinError: response.errorMsg
                })
            }

            // Update player list
            else if(response.method === "updatePlayerList") {
                this.setState({
                    allPlayers: response.players
                })
            }

            // Game started
            else if(response.method === "gamestart") {
                this.setState({
                    gameStarted: response.gameStarted,
                    demonChatMsgs: []
                })
            }

            // Role assigned
            else if(response.method === "role") {
                this.setState({
                    playerInfo: {
                        isDead: false,
                        role: response.role,
                        roleDescription: response.roleDescription,
                        team: response.team
                    },
                    votedFor: '',
                    defendant: '',
                    defenseOutcome: {
                        isDead: false,
                        yesVotes: 0,
                        noVotes: 0
                    },
                    demonChatMsgs: [],
                    logs: [],
                    phase: '',
                    day: 0,
                    timer: 0,
                    gameOver: false,
                    teamWinners: '',
                    playerWinners: '',
                    usedSelf: false
                })
            }

            else if(response.method === "gamestate") {
                this.setState({
                    phase: response.phase,
                    day: response.day
                })

                if(this.state.phase === "discussion") {
                    this.setState({
                        defendant: '',
                        votedFor: ''
                    })
                }
            }

            else if(response.method === "timer") {
                this.setState({
                    timer: response.timer
                })
            }

            else if(response.method === "demonchatmsg") {
                let newArray = this.state.demonChatMsgs.concat([response.data])
                this.setState({
                    demonChatMsgs: newArray
                })
            }

            else if(response.method === "defendant") {
                this.setState({
                    defendant: response.username
                })
            }

            else if(response.method === "defenseoutcome") {
                this.setState({
                    defenseOutcome: {
                        isDead: response.isDead,
                        yesVotes: response.yesVotes,
                        noVotes: response.noVotes
                    }
                })
            }

            else if(response.method === "log") {
                let logMsg = response.log;
                let type = response.logType;
                let newArray = this.state.logs.concat([{
                    msg: logMsg,
                    type: type,
                    time: 'Day ' +this.state.day,
                }])
                this.setState({
                    logs: newArray
                })

                // doctor self heal
                if(this.state.playerInfo.role === 'Doctor' && type === 'doctor' && this.state.votedFor === username){
                    this.setState({
                        usedSelf: true
                    })
                }
            }

            else if(response.method === "death") {
                let newPlayerInfo = this.state.playerInfo;
                newPlayerInfo.isDead = response.isDead;
                this.setState({
                    playerInfo: newPlayerInfo
                })
            }

            else if(response.method === "gameover") {
                let newPlayerInfo = this.state.playerInfo;
                newPlayerInfo.isDead = response.isDead;
                this.setState({
                    gameOver: true,
                    teamWinners: response.teamWinners,
                    playerWinners: response.playerWinners
                })
            }

            else if(response.method === "resetvotes") {
                this.setState({
                    votedFor: ''
                })
            }
            
        }
    }

    render() { 
        let content;
        if(this.state.page === 'home') {
            content = <Home 
                        joinGame={(err, isHost, partyCode, username) => this.joinGame(err, isHost, partyCode, username)} 
                        joinErrMsg={this.state.joinError}
                    />
        } else if(this.state.page === 'game') {
            content = <Game 
                        partyCode={this.state.partyCode}
                        username={this.state.username}
                        playerInfo={this.state.playerInfo}
                        players={this.state.allPlayers}
                        isHost={this.state.isHost}
                        gameStarted={this.state.gameStarted}
                        startGame={this.startGame}
                        phase={this.state.phase}
                        day={this.state.day}
                        timer={this.state.timer}
                        defendant={this.state.defendant}
                        demonChatMsgs={this.state.demonChatMsgs}
                        demonChatMessage={(message) => this.demonChatMessage(message)}
                        logs={this.state.logs}
                        vote={(voteTarget) => this.vote(voteTarget)}
                        defenseVote={(voteType) => this.defenseVote(voteType)}
                        defenseOutcome={this.state.defenseOutcome}
                        roleTarget={(method, target) => this.roleTarget(method, target)}
                        usedSelf={this.state.usedSelf}
                        gameOver={this.state.gameOver}
                        teamWinners={this.state.teamWinners}
                        playerWinners={this.state.playerWinners}
                        votedFor={this.state.votedFor}
                    />
        }

        return (
            <div>
                {content}
            </div>
        );
    }
}
 
export default App;
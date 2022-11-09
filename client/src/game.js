import React, { Component } from 'react';
import Players from './components/players';
import RoleInfo from './components/roleInfo';
import PhaseInfo from './components/phaseInfo';
import Notes from './components/notes';
import DemonChat from './components/demonChat';
import DefenseVote from './components/defenseVote';
import Logs from './components/logs';
import Winners from './components/winners';

class Game extends Component {
    constructor() {
        super();
        this.state = {
            active: '',
            infoHeight: 0,
            notes: 'hidden',
            notesHeight: 0,
            logs: 'hidden',
            logsHeight: 0,
            demonChat: 'hidden',
            demonChatHeight: 0,
        }

        this.closeAll = this.closeAll.bind(this);
        this.openNotes = this.openNotes.bind(this);
        this.openLogs = this.openLogs.bind(this);
        this.openDemonChat = this.openDemonChat.bind(this);
    }
    
    closeAll() {
        if(!this.props.gameStarted) return;
        this.setState ({
            active: '',
            infoHeight: 0,
            notes: 'hidden',
            notesHeight: 0,
            logs: 'hidden',
            logsHeight: 0,
            demonChat: 'hidden',
            demonChatHeight: 0,
        })
    }

    openNotes() {
        if(!this.props.gameStarted) return;
        this.closeAll();

        if(this.state.active === 'Notes') return;
        this.setState ({
            active: 'Notes',
            infoHeight: '50vh',
            notes: 'visible',
            notesHeight: '100%',
        })
    }
    
    openLogs() {
        if(!this.props.gameStarted) return;
        this.closeAll();

        if(this.state.active === 'Logs') return;
        this.setState ({
            active: 'Logs',
            infoHeight: '50vh',
            logs: 'visible',
            logsHeight: '100%',
        })
    }
    
    openDemonChat() {
        if(!this.props.gameStarted) return;
        this.closeAll();

        if(this.state.active === 'Demon Chat') return;
        this.setState ({
            active: 'Demon Chat',
            infoHeight: '50vh',
            demonChat: 'visible',
            demonChatHeight: '100%',
        })
    }

    render() {
        return (
            <div>
                <div className='header'>
                    <h1>{this.props.username}</h1>
                </div>
                
                <RoleInfo 
                    playerInfo={this.props.playerInfo}
                    gameStarted={this.props.gameStarted}
                    partyCode={this.props.partyCode}
                />
                
                <PhaseInfo
                    phase={this.props.phase}
                    day={this.props.day}
                    timer={this.props.timer}
                    gameStarted={this.props.gameStarted}
                    defendant={this.props.defendant}
                    defenseOutcome={this.props.defenseOutcome}
                    gameOver={this.props.gameOver}
                    players={this.props.players}
                    startGame={this.props.startGame}
                    isHost={this.props.isHost}
                />
                { this.props.gameStarted === true ?
                <div className='info-header'>
                    {this.state.active !== '' ? <button className='x-button' onClick={this.closeAll}>X</button> : ''}
                    <span>{this.state.active}</span>
                    <button className="info-option" onClick={this.openNotes}>Notes</button>
                    <button className="info-option" onClick={this.openLogs}>Logs</button>
                    {this.props.gameStarted && this.props.playerInfo.team === 'demon' ? 
                        <button className="info-option" onClick={this.openDemonChat}>Demon Chat</button> : ''
                    }
                </div> : ''
                }

                <div id='info' className='info' style={{height: this.state.infoHeight}}>
                    {this.props.gameStarted ? <Notes visible={this.state.notes} height={this.state.notesHeight}/> : ''}
                    
                    <Logs 
                        logs={this.props.logs} 
                        visible={this.state.logs} 
                        height={this.state.logsHeight}
                    />

                    {this.props.gameStarted && this.props.playerInfo.team === 'demon' ? 
                        <DemonChat 
                            demonChatMsgs={this.props.demonChatMsgs} 
                            demonChatMessage={this.props.demonChatMessage} 
                            visible={this.state.demonChat}
                            height={this.state.demonChatHeight}
                            phase={this.props.phase}
                        /> : ''
                    }
                </div>

                {this.props.phase === 'defenseVote' && this.props.defendant !== this.props.username ? 
                    <DefenseVote 
                        defenseVote={this.props.defenseVote}
                        gameOver={this.props.gameOver}
                        defendant={this.props.defendant}
                        votedFor={this.props.votedFor}
                    /> : ''
                }

                {this.props.gameOver ?
                <Winners 
                    gameOver={this.props.gameOver}
                    teamWinners={this.props.teamWinners}
                    playerWinners={this.props.playerWinners}
                    startGame={this.props.startGame}
                    isHost={this.props.isHost}
                /> : ''
                }
                <Players
                    playerInfo={this.props.playerInfo}
                    allPlayers={this.props.players}
                    phase={this.props.phase}
                    vote={this.props.vote}
                    roleTarget={this.props.roleTarget}
                    usedSelf={this.props.usedSelf}
                    votedFor={this.props.votedFor}
                    gameOver={this.props.gameOver}
                />
            </div>
        );
    }
}
 
export default Game;
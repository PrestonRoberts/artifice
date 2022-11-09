import React from 'react';

function Winners(props) {
    let winningTeam = '';
    let winningPlayers = '';
    let newGame = '';
    if(props.gameOver) {
        winningTeam = props.teamWinners + ' Win!'
        winningPlayers = 'Winners: ' + props.playerWinners
        if(props.isHost) {
            newGame = <button className='new-game-button' onClick={props.startGame}>New Game</button>
        }
    }
    
    return (
        <div className='game-over'>
            <span className='team-winner'>{winningTeam}</span>
            <span className='player-winners'>{winningPlayers}</span>
            {newGame}
        </div>
    );
}

export default Winners;
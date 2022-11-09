import React from 'react';

function PhaseInfo(props) {

    let phase = '';
    let day = '';
    let timer = '';
    let startButton = '';

    if(!props.gameStarted && props.isHost && props.players.length >= 3) {
        startButton = <button className='start-button' onClick={props.startGame}>Start Game</button>
    } else if(!props.gameStarted && props.isHost) {
        startButton = <button className='start-button' onClick={props.startGame} disabled>Start Game</button>
    }

    if(props.gameStarted && !props.gameOver) {
        // Phase
        if(props.phase === 'defense') {
            phase=props.defendant + ", Defend Yourself!"
        } else if (props.phase === 'defenseVote') {
            phase = 'Vote to decicide ' + props.defendant + "'s fate."
        } else if (props.phase === 'cooldown') {
            if (props.defenseOutcome.isDead){
                phase = props.defendant + ' was voted off with a vote of '
            } else {
                phase = props.defendant + ' was not voted off with a vote of '
            }
            phase += props.defenseOutcome.yesVotes + ' - ' + props.defenseOutcome.noVotes
        }
        else {
            phase = props.phase
        }

        // Day
        if (phase === 'night'){
            day = "Night " + props.day;
        } else {
            day = "Day " + props.day;
        }

        // Timer
        timer = props.timer           
    }

    return (
        <div className='phase-header'>
            {startButton}
            <span className='current-day'>{day}</span>
            <span className='current-phase'>{phase}</span>
            <span className='current-timer'>{timer}</span>
        </div>
    );
}

export default PhaseInfo;
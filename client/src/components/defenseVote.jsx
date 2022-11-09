import React from 'react';

function DefenseVote(props) {
    let yesButton = '';
    let noButton = '';
    if(!props.gameOver){
        yesButton = <button className='defense-vote yes-button' onClick={() => props.defenseVote('yes')} >Yes</button>
        noButton = <button  className='defense-vote no-button' onClick={() => props.defenseVote('no')} >No</button>
    }
    return (
        <div className='defense'>
            <span className='defense-text'>{!props.gameOver ? 'Should ' + props.defendant + ' Die?' : ''}</span>
            {props.votedFor !== '' ?
            <span className='defense-subtext'>{!props.votedFor !== '' ? 'You voted ' + props.votedFor : ''}</span>
            : ''}
            {yesButton}
            {noButton}
        </div>
    );
}

export default DefenseVote;
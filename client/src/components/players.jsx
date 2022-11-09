import React from 'react';

function handleRoleTarget(_roleTarget, method, voteTarget) {
    _roleTarget(method, voteTarget); 
}

function handleVote(_vote, voteTarget) {
    _vote(voteTarget);
}

function playerStyle(props, player) {
    let classes = 'player'
    if(player.isDead) {
        classes += ' player-dead';
    } else if (player.team=== 'demon') {
        classes += ' player-demon';
    }

    if(props.votedFor === player.username) {
        classes += ' player-selected'
    }

    return classes
}

function playerCardStyle(props, player) {
    let classes ='player-card'
    if(props.votedFor === player.username) {
        classes += ' player-card-selected'
    } else if(player.isDead) {
        classes += ' player-card-dead'
    }
    return classes;
}

function getVoteButton(props, player) {
    if(!player.isDead && !props.playerInfo.isDead && !props.gameOver) {
        if(props.phase === 'voting' && !player.isSelf) {
            return <button 
                        className='action-button'
                        onClick={() => handleVote(props.vote, player.username)} 
                    > Vote
                    </button>;
        } else if(props.playerInfo.role === 'Psychic' && props.phase === 'night' && !player.isSelf) {
            return <button 
                        className='action-button'
                        onClick={() => handleRoleTarget(props.roleTarget, 'psychic', player.username)} 
                    > Soul Read
                    </button>;
        }

        else if(props.playerInfo.role === 'Demon' && props.phase === 'night' && !player.isSelf && player.team !== 'demon') {
            return <button 
                        className='action-button'
                        onClick={() => handleRoleTarget(props.roleTarget, 'demon', player.username)} 
                    > Kill
                    </button>;
        }

        else if(props.playerInfo.role === 'Doctor' && props.phase === 'night') {
            if(player.isSelf && props.usedSelf) return;
            return <button 
                        className='action-button'
                        onClick={() => handleRoleTarget(props.roleTarget, 'doctor', player.username)} 
                    > Heal
                    </button>;
        }
    }
}

function Players(props) {

    const allPlayers = props.allPlayers
    const playerList = allPlayers.map((player, i) =>
        <div key={i+1} className={playerCardStyle(props, player)}>
            <span className={playerStyle(props, player)}>{(i+1) + ". " + player.username}</span>
            {props.phase === 'voting' ? <span className='vote-count'>{player.votes} </span> : ''}
            {getVoteButton(props, player)}
        </div>
    );

    return (
        <div>
            {playerList}
        </div>
    );
}

export default Players;
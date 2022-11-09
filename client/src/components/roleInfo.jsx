import React from 'react';

function RoleInfo(props) {
    let playerInfo = props.playerInfo
    let role ='';
    let roleDescription = '';
    let code ='';

    if(!props.gameStarted) {
        code = <h2>Party Code: {props.partyCode}</h2>
    }

    if(playerInfo.role !== '') {
        role = <h1>{playerInfo.role}</h1>
    }
    
    return (
        <div className='role-header'>
            {code}
            {role}
            {roleDescription}
        </div>
    );
}

export default RoleInfo;
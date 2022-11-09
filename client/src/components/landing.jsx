import React from 'react';

function Landing(props) {
    return ( 
        <div>
            <button className='home-button' onClick={() => props.onClick('createParty')}>Create Party</button>
            <button className='home-button' onClick={() => props.onClick('joinParty')}>Join Party</button>
            <button className='home-button' onClick={() => props.onClick('tutorial')}>How to Play</button>
        </div>
    );
}

export default Landing;
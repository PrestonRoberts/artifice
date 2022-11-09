import React from 'react';

function Tutorial(props) {
    return (
        <div className='tutorial'>
            <h1 className='tutorial-header'>How to Play Artifice</h1>

            <div className='tutorial-section'>
                <h2>Teams</h2>
                <p>
                <b>Demons: </b>The goal of the Demons to kill every villager. The Villagers do not know who
                the Demons are, but the Demons know who each other are. The demons win when the number
                of demons alive is more than or equal to the number of villagers alive.
                </p>

                <p>
                <b>Villagers: </b>The goal of the Villagers is to find out who the Demons are and kill them.
                The Villagers win when there are no demons alive.
                </p>
            </div>

            <div className='tutorial-section'>
                <h2>Roles</h2>
                <p>
                <b>Demon: </b>At night the Demon can choose someone they want to kill. If they are not saved,
                they will die.
                </p>

                <p>
                <b>Doctor: </b>Doctors are part of the Villagers. At night the Doctor can choose someone they want to heal. The Doctor can only heal
                themselves once. If the person who they heal is attacked, they will not die.
                </p>

                <p>
                <b>Psychic: </b>Psychics are part of the Villagers. At night the Psychic can choose someone to read their soul. When the night is
                over, their power will tell them if the person they read is a Demon or not.
                </p>

                <p>
                <b>Villager: </b>A villager does not have any unique power. They will try their best to determine
                who is also a villager, and who is lying.
                </p>
            </div>
            

            <button className='back-button' onClick={props.backClick}>Back</button>
        </div>
    );
}

export default Tutorial;
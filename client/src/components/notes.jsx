import React from 'react';

function Notes(props) {
    return (
        <div id='notes' className='notes' style={{height: props.height}}>
            <textarea 
                id="notes" 
                name="notes"
                spellCheck="false" 
                style={{
                    visibility: props.visible, 
                    resize: 'none'
                }}/>
        </div>
    );
}

export default Notes;
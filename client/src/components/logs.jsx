import React from 'react';

function Logs(props) {
    const logs = props.logs;
    const allLogs = logs.map((log, i) =>
        <div key={i} className='log'>
            {log.time + ": " + log.msg}
        </div>
    );

    return (
        <div 
            id='logs' 
            className='logs' 
            style={{
                visibility: props.visible,
                height: props.height,
            }}>
            {allLogs}
        </div>
    );
}

export default Logs;
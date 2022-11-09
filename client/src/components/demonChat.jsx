import React, { Component } from 'react';

class DemonChat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chatInput: '',
            msgError: '',
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleChatMessage = this.handleChatMessage.bind(this);
    }

    componentDidMount() {
        const keyDownHandler = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleChatMessage(this.props.demonChatMessage)
            }
        };
      
            document.addEventListener('keydown', keyDownHandler);
      
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }

    handleChatMessage(_demonChatMessage) {
        let message = this.state.chatInput.trim();

        // check if message is empty
        if(message === '') return;

        _demonChatMessage(this.state.chatInput);
        this.setState({
            chatInput: ''
        })
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: target.value,
        });
    }

    render() {
        const chatMsgs = this.props.demonChatMsgs.map((data, i) =>
            <div key={i} className='demonChatMsg'>
                <span className='chatUser'>{data.username}: </span>{data.message}
            </div>
        );

        return (
            <div 
                className='demonChat' 
                style={{
                    visibility: this.props.visible,
                    height: this.props.height,
                }}>
                <div>
                    {chatMsgs}
                </div>
                <div className='demonChatSend'>
                    {this.props.phase === 'night' ? <input
                        type='text' 
                        name="chatInput"
                        value={this.state.chatInput} 
                        onChange={this.handleInputChange}
                        autoComplete="off"
                        className='demonChatInput'
                    /> : '' }
                    {this.props.phase === 'night' ? <button 
                                                        className='demonChatSubmit' 
                                                        id='demonMsg'
                                                        onClick={() => this.handleChatMessage(this.props.demonChatMessage)}>Send</button> : ''}
                </div>
            </div>
        );
    }
}

export default DemonChat;
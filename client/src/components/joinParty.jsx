import React from 'react';

class JoinParty extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            partyCode: '',
            username: '',
        }

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    errorMsgStyle = {
        margin: 0,
        color: 'red'
    }
    
    joinParty(_joinGame) {
        let inputName = this.state.username.trim();
        
        if(this.state.partyCode === '') {
            _joinGame({type: 'join', msg: 'party code is required'}, false, "", "");
            return;
        }

        if(inputName === '') {
            _joinGame({type: 'join', msg: 'username is required'}, false, "", "");
            return;
        }

        let letterNumber = /^[0-9a-zA-Z\s]+$/;
        if(!(inputName.match(letterNumber))) {
            _joinGame({type: 'join', msg: 'username can only be letters and numbers'}, false, "", "");
            return;
        }

        if(inputName.length > 15) {
            _joinGame({type: 'join', msg: 'username must be less than 15 characters'}, false, "", "");
            return;
        }

        let isHost = false;
        _joinGame({type: 'none'}, isHost, inputName, this.state.partyCode);
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: target.value,
        });
    }

    render() {
        let inputError = '';
        if (this.props.joinErrorMsg !== '') {
            inputError = <p className='error-text'>{this.props.joinErrMsg}</p>
        }

        return (
            <div className='party-section'>
                <label className='party-label'>
                    Party Code:
                    <input 
                        type="text" 
                        name="partyCode" 
                        value={this.state.partyCode} 
                        onChange={this.handleInputChange}
                        autoComplete="off"
                        className='party-input'
                    />
                </label>

                <label className='party-label'>
                    Name:
                    <input 
                        type="text" 
                        name="username" 
                        value={this.state.username} 
                        onChange={this.handleInputChange}
                        autoComplete="off"
                        className='party-input'
                    />
                </label>

                {inputError}

                <button className='party-button' onClick={() => this.joinParty(this.props.joinGame)}>Join Party</button>

                <button className='back-button' onClick={this.props.backClick}>Back</button>
            </div>
        );
    }
}

export default JoinParty;
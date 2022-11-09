import React from 'react';

class CreateParty extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            errorMsg: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    errorMsgStyle = {
        margin: 0,
        color: 'red'
    }

    createParty(_joinGame) {
        let inputName = this.state.username.trim();
        if(inputName === '') {
            this.setState({errorMsg: "username is required"});
            return;
        }

        let letterNumber = /^[0-9a-zA-Z]+$/;
        if(!(inputName.match(letterNumber))) {
            this.setState({errorMsg: "username can only be letters and numbers"});
            return;
        }

        if(inputName.length > 15) {
            this.setState({errorMsg: "username must be less than 15 characters"});
            return;
        }
        
        let isHost = true;
        _joinGame({type: 'none'}, isHost, inputName, '');
    }

    handleInputChange(event) {
        this.setState({
            username: event.target.value,
            errorMsg: ''
        });
    }

    render() {
        let inputError = '';
        if (this.state.errorMsg !== '') {
            inputError = <p className='error-text'>{this.state.errorMsg}</p>
        }
        return (
            <div className='party-section'>
                <label className='party-label'>
                    Name
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

                <button className='party-button' onClick={() => this.createParty(this.props.joinGame)}>Create Party</button> 

                <button className='back-button' onClick={this.props.backClick}>Back</button>
            </div>
        );
    }
}

export default CreateParty;
import React, { Component } from 'react';
import Landing from './components/landing';
import CreateParty from './components/createParty';
import JoinParty from './components/joinParty';
import Tutorial from './components/tutorial';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            page: 'landing'
        }
    }

    handleLandingOptions(newPage) {
        this.setState({
            page: newPage
        })
    }

    render() { 
        let content;
        if(this.state.page === 'landing') {
            content = <Landing onClick={(newPage) => this.handleLandingOptions(newPage)} />
        } else if(this.state.page === 'createParty'){
            content = <CreateParty 
                        backClick={() => this.handleLandingOptions('landing')} 
                        joinGame={this.props.joinGame} 
                    />
        } else if(this.state.page === 'joinParty'){
            content = <JoinParty 
                        backClick={() => this.handleLandingOptions('landing')} 
                        joinGame={this.props.joinGame}
                        joinErrMsg={this.props.joinErrMsg}
                    />
        } else if(this.state.page === 'tutorial'){
            content = <Tutorial backClick={() => this.handleLandingOptions('landing')} />
        }

        return (
            <div>
                <div className='header'>
                    <h1>Artifice</h1>
                </div>
                {content}
            </div>
        );
    }
}
 
export default Home;
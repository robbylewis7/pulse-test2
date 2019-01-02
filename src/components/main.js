import React from 'react';

import Teams from './teams';
import AddTeam from './add-team';

import './main.css';

export default class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            teams: []
        };
    }



    componentDidMount(){
        await fetch('http://localhost:8080/teams', {
            method: 'GET',
            body: JSON.stringify(teams),
            headers: {
                'content-type': 'application/json'
              }
        })
        .then(res => {
            if (!res.ok) { return Promise.reject(res.statusText); }
            return res.json()
        })
        .then(data => {
            console.log(data);
        })
    }

    addTeam(team) {
        this.setState({
            teams: [...this.state.teams, {team}]
        });
        console.log('Teams',team)
        await fetch('http://localhost:8080/teams',{
            method: "POST",
            body: JSON.stringify({
                team: team,
                user: 'Rob'
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(res => {
            if (!res.ok) { return Promise.reject(res.statusText); }
            return res.json()
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.log(error);
        });
    }

    render() {
        const teams = this.state.teams.map((team, index) => (
            <li className="list-wrapper" key={index}>
                <Teams {...team} />
            </li>
        ));

        return (
            <div className="board">
                <h2>{this.props.title}</h2>
                <ul className="lists">
                    {teams}
                    <li className="add-list-wrapper">
                        <AddTeam
                            type="team"
                            onAdd={team => this.addTeam(team)}
                        />
                    </li>
                </ul>
            </div>
        );
    }
}

Teams.defaultProps = {
    title: 'Pulse'
};

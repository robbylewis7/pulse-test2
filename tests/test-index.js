const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);


describe('Teams', function() {

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should list Teams on GET', function() {
        return chai.request(app)
            .get('/logs/user/:user')
            .then(res => {

            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.an('object');
        });
    });

    it('should add a logs on POST', function() {
        const newTeam = {
            team: ['test', 'test2']
        };
        return chai.request(app)
            .post('/teams')
            .send(newTeam)
            .then(function(res) {
            res.should.have.status(401);
            res.body.should.be.an('object');
        });
    });

    it('should update logs on PUT', function() {

        const updateData = {
            team: ['test', 'test3']
        };

        return chai.request(app)
            .get('/teams')
            .then(function(res) {
            return chai.request(app)
                .put('/teams/:user')
                .send(updateData)
        })
            .then(function(res) {
            res.should.have.status(400);
        });
    });

});
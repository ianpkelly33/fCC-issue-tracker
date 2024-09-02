const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const ObjectId = require('mongoose').Types.ObjectId;

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let createdIssueId;

    suite('POST /api/issues/{projectname}', function() {
        test('Create an issue with every field', function(done) {
            chai.request(server)
                .post('/api/issues/{projectname}')
                .send({
                    issue_title: 'Issue with every field',
                    issue_text: 'Text for issue with every field',
                    created_by: 'Ian',
                    assigned_to: 'Gordeau',
                    status_text: 'in progress'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, '_id');
                    createdIssueId = res.body._id;
                    done();
                });
        });

        test('Create an issue with only required fields', function(done) {
            chai.request(server)
                .post('/api/issues/{projectname}')
                .send({
                    issue_title: 'Issue with only required fields',
                    issue_text: 'Text for issue with only required fields',
                    created_by: 'Ian'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        test('Create an issue with missing required fields', function(done) {
            chai.request(server)
                .post('/api/issues/{projectname}')
                .send({
                    issue_title: 'Missing fields'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    suite('GET /api/issues/{projectname}', function() {
        test('View issues on a project', function(done) {
            chai.request(server)
                .get('/api/issues/{projectname}')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });

        test('View issues on a project with one filter', function(done) {
            chai.request(server)
                .get('/api/issues/{projectname}?created_by=Ian')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });

        test('View issues on a project with multiple filters', function(done) {
            chai.request(server)
                .get('/api/issues/{projectname}?created_by=Ian&assigned_to=Gordeau')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });
    });

    suite('PUT /api/issues/{projectname}', function() {
        test('Update one field on an issue', function(done) {
            chai.request(server)
                .put('/api/issues/{projectname}')
                .send({
                    _id: createdIssueId,
                    issue_text: 'Updated text'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    done();
                });
        });

        test('Update multiple fields on an issue', function(done) {
            chai.request(server)
                .put('/api/issues/{projectname}')
                .send({
                    _id: createdIssueId,
                    issue_title: 'Updated title',
                    issue_text: 'Updated text again'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    done();
                });
        });

        test('Update an issue with missing _id', function(done) {
            chai.request(server)
                .put('/api/issues/{projectname}')
                .send({
                    issue_text: 'Missing ID'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        test('Update an issue with no fields to update', function(done) {
            chai.request(server)
                .put('/api/issues/{projectname}')
                .send({
                    _id: createdIssueId,
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        test('Update an issue with an invalid _id', function(done) {
            chai.request(server)
                .put('/api/issues/{projectname}')
                .send({
                    _id: 'invalidId',
                    issue_title: 'Invalid ID update'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    suite('DELETE /api/issues/{projectname}', function () {
        test('Delete an issue', function(done) {
            chai.request(server)
                .delete('/api/issues/{projectname}')
                .send({
                    _id: createdIssueId
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully deleted');
                    done();
                });
        });

        test('Delete an issue with an invalid _id', function(done) {
            chai.request(server)
                .delete('/api/issues/{projectname}')
                .send({
                    _id: 'invalidId'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        test('Delete an issue with missing _id', function(done) {
            chai.request(server)
                .delete('/api/issues/{projectname}')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });
});

/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testId;
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          testId = res.body._id;
          assert.equal(res.status, 201);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, 'In QA');          
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title 2',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in'
          }).end(function(err, res) {
            assert.equal(res.status, 201);
            assert.equal(res.body.issue_title, 'Title 2');
            assert.equal(res.body.issue_text, 'text');
            assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            done();
          });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
            .send({
              issue_title: 'Title 3'
            })
            .end( (err, res) => {
              assert.equal(res.status, 400);
              assert.equal(res.text, 'missing inputs');
              done();
            });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({_id: testId})
          .end( (err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'no updated field sent');
            done();
          });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({_id: testId, issue_text: 'updated issue text'})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'successfully updated');
            done();
          });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({_id: testId, issue_title: 'updated issue title', issue_text: 'updated issue text AGAIN'})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'successfully updated');
            done();
          });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({status_text: ''})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach( issue => {
              assert.equal(issue.status_text, '');
              assert.property(issue, 'issue_title');
              assert.property(issue, 'issue_text');
              assert.property(issue, 'created_on');
              assert.property(issue, 'updated_on');
              assert.property(issue, 'created_by');
              assert.property(issue, 'assigned_to');
              assert.property(issue, 'open');
              assert.property(issue, 'status_text');
              assert.property(issue, '_id');
            });
            done();
          });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            status_text: 'In QA',
            issue_title: 'Title'
          })
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach( issue => {
              assert.equal(issue.status_text, 'In QA');
              assert.equal(issue.issue_title, 'Title');
              assert.property(issue, 'issue_title');
              assert.property(issue, 'issue_text');
              assert.property(issue, 'created_on');
              assert.property(issue, 'updated_on');
              assert.property(issue, 'created_by');
              assert.property(issue, 'assigned_to');
              assert.property(issue, 'open');
              assert.property(issue, 'status_text');
              assert.property(issue, '_id');
            });
            done();
          });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .query({})
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, '_id error');
            done();
          });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({_id: testId})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, `deleted ${testId}`);
            done();
          });
      });
      
    });

});

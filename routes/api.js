/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const { Project } = require('../models');

module.exports = function (app) {
  // preload project doc
  app.param('project', function(req, res, next, project) {
    // sanitize the project variable
    if (!/^\w+$/.test(project)) {
      return res.json({error: 'invalid input'});
    } else {
      console.log(`searching for ${project}`);
      Project.findOne({project_title: project}, function(err, doc) {
        if (err) return next(err);
        // if no doc, pass along info]
        if (!doc) {
          req.supposedProject = project;
          return next();
        }
        req.projectDoc = doc;
        return next();
      });
    }
  });
  
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      console.log('run get');
      if (!req.projectDoc) {
        return res.send(`${req.supposedProject} Not Found`);
      } else {
        let issues = req.projectDoc.issues;
        // Build up a filtered response
        for (let filter in req.query) {
          issues = issues.filter( issue => issue[filter] ===  req.query[filter]);
        }
        // then return the object
        return res.json(issues);
      }
    })
    
    .post(function (req, res){
      console.log(req.body);
      if (!req.body.created_by || !req.body.issue_text || !req.body.issue_title) {
        console.log('missing inputs');
        res.status(400);
        return res.send('missing inputs');
      } else if (req.projectDoc) {
        req.projectDoc.issues.push(req.body);
        const latestIssue = req.projectDoc.issues[req.projectDoc.issues.length - 1];
        req.projectDoc.save((err, project) => {
          if (err) return console.error(err);
          res.status(201);
          res.json(latestIssue);
        });
      } else {
        const newProject = new Project({
          project_title: req.supposedProject
        });
        newProject.issues.push(req.body);
        const firstIssue = newProject.issues[newProject.issues.length - 1];
        newProject.save((err, project) => {
          if (err) return console.error(err);
          res.status(201);
          res.json(firstIssue);
        })
      }
    })
    
    .put(function (req, res, next){
      console.log('run put');
      if (req.projectDoc) {
        if (!req.body._id) {
          return next(); // 404
        }
        if (!req.body.issue_title && !req.body.issue_text &&
            !req.body.created_by && !req.body.assigned_to &&
            !req.body.status_text && !req.body.hasOwnProperty('open')) {
          res.status(400);
          return res.send('no updated field sent');
        }
        const issueToUpdate = req.projectDoc.issues.id(req.body._id);
        if (!issueToUpdate) {
          res.status(400);
          return res.send('This ID is invalid');
        }
        issueToUpdate.update(req.body, function(err, result){
          if (err) return console.error(err);
          return res.send('successfully updated');
        });
      } else {
        return res.send('The project you want to update does not exist.');
      }
      
    })
    
    .delete(function (req, res){
      console.log('run delete');
      console.log(req.body);
      if (req.projectDoc) {
        if (!req.body._id) {
          console.log('no id');
          res.status(400);
          return res.send('_id error');
        }
        const issueToRemove = req.projectDoc.issues.id(req.body._id);
        issueToRemove.remove(err => {
          req.projectDoc.save((err, question) => {
            if (err) {
              return console.error(err);
            } else {
              res.status(200);
              return res.send(`deleted ${req.body._id}`);
            }
          });
        });
      } else {
          return res.send('The project you want to delete an issue in does not exist.');
      }
    });
    
};

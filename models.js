'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  assigned_to: {type: String, default: ''},
  status_text: {type: String, default: ''},
  created_on: {type: Date, default: new Date},
  updated_on: {type: Date, default: new Date},
  open: {type: Boolean, default: true}
});

// document instance method
IssueSchema.method('update', function(updates, done) {
  Object.assign(this, updates, {updated_on: new Date});
  this.parent().save(done);
})

const ProjectSchema = new Schema({
  project_title: {type: String, required: true},
  issues: [IssueSchema] // parent-child relationship
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports.Project = Project;
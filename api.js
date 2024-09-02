'use strict';

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const issueSchema = new mongoose.Schema({
  project: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  open: { type: Boolean, default: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now }
});
const Issue = mongoose.model('Issue', issueSchema);

module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(function(req, res) {
      let project = req.params.project;
      Issue.find({ project: project, ...req.query }, (err, issues) => {
        res.json(issues);
      });
    })

    .post(function(req, res) {
      let project = req.params.project;
      const { assigned_to = '', status_text = '', issue_title, issue_text, created_by } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.status(200).json({ error: 'required field(s) missing' });
      };
      const newIssue = new Issue({ project, assigned_to, status_text, issue_title, issue_text, created_by });
      newIssue.save((err, issue) => {
        res.json(issue);
      });
    })

    .put(function(req, res) {
      const { _id } = req.body;
      if (!_id) {
        return res.status(200).json({ error: 'missing _id' });
      };
      const updates = { ...req.body };
      delete updates._id;
      if (Object.keys(updates).filter(key => updates[key] !== '').length === 0) {
        return res.status(200).json({ error: 'no update field(s) sent', '_id': _id });
      };
      updates.updated_on = new Date();
      Issue.findByIdAndUpdate(_id, { $set: updates }, { new: true }, (err, updatedIssue) => {
        if (!updatedIssue) {
          return res.status(200).json({ error: 'could not update', '_id': _id });
        };
        res.json({ result: 'successfully updated', '_id': _id });
      });
    })

    .delete(function(req, res) {
      const { _id } = req.body;
      if (!_id) {
        return res.status(200).json({ error: 'missing _id' });
      };
      Issue.findByIdAndRemove(_id, (err, issue) => {
        if (!issue) {
          return res.status(200).json({ error: 'could not delete', '_id': _id });
        };
        res.json({ result: 'successfully deleted', '_id': _id });
      });
    });

};

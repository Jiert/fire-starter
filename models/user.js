var _ = require('underscore'),
    Backbone = require('backbone');

module.exports  = Backbone.Firebase.Model.extend({
  urlRoot: 'https://lighterfluid.firebaseIO.com/users/'
});
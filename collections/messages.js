var _ = require('underscore'),
    Backbone = require('backbone'),
    Message = require('../models/message');
    
module.exports = Backbone.Firebase.Collection.extend({

  initialize: function(models, options){
    this.url = 'https://lighterfluid.firebaseIO.com/messages/' + options.room;
  },

  model: Message,
});
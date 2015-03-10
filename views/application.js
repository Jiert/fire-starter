var _ = require('underscore'),
    app = require('../namespace'),
    Backbone = require('backbone'),

    RoomsCollection = require('../collections/rooms'),
    UserModel = require('../models/user'),

    template = require('../templates/application.hbs'),

    ContentView = require('../views/content'),
    NavView = require('../views/main_nav');

module.exports = Backbone.View.extend({

  events: {},

  initialize: function(options){
    _.bindAll(this, 'authDataCallback', 'onUser', 'getRooms');
  },

  getRooms: function(){
    // I'm putting this here so it can be listened to by any view in the app
    app.rooms = new RoomsCollection();

    // Why are we listening to rooms in order to authendicate a user??
    this.listenTo(app.rooms, 'sync', this.authenticateUser);
  },

  authenticateUser: function(){
    console.log('authendicateUser');

    // Cahnges to messages are calling sync on rooms,
    // so lets stop listen to 'sync' on rooms

    // Wait, why are we doing this here in authenticateUser ???
    this.stopListening(app.rooms, 'sync');

    // Register the callback to be fired every time auth state changes
    // TODO: we should be making all these references with models / collectons
    app.ref = new Firebase("https://lighterfluid.firebaseIO.com");
    app.ref.onAuth(this.authDataCallback);
  },

  authDataCallback: function(authData) {
    console.log('authDataCallback');
    delete app.user;

    if (authData) {
      app.user = new UserModel({
        id: authData.uid
      });

      // It appears that I usually already have the user, and 
      // sync is long gone. Not sure how to ensure I have a user
      // better than this nonsence:
      if (app.user.has('userName')){
        this.onUser();
      }
      else {
        this.listenTo(app.user, {
          'sync' : this.onUser,
        });
      }

    }
    else {
      console.log("User is logged out");

      // TODO: have parts of the application listen to he user
      // and render themselves, rather than re-rendering the entire
      // application on login / logout
      this.renderApp();
    }
  },

  onUser: function(){
    this.stopListening(app.user, 'sync');

    console.log('application: onUser: ', app.user.toJSON());

    // I question if this is the best thing to do
    this.renderApp();
  },

  renderApp: function(){
    this.clean();

    this.renderNav();
    this.renderContent();
  },

  clean: function(){
    _(this.subViews).each(function(view){
      view.destroy();
    })
  },

  renderNav: function(){
    var navView = this.createSubView(NavView, {});
    this.$mainNav.html(navView.render().el);
  },

  renderContent: function(){
    console.log('renderContent');

    var contentView = this.createSubView(ContentView, {});
    this.$content.html(contentView.render().el);
  },

  render: function() {
    console.log('application view render');
    this.$el.html(template());

    this.$mainNav = this.$('#main-nav');
    this.$content = this.$('#content');

    this.getRooms();

    return this;
  }

});
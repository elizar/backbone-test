(function($, Backbone, _) {

  'use strict'; // prevent global leakage

  var App = Backbone.View.extend({
    el: "#contacts",
    events: {
      'click #add_contact': 'addPerson',
      'keyup #inputs input': 'handleReturn'
    },

    initialize: function() {

      var self = this;

      self.input_name = $('#inputs input[name=fullname]');
      self.input_number = $('#inputs input[name=number]');
      self.input_username = $('#inputs input[name=username]');
      self.contacts_list = $('.table tbody');
      self.listenTo(self.collection, 'add', self.handleAdd);
      self.listenTo(self.collection, 'remove', function(r) {
       self.collection.models.forEach(function(model) {
        model.set('position', self.getPos(model));
       });
      });

    },

    handleReturn: function(e) {

      var self = this;
      if (e.which === 13) {
        e.preventDefault();
        // if enter key
        return self.addPerson();

      }

    },

    getPos: function(model) {

      var self = this;
      return _.indexOf(self.collection.models, model) + 1;

    },

    handleAdd: function(contact) {

      var self = this;
      var pos = self.getPos(contact);
      if (contact.get('_id')) {
        contact.set('position', pos);
        var view = new PersonView({
          model: contact
        });
        return $('#inputs').after(view.render().el);
      }

      self.collection.sync('create', contact, {
        success: function(c) {

          // Reset input styles
          $('#inputs input').css('background-color', 'white');
          // SUCCESS !== error-free
          if (c.error) {

            // Handles Duplicate
            if (c.error.err) {
              self.input_username.css('background-color', 'rgba(255,0,0,0.2)');
            }

            // Handles Path Error
            if (c.error.path) {
              self['input_' + c.error.path].css('background-color', 'rgba(255,0,0,0.2)');
            }

            // Handles Multiple Errors
            var errors = c.error.errors;
            if (errors) {
              Object.keys(errors).forEach(function(k) {
                self['input_' + k].css('background-color', 'rgba(255,0,0,0.2)');
              });
            }

            // remove temporarily added model
            self.collection.remove(contact);
            self.input_name.focus();

          } else {

            // Don't have to fetch from server anymore just
            // set model's _id to c._id
            contact.set('position', pos);
            var view = new PersonView({
              model: contact
            });

            // Reset input values
            $('#inputs input').val('');
            self.input_name.focus();
            $('#inputs').after(view.render().el).nextAll().eq(0).css('display', 'none').fadeIn(500);
            return;

          }

        },

        // Just for fun!
        error: function(e) {
          alert('Error : Ohpps! Something went wrong.');
        }

      });

    },

    addPerson: function(e) {

      var self = this;
      var person = new PersonModel({
        name: self.input_name.val().trim(),
        number: self.input_number.val().trim(),
        username: self.input_username.val().trim()
      });

      self.collection.add(person);

    }

  });

  var PersonModel = Backbone.Model.extend({

    defaults: {
      'name': '-',
      'number': '-',
      'username': '-'
    },

    idAttribute: '_id', // add this stuff to automate id process lols
    initialize: function() {

    },

    getIndex: function() {
      
    }
  });

  var PersonCollection = Backbone.Collection.extend({
    model: PersonModel,
    url: 'http://localhost:3000/contacts',
    initialize: function() {

    }
  });

  var PersonView = Backbone.View.extend({
    tagName: 'tr',
    template: $('#contact_template').html(),
    editTemplate: $('#edit_mode_template').html(),
    initialize: function() {
      var self = this;
      self.listenTo(self.model, 'all', self.render);
      self.listenTo(self.model, 'request', function() {
        console.log(arguments);
      });
    },

    events: {
      'click .edit': 'editPerson',
      'click .delete': 'deletePerson',
      'click .cancel': 'render',
      'click .done': 'updatePerson'
    },

    render: function(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      var _tmpl = _.template(this.template);
      this.$el.html(_tmpl(this.model.toJSON()));
      return this;
    },

    editPerson: function(e) {
      e.preventDefault();
      var _etmpl = _.template(this.editTemplate);
      this.$el.html(_etmpl(this.model.toJSON()));
      return this;
    },

    updatePerson: function(e) {
      e.preventDefault();
      var self = this;
      var data = {
        name: self.$el.find('input[name=fullname]')[0].value.trim(),
        number: self.$el.find('input[name=number]')[0].value.trim(),
        username: self.$el.find('input[name=username]')[0].value.trim()
      };
      self.model.set(data);
      self.model.sync('update', self.model);
    },

    deletePerson: function(e) {
      e.preventDefault();
      // Yeah, kicking it old skul buddy!
      var oks = confirm('Are you sure about this?');
      if (!oks) return;

      var self = this;
      self.model.destroy({
        success: self.removeView.apply(self)
      });
    },

    removeView: function() {
      this.$el.hide(300, function() {
        this.remove();
      });
    }


  });

  var contactApp = new App({
    collection: new PersonCollection()
  });

  // Fetch data from server to populate
  // our collections with models
  contactApp.collection.fetch();

})(jQuery, Backbone, _);

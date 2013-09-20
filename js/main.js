(function($, Backbone, _) {

  'use strict'; // prevent global leakage

  var App = Backbone.View.extend({
    el: "#contacts",
    events: {
      'click #add_contact': 'addPerson'
    },

    initialize: function() {

      var self = this;

      self.input_name = $('#inputs input[name=fullname]');
      self.input_number = $('#inputs input[name=number]');
      self.input_username = $('#inputs input[name=username]');
      self.contacts_list = $('.table tbody');
      self.listenTo(self.collection, 'add', self.handleContact);

    },

    handleContact: function(contact) {

      var self = this;

      if (contact.get('_id')) {
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

          } else {

            // Don't have to fetch from server anymore just
            // set model's _id to c._id
            contact.set('_id', c._id);

            var view = new PersonView({
              model: contact
            });

            // Reset input values
            $('#inputs input').val('');
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

    addPerson: function(evt) {
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
    },

    events: {
      'click .edit': 'editPerson',
      'click .delete': 'deletePerson',
      'click .cancel': 'render',
      'click .done': 'updatePerson'
    },

    render: function() {
      var _tmpl = _.template(this.template);
      this.$el.html(_tmpl(this.model.toJSON()));
      return this;
    },

    editPerson: function() {
      var _etmpl = _.template(this.editTemplate);
      this.$el.html(_etmpl(this.model.toJSON()));
      return this;
    },

    updatePerson: function() {
      var self = this;
      self.model.set('name', $(self.el).find('input[name=fullname]').val().trim());
      self.model.set('number', $(self.el).find('input[name=number]').val().trim());
      self.model.set('username', $(self.el).find('input[name=username]').val().trim());
      self.model.sync('update', self.model, {
        success: function(err, result) {
          if (result === 'success') {
            self.render();
          }
        }
      });
    },

    deletePerson: function() {
      // Yeah, kicking it old skul buddy!
      var oks = confirm('Are you sure about this?');
      if (!oks) return;

      var self = this;
      self.model.destroy({
        success: self.removeView.apply(self)
      });
    },

    removeView: function(e) {
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

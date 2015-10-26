/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

  schema: true,

  attributes: {
    
    name: {
      type: 'string',
      required: true
    },

    title: {
      type: 'string'
    },

    username : {
      type:'string',
      required: true,
      unique: true
    },

    email: {
      type: 'string',
      //email: true,
      required: false,
      //unique: true
    },

    encryptedPassword: {
      type: 'string'
    },

    online: {
      type: 'boolean',
      defaultsTo: false
    },

    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    sysadmin: {
      type: 'boolean',
      defaultsTo: false
    },
    
    agency:{
      collection: 'Agency',
      via: 'users'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      delete obj.confirmation;
      delete obj.encryptedPassword;
      delete obj._csrf;
      return obj;
    }

  },


  beforeValidation: function (values, next) {
    if (typeof values.admin !== 'undefined') {
      if (values.admin === 'unchecked') {
        values.admin = false;
      } else  if (values.admin[1] === 'on') {
        values.admin = true;
      }
    }
     next();
  },

  
  beforeCreate: function (values, next) {
        // This checks to make sure the password and password confirmation match before creating record
        if (!values.password || values.password != values.confirmation) {
            return next({err: ["Password doesn't match password confirmation."]});
        }
        require('bcryptjs').hash(values.password, 10, function(err, encryptedPassword) {
            if (err) return next(err);
            values.encryptedPassword = encryptedPassword;
            next();
        });
  },

  beforeUpdate: function (values, next) {
      // This checks to make sure the password and password confirmation match before creating record
      if (!values.password) {
          return next();
      }
      if (values.password && values.password != values.confirmation) {
          return next({err: ["Password doesn't match password confirmation."]});
      }
      require('bcryptjs').hash(values.password, 10, function(err, encryptedPassword) {
          if (err) return next(err);
          values.encryptedPassword = encryptedPassword;
          next();
      });
  }

};


var config = {
  development: {
    ports: {
      cms: 3002,
      site: 5000
    },
    cluster: false,
    db: 'mongodb://localhost/summer-coop-1',
    api_endpoint: 'http://localhost:5000',


    /* http://gadgets.ndtv.com/apps/features/how-to-remove-facebook-twitter-gmail-linkedin-dropbox-app-permissions-574272 */
    facebookAuth: {
      clientID: 'xx',
      clientSecret: 'xx',
      callbackURL: 'http://localhost:5000/auth/facebook/callback'
    },
    twitterAuth: {
      consumerKey: 'xxx',
      consumerSecret: 'xxx',
      callbackURL: 'http://localhost:5000/auth/twitter/callback'
    },
    googleAuth: {
      clientID: 'xxx',
      clientSecret: 'xxx',
      callbackURL: 'http://localhost:5000/auth/google/callback'
    },

  },

  production: {
    server_port: 80,
    cluster: true,
    db: 'mongodb://localhost/summer-coop-1',
    api_endpoint: 'http://summercoop.com',
    cms_url: 'http://summercoop.com',

    facebookAuth: {},
    googleAuth: {},
    twilio: {},


  }
}


exports = module.exports = config[process.env.NODE_ENV || 'development'];


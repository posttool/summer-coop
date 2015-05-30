var config = {
  development: {
    port: 5000,
    cluster: false,
    url: 'http://localhost:5000',
    db: 'mongodb://localhost/summer-coop-1',
    mailgun: 'key-1c328de125b80d29c470367f397840b1',
    sender: 'coop@pagesociety.net',

    facebookAuth: {
      clientID: '1398148860511689',
      clientSecret: 'e52687d11e97f5b8d89236e42b55a588',
      callbackURL: 'http://localhost:5000/auth/facebook/callback'
    },
    googleAuth: {
      clientID: '480518992161-3qq0ag0gti0r015alf7jb7epbs3fb5kd.apps.googleusercontent.com',
      clientSecret: 'H3gH3tkMSWa0zlVNvqPuJnvw',
      callbackURL: 'http://localhost:5000/auth/google/callback'
    }
//    twitterAuth: {
//      consumerKey: 'xxx',
//      consumerSecret: 'xxx',
//      callbackURL: 'http://localhost:5000/auth/twitter/callback'
//    }
  },

  production: {
    port: 80,
    cluster: true,
    url: 'http://pagesociety.net',
    db: 'mongodb://localhost/summer-coop-1',
    mailgun: 'key-1c328de125b80d29c470367f397840b1',
    sender: 'coop@pagesociety.net',

    facebookAuth: {},
    googleAuth: {},


  }
}


exports = module.exports = config[process.env.NODE_ENV || 'development'];


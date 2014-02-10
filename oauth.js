(function () {
  var Evernote = require('evernote').Evernote
  , config = require('./config.json')
  , callbackUrl = "http://localhost:1820/oauth_callback";

  // OAuth
  exports.oauth = function (req, res) {
    var client = new Evernote.Client({
      consumerKey: config.API_CONSUMER_KEY,
      consumerSecret: config.API_CONSUMER_SECRET,
      sandbox: config.SANDBOX
    });

    client.getRequestToken(callbackUrl, function (error, oauthToken, oauthTokenSecret, results) {
      if (error) {
        req.session.error = JSON.stringify(error);
        console.log('ERROR AUTHENTICATING: ' + JSON.stringify(error));
        res.redirect('/');
      }
      else {
        req.session.oauthToken = oauthToken;
        req.session.oauthTokenSecret = oauthTokenSecret;
        res.redirect(client.getAuthorizeUrl(oauthToken));
      }
    });
  };

  // OAuth callback
  exports.oauth_callback = function(req, res) {
    var client = new Evernote.Client({
      consumerKey: config.API_CONSUMER_KEY,
      consumerSecret: config.API_CONSUMER_SECRET,
      sandbox: config.SANDBOX
    });

    client.getAccessToken(
      req.session.oauthToken,
      req.session.oauthTokenSecret,
      req.param('oauth_verifier'),
      function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if(error) {
          console.log("ERROR DURING CALLBACK: " + JSON.stringify(error));
          res.redirect('/');
        } else {
          console.log("OAUTH_ACCESS_TOKEN: " + oauthAccessToken);
          res.redirect('/');
        }
      });
  };

  // Clear session
  exports.clear = function(req, res) {
    req.session.destroy();
    res.redirect('/');
  };

}());
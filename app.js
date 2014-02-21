var express = require('express')
  , app = express()
  // utils
  , exphbs = require('express3-handlebars')
  , hbs
  , path = require('path')
  , yaml = require('yamljs')
  , sass = require('node-sass')
  , fs = require('fs')
  , _ = require('underscore')
  , config = require('./config.json')
  , evernote = require('./evernote')
  , oauth = require('./oauth');
// HELPERS =====================================================================

hbs = exphbs.create({
  helpers: {
  }
});

// party like its ____
app.listen(process.env.PORT || 1820);

app.configure(function() {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'handlebars');
  app.engine('handlebars', hbs.engine);
  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secret'));
  app.use(express.session());
  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// ROUTES ======================================================================

// TODO: turn this into a post
//app.get('/derp', evernote.addSubscriber);

app.post('/subscribe', function (req, res) {
  var body = ''
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    evernote.addSubscriber(req, res, function (message){
      res.type('text/html');
      res.send(message);
    })
  });
});

// DELETE BELOW AFTER OAUTH
app.get('/oauth', oauth.oauth);
app.get('/oauth_callback', oauth.oauth_callback);
app.get('/clear', oauth.clear);
// DELETE ABOVE AFTER OAUTH

app.get('/', function (req, res){
  var templateConfig = yaml.load('config.yml')
    , scssString = '';

  // grab and consolidate the nav links
  templateConfig.nav = _.where(templateConfig.sections, { nav_link: true });

  // grab the CSS from config file
  for (var key in templateConfig.css) {
    scssString += ['$', key, ':\'', templateConfig.css[key], '\'; '].join('');
  }

  // synchronously write the CSS to a sass file
  fs.writeFileSync(__dirname + '/views/vars.scss', scssString)

  // render errthing
  sass.render({
    file: __dirname + '/views/main.scss',
    success: function(css){
      templateConfig['css'] = css;
      res.render('index', templateConfig);
    },
    error: function(error) {
      console.log(error);
    },
    outputStyle: 'compressed'
  });
});

// DERP ========================================================================
## [Click here for a live demo!](http://fuzzy-plate-demo.herokuapp.com)


# fuzzyplates

This is a boilerplate for all your derpy app ideas. Quickly create a typical Silicon Valley one-pager explaining your app at a high-level and collect e-mail sign-ups from those interested. The e-mails will be collected and stored on your Evernote. With this, you can create as many of these fuzzyplates as you want and keep track of how good an idea is in one place (your FuzzyPlates Subscribers notebook!)

## Setting up

Documentation is lacking right now, but basically you'll need to:

### 1. Obtain an Evernote API key

You'll need to go to [dev.evernote.com](http://dev.evernote.com/) to grab an API key and secret. Store these in **config.json**.

### 2. Get your OAuth access token

Run the app by typing

    node app.js

in your terminal. Go to http://localhost:1820/oauth. Sign in with your personal Evernote account and allow access to your notebooks.

*Note: We will ever only **create** notebooks and notes.*

Once you authorize us, check your terminal. You should see a console message which begins with "OAUTH_ACCESS_TOKEN:". Copy your access token and paste it in **config.json**.

### 3. Remove oauth paths in app.js

In app.js, remove lines 65-69:

    // DELETE BELOW AFTER OAUTH
    app.get('/oauth', oauth.oauth);
    app.get('/oauth_callback', oauth.oauth_callback);
    app.get('/clear', oauth.clear);
    // DELETE ABOVE AFTER OAUTH

This is so no one can reconfigure where your subscriber's e-mails will end up.

### 4. Configure config.yml to your liking

You can check either **config.yml.template** for an empty skeleton or **config.yml** for a working template.

### 5. Request Evernote to activate your API key for production

This is sort of a pain, but Evernote requires you to request production access for your API key. Go to [dev.evernote.com](http://dev.evernote.com/), click on "Resources" drop down menu and select "Activate an API key".

### 6. Remove .gitignore

Just delete the file. You won't need it.

### 7. Deploy!

Create a new project in heroku, and deploy. It should work right out of the box!

## Guide

Fuzzyplate is built on the notion of 'n-columns'. The idea is that every section contains n (user-defined) columns. A text-only section can be considered 1-column. You can configure what shows up in these columns (quotes, plain text, images). You can also add pre-column text for your section.

Check out the [demo!](http://fuzzy-plate-demo.herokuapp.com) The config.yml file is checked into this repo as well for your reference.

*Coming soon: detailed step-by-step guide for config.yml*

# Setup Development Environment

## Prerequisites: 
Running on Node 8

- If using nvm, use `nvm use`

## Install packages:
`npm install`

## Run Local Server
`npm run watch`

And in separate terminal: 
`npm run dev`

It should now be available on port 5000, e.g., 
`http://172.16.3.2:5000/` if that's where the remote server is, or 
`http://localhost:5000/`

Note that we'll have to set things up so Google allows Oauth for local server...harder than it sounds

## Get Google Oauth consent
- This app will need to have Google Analytics Reporting API enabled in Google cloud console
- Make sure to also allow those tokens in the [Oauth consent screen page](https://console.developers.google.com/apis/credentials/consent/edit) 

## If you want to use Facebook, Twitter, and LinkedIn, need to apply for those developer accounts as well
- Our Demo is not supporting any social media platform apart from Google, however.

## Set Env Vars
`cp .env.sample .env`

Then fill them all in. 
- `API_URL` in dev should probably be `localhost:1337`. 
- Some have defaults that work for development environment set already, but many (especially social media account api keys) need to be filled in to work.





# Deploy
`npm run deploy`

- to run with oauth, make sure to request all scopes that we specify in nodeHelpers.js. E.g., for Google, make sure to enable webmasters and analytics apis (specifically analytics reporting) and then request access to those scopes for their oauth
- Google API key will have to access to all these apis also

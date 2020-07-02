See demo videos [here](https://www.youtube.com/playlist?list=PLGiO0wyxB_OnIQRe9CHlcafq34EdkGoD_).

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
- Unfortunately, Due to the way PassPort is implemented, we also need to ask for Google+ permissions (see [here](https://stackoverflow.com/questions/52736319/passport-js-authenticate-to-gmail-api-leads-to-googleplusapierror))
- Google API key will have to access to all these apis also

# Released under MIT License

Copyright (c) 2020 Ryan Quey.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

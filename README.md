# Setup Development Environment

## Prerequisites: 
Running on Node 8

- If using nvm, use `nvm use`

## Install packages:
`npm install`

## Run Local Server
`npm run dev`

## Set Env Vars
`cp .env.sample .env`

Then fill them all in. 
- `API_URL` in dev should probably be `localhost:1337`. 
- Some have defaults that work for development environment set already, but many (especially social media account api keys) need to be filled in to work.

# Deploy
`npm run deploy`

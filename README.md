Legalmobile

This project was generated with the [Generator-Avionic](https://github.com/reedia/generator-avionic/) version 0.0.22.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Ionic Framework](https://ionicframework.com/)
- [Gulp](http://gulpjs.com/)

## Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Run `gulp` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `gulp av:build` for building.

For building for a platform check all the steps on [Generator-Avionic](https://github.com/reedia/generator-avionic/) 

## File upload
* It uses [File-picker](https://www.filestack.com/), a third party plugin.
* It uploads the file to file-picker server and returns remote Url.

## API
* All the following features consumes rest API from Api-app 
** Checklists
** Deals
** Messaging
** Comments
** User management 

## Messaging
* Real time messaging features uses web-sockets with socket.js on node server
* Socket.js is subscribed to Redis-server
* Client is subscribed to socket channel with updates the client with updates from redis(rails)

## Configuration
* Set the API base url and other config in the `app.js`.
* Set the web-socket server (Node server) url in `/app/scripts/services/socket.servise.js`, for Messaging feature.

## User authentication
* Rails api app uses [devise-token-auth](https://github.com/lynndylanhurley/devise_token_auth), which uses token based authentication.
* [ng-token-auth](https://github.com/lynndylanhurley/ng-token-auth) plugin is used on the web app for token based authentication.

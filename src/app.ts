// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa';
import socketio from '@feathersjs/socketio';

import type { Application } from './declarations';
import { configurationValidator } from './configuration';
import { logError } from './hooks/log-error';
import { postgresql } from './postgresql';
import { authentication } from './authentication';
import { services } from './services/index';
import { channels } from './channels';
import { authCallback } from './authCallback';
// import { setDebug } from '@feathersjs/commons';

// eslint-disable-next-line no-console
// setDebug(() => console.log);

const app: Application = koa(feathers());

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator));

// Set up Koa middleware
app.use(cors());
app.use(serveStatic(app.get('public')));
app.use(authCallback());
app.use(errorHandler());
app.use(parseAuthentication());
app.use(bodyParser());

// Configure services and transports
app.configure(rest());
app.configure(socketio({ cors: { origin: app.get('origins') } }));
app.configure(postgresql);
app.configure(authentication);
app.configure(services);
app.configure(channels);

// Register hooks that run on all service methods
app.hooks({ around: { all: [ logError ] } });
// Register application setup and teardown hooks here
app.hooks({
	setup: [],
	teardown: []
});

export { app };

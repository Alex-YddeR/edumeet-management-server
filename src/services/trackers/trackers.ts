// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
	trackerDataValidator,
	trackerPatchValidator,
	trackerQueryValidator,
	trackerResolver,
	trackerExternalResolver,
	trackerDataResolver,
	trackerPatchResolver,
	trackerQueryResolver
} from './trackers.schema';

import type { Application } from '../../declarations';
import { TrackerService, getOptions } from './trackers.class';
import { checkPermissions } from '../../hooks/checkPermissions';

export * from './trackers.class';
export * from './trackers.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const tracker = (app: Application) => {
	// Register our service on the Feathers application
	app.use('trackers', new TrackerService(getOptions(app)), {
		// A list of all methods this service exposes externally
		methods: [ 'find', 'get', 'create', 'patch', 'remove' ],
		// You can add additional custom events to be sent to clients here
		events: []
	});
	// Initialize hooks
	app.service('trackers').hooks({
		around: {
			all: [
				authenticate('jwt'),
				schemaHooks.resolveExternal(trackerExternalResolver),
				schemaHooks.resolveResult(trackerResolver)
			]
		},
		before: {
			all: [
				checkPermissions({ roles: [ 'super-admin', 'edumeet-server' ] }),
				schemaHooks.validateQuery(trackerQueryValidator),
				schemaHooks.resolveQuery(trackerQueryResolver)
			],
			find: [],
			get: [],
			create: [
				schemaHooks.validateData(trackerDataValidator),
				schemaHooks.resolveData(trackerDataResolver)
			],
			patch: [
				schemaHooks.validateData(trackerPatchValidator),
				schemaHooks.resolveData(trackerPatchResolver)
			],
			remove: []
		},
		after: {
			all: []
		},
		error: {
			all: []
		}
	});
};

// Add this service to the service type index
declare module '../../declarations' {
	interface ServiceTypes {
		trackers: TrackerService
	}
}

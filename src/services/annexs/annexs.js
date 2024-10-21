// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import { AnnexService, getOptions } from './annexs.class.js'
import {
  annexDataResolver,
  annexDataValidator,
  annexExternalResolver,
  annexPatchResolver,
  annexPatchValidator,
  annexQueryResolver,
  annexQueryValidator,
  annexResolver,
} from './annexs.schema.js'
import { annexMethods, annexPath } from './annexs.shared.js'

export * from './annexs.class.js'
export * from './annexs.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export function annex(app) {
  // Register our service on the Feathers application
  app.use(annexPath, new AnnexService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: annexMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(annexPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(annexExternalResolver),
        schemaHooks.resolveResult(annexResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(annexQueryValidator),
        schemaHooks.resolveQuery(annexQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(annexDataValidator),
        schemaHooks.resolveData(annexDataResolver),
      ],
      patch: [
        schemaHooks.validateData(annexPatchValidator),
        schemaHooks.resolveData(annexPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  })
}

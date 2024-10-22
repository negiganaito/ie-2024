// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import { CustomerService, getOptions } from './customers.class.js'
import {
  customerDataResolver,
  customerDataValidator,
  customerExternalResolver,
  customerPatchResolver,
  customerPatchValidator,
  customerQueryResolver,
  customerQueryValidator,
  customerResolver,
} from './customers.schema.js'
import { customerMethods, customerPath } from './customers.shared.js'

export * from './customers.class.js'
export * from './customers.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export function customer(app) {
  // Register our service on the Feathers application
  app.use(customerPath, new CustomerService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: customerMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(customerPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(customerExternalResolver),
        schemaHooks.resolveResult(customerResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(customerQueryValidator),
        schemaHooks.resolveQuery(customerQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(customerDataValidator),
        schemaHooks.resolveData(customerDataResolver),
      ],
      patch: [
        schemaHooks.validateData(customerPatchValidator),
        schemaHooks.resolveData(customerPatchResolver),
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

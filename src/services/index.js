import { annex } from './annexs/annexs.js'
import { customer } from './customers/customers.js'
import { user } from './users/users.js'

export function services(app) {
  app.configure(annex)
  app.configure(customer)

  app.configure(user)

  // All services will be registered here
}

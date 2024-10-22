import authenticationClient from '@feathersjs/authentication-client'
export {}

// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'

export {}

export {}

/**
 * Returns a  client for the ie app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export function createClient(connection, authenticationOptions = {}) {
  const client = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)

  client.configure(annexClient)

  client.configure(contractClient)

  return client
}

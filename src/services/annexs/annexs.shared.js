export const annexPath = 'annexs'

export const annexMethods = ['find', 'get', 'create', 'patch', 'remove']

export function annexClient(client) {
  const connection = client.get('connection')

  client.use(annexPath, connection.service(annexPath), {
    methods: annexMethods,
  })
}

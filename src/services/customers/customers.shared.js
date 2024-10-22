export const customerPath = 'customers'

export const customerMethods = ['find', 'get', 'create', 'patch', 'remove']

export function customerClient(client) {
  const connection = client.get('connection')

  client.use(customerPath, connection.service(customerPath), {
    methods: customerMethods,
  })
}

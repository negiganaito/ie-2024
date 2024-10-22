// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { getValidator, ObjectIdSchema, querySyntax, Type } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSchema } from '../users/users.schema.js'

// Main data model schema
export const customerSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    company: Type.String(),
    representedBy: Type.String(),
    address: Type.String(),
    location: Type.String(),

    //
    optional: Type.Any(),
    //
    createdAt: Type.Number(),
    userId: Type.String({ objectid: true }),
    user: Type.Ref(userSchema),

  },
  { $id: 'Customer', additionalProperties: true },
)
export const customerValidator = getValidator(customerSchema, dataValidator)
export const customerResolver = resolve({
  user: virtual(async (message, context) => {
    // Associate the user that sent the message
    return context.app.service('users').get(message.userId)
  }),
})

export const customerExternalResolver = resolve({})

// Schema for creating new entries
export const customerDataSchema = Type.Pick(customerSchema, ['text'], {
  $id: 'CustomerData',
})
export const customerDataValidator = getValidator(customerDataSchema, dataValidator)
export const customerDataResolver = resolve({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => {
    return Date.now()
  },
})

// Schema for updating existing entries
export const customerPatchSchema = Type.Partial(customerSchema, {
  $id: 'CustomerPatch',
})
export const customerPatchValidator = getValidator(customerPatchSchema, dataValidator)
export const customerPatchResolver = resolve({})

// Schema for allowed query properties
export const customerQueryProperties = Type.Pick(customerSchema, ['_id', 'text'])
export const customerQuerySchema = Type.Intersect(
  [
    querySyntax(customerQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export const customerQueryValidator = getValidator(customerQuerySchema, queryValidator)
export const customerQueryResolver = resolve({
  userId: async (value, user, context) => {
    // We want to be able to find all messages but
    // only let a user modify their own messages otherwise
    if (context.params.user && context.method !== 'find') {
      return context.params.user._id
    }

    return value
  },
})

// 24kct04
// 24kct05
// 24kct06
// 24kct08
// 24kct09
// 24kct11
// 24kct12
// 24kct13
// 24kct14
// 24kct15
// 24kct16
// 24kct17
// 24kct18
// 24kct20
// 24kct21
// 24kct22
// 24kct23
// 24kct25
// 24kct27
// 24kct28
// 24kct29
// 24kct30

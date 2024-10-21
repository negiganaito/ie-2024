// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { getValidator, ObjectIdSchema, querySyntax, Type } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { userSchema } from '../users/users.schema.js'

// Main data model schema
export const annexSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String(),
    createdAt: Type.Number(),
    userId: Type.String({ objectid: true }),
    user: Type.Ref(userSchema),
  },
  { $id: 'Annex', additionalProperties: false },
)
export const annexValidator = getValidator(annexSchema, dataValidator)
export const annexResolver = resolve({
  user: virtual(async (annex, context) => {
    // Associate the user that sent the message
    return context.app.service('users').get(annex.userId)
  }),
})

export const annexExternalResolver = resolve({})

// Schema for creating new entries
export const annexDataSchema = Type.Pick(annexSchema, ['text'], {
  $id: 'AnnexData',
})
export const annexDataValidator = getValidator(annexDataSchema, dataValidator)
export const annexDataResolver = resolve({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user._id
  },
  createdAt: async () => {
    return Date.now()
  },
})

// Schema for updating existing entries
export const annexPatchSchema = Type.Partial(annexSchema, {
  $id: 'AnnexPatch',
})
export const annexPatchValidator = getValidator(
  annexPatchSchema,
  dataValidator,
)
export const annexPatchResolver = resolve({})

// Schema for allowed query properties
export const annexQueryProperties = Type.Pick(annexSchema, ['_id', 'text', 'createdAt', 'userId'])
export const annexQuerySchema = Type.Intersect(
  [
    querySyntax(annexQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export const annexQueryValidator = getValidator(
  annexQuerySchema,
  queryValidator,
)
export const annexQueryResolver = resolve({
  userId: async (value, user, context) => {
    // We want to be able to find all messages but
    // only let a user modify their own messages otherwise
    if (context.params.user && context.method !== 'find') {
      return context.params.user._id
    }

    return value
  },
})

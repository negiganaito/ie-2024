// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { getValidator, ObjectIdSchema, querySyntax, Type } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const annexSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String(),
  },
  { $id: 'Annex', additionalProperties: false },
)
export const annexValidator = getValidator(annexSchema, dataValidator)
export const annexResolver = resolve({})

export const annexExternalResolver = resolve({})

// Schema for creating new entries
export const annexDataSchema = Type.Pick(annexSchema, ['text'], {
  $id: 'AnnexData',
})
export const annexDataValidator = getValidator(annexDataSchema, dataValidator)
export const annexDataResolver = resolve({})

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
export const annexQueryProperties = Type.Pick(annexSchema, ['_id', 'text'])
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
export const annexQueryResolver = resolve({})

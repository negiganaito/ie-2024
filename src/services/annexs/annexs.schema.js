// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { getValidator, ObjectIdSchema, querySyntax, Type } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
const annexSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.Number(),
    userId: Type.String({ objectid: true }),
    //
    annexType: Type.Number(),
    annexCreationDate: Type.String(),
    annexNo: Type.String(),
    contractNo: Type.String(),
    projectName: Type.String(),
    itemName: Type.String(),
    annexShortLocation: Type.String(),
    contractSignedDate: Type.String(),
    //
    pAName: Type.String(),
    pARepresented: Type.String(),
    pAAddress: Type.String(),
    pAIdCode: Type.String(),

    pAAnnexSignName: Type.String(),

    termValue: Type.Any(),
  },
  { $id: 'Annex', additionalProperties: true },
)

const termValueSchemas = {
  // Change party A information
  0: Type.String(),

  1: Type.Object({
    information: Type.String(),
  }),

  // Change addition amount
  2: Type.Object({
    amountInWord: Type.String(),
    previousAmount: Type.String(),
    additionalAmount: Type.String(),
    totalAmount: Type.String(),
  }),

  // port of Destination and Shipment Term change
  3: Type.Object({
    portOfDestination: Type.String(),
    shipmentTerm: Type.String(),
  }),

}

async function termValueValidator(context) {
  const { annexType, termValue } = context.data

  const schema = termValueSchemas[annexType]

  if (!schema) {
    throw new Error(`Invalid annexType: ${annexType}`)
  }

  // Validate the termValue with the corresponding schema
  const validator = getValidator(schema, dataValidator)
  const validation = validator(termValue)

  return validation
}

const annexValidator = getValidator(annexSchema, dataValidator)
const annexResolver = resolve({ })

const annexExternalResolver = resolve({ })

// Schema for creating new entries
const annexDataSchema = Type.Pick(annexSchema, ['text'], {
  $id: 'AnnexData',
})

const annexDataValidator = getValidator(annexDataSchema, dataValidator)
const annexDataResolver = resolve({

  createdAt: async () => {
    return Date.now()
  },
})

// Schema for updating existing entries
const annexPatchSchema = Type.Partial(annexSchema, {
  $id: 'AnnexPatch',
})
const annexPatchValidator = getValidator(
  annexPatchSchema,
  dataValidator,
)
const annexPatchResolver = resolve({})

// Schema for allowed query properties
const annexQueryProperties = Type.Pick(annexSchema, ['_id', 'text', 'createdAt', 'userId'])
const annexQuerySchema = Type.Intersect(
  [
    querySyntax(annexQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
const annexQueryValidator = getValidator(
  annexQuerySchema,
  queryValidator,
)
const annexQueryResolver = resolve({
  userId: async (value, user, context) => {
    // We want to be able to find all messages but
    // only let a user modify their own messages otherwise
    if (context.params.user && context.method !== 'find') {
      return context.params.user._id
    }

    return value
  },
})

export {
  annexDataResolver,
  annexDataSchema,
  annexDataValidator,
  annexExternalResolver,
  annexPatchResolver,
  annexPatchSchema,
  annexPatchValidator,
  annexQueryProperties,
  annexQueryResolver,
  annexQuerySchema,
  annexQueryValidator,
  annexResolver,
  annexSchema,
  annexValidator,
  termValueValidator,
}

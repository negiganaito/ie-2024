import {
  defaultAppConfiguration,
  getValidator,
  Type,
} from '@feathersjs/typebox'

import { dataValidator } from './validators.js'

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String(),
  }),
])

export const configurationValidator = getValidator(
  configurationSchema,
  dataValidator,
)

import configuration from '@feathersjs/configuration'
import express, {
  cors,
  errorHandler,
  json,
  notFound,
  rest,
  serveStatic,
  urlencoded,
} from '@feathersjs/express'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio'
import { authentication } from './authentication.js'
import { channels } from './channels.js'
import { configurationValidator } from './configuration.js'
import { logError } from './hooks/log-error.js'
import { logger } from './logger.js'
import { mongodb } from './mongodb.js'
import { services } from './services/index.js'

const app = express(feathers())

// Load app configuration
app.configure(configuration(configurationValidator))
app.use(cors({
  origin: 'http://localhost:8000', // Allow calls from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow specific HTTP methods
  credentials: true, // Enable credentials if necessary (e.g., for cookies or auth headers)
}))
app.use(json())
app.use(urlencoded({ extended: true }))
// Host the public folder
app.use('/', serveStatic(app.get('public')))

// Configure services and real-time functionality
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins'),
    },
  }),
)
app.configure(mongodb)

app.configure(authentication)

app.configure(services)
app.configure(channels)

// Configure a middleware for 404s and the error handler
app.use(notFound())
app.use(errorHandler({ logger }))

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError],
  },
  before: {},
  after: {},
  error: {},
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: [],
})

export { app }

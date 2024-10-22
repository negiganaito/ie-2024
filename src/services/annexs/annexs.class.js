import { MongoDBService } from '@feathersjs/mongodb'

import { processAnnexExcel } from './annex.excel-template.js'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AnnexService extends MongoDBService {
  // Override the create method to handle the request without saving it to MongoDB
  async create(data, _params) {
    try {
      await processAnnexExcel(data) // Delegate to utility function
      return { data: 'File saved with styles retained.' }
    }
    catch (err) {
      console.error('Error:', err)
      return { error: err }
    }
  }

  // Similarly, you can override other methods like `find`, `patch`, etc.
  async find() {
    // Optionally return mock or in-memory data if necessary
    return []
  }
}

export function getOptions(app) {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('annexs')),
  }
}

// 028 7100 0229

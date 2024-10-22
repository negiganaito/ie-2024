import fs from 'node:fs'

import path from 'node:path'

import { MongoDBService } from '@feathersjs/mongodb'
import XlsxTemplate from 'xlsx-template'

import { __dirname } from '../../utils/dir-name.js'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AnnexService extends MongoDBService {
  // Override the create method to handle the request without saving it to MongoDB
  async create(data, params) {
    const excelData = fs.readFileSync(path.join(__dirname, 'src/assets/annex_1.xlsx'))
    const option = {
      imageRootPath: path.join(__dirname, 'src/assets'),
    }

    const template = new XlsxTemplate(excelData, option)
    const sheetName = '1'

    const {
      annexCreationDate,
      annexNo,
      contractNo,
      projectName,
      itemName,
      annexShortLocation,
      contractSignedDate,
      pAName,
      pARepresented,
      pAAddress,
      pAIdCode,
      pAAnnexSignName,
    } = data

    const values = {
      annex_creation_date: annexCreationDate,
      annex_no: annexNo,
      contract_no: contractNo,
      project_name: projectName,
      item_name: itemName,
      annex_short_location: annexShortLocation,
      contract_signed_date: contractSignedDate,
      //
      p_a_name: pAName,
      p_a_represented: pARepresented,
      p_a_address: pAAddress,
      p_a_id_code: pAIdCode,
      p_a_annex_sign_name: pAAnnexSignName,
    }

    template.substitute(sheetName, values)
    const buffer = template.generate({ type: 'nodebuffer' })
    fs.writeFileSync(`${path.join(__dirname, 'src/assets/')}annex-xlsx-template-output.xlsx`, buffer)

    const result = {
      ...data,
      _id: `custom-id-${Date.now()}`, // Generate a temporary ID
      createdAt: Date.now(), // Add creation timestamp
      userId: params.user._id, // Attach user ID from the authenticated user
    }

    // Return the data without calling the super method (which would save to MongoDB)
    return result
  }

  // Similarly, you can override other methods like `find`, `patch`, etc.
  async find(params) {
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

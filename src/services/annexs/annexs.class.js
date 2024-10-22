import fs from 'node:fs'

import path from 'node:path'

import { MongoDBService } from '@feathersjs/mongodb'
import ExcelJS from 'exceljs'
import Handlebars from 'handlebars'
import XlsxTemplate from 'xlsx-template'

import { addHeader } from '../../utils/add-header.js'
import { calculateRowHeight, EXCEL_POINT_PER_PIXEL } from '../../utils/calculate-row-height.js'
import { __dirname } from '../../utils/dir-name.js'
import { getTotalMergedWidth } from '../../utils/get-total-merged-width.js'
import { annexTermTemplate } from './annex-term-template.js'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AnnexService extends MongoDBService {
  // Override the create method to handle the request without saving it to MongoDB
  async create(data, params) {
    try {
      const excelData = fs.readFileSync(path.join(__dirname, 'src/assets/annex_1.xlsx'))
      const option = {
        imageRootPath: path.join(__dirname, 'src/assets'),
      }

      const template = new XlsxTemplate(excelData, option)
      const sheetName = '1'

      const {
        annexType,
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
        termValue,
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

      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(`${path.join(__dirname, 'src/assets/')}annex-xlsx-template-output.xlsx`)

      const worksheet = workbook.getWorksheet('1')

      const compileTermValueTemplate = Handlebars.compile(annexTermTemplate[annexType])
      let annexTermValueResult = ''

      switch (annexType) {
        case 2:
          annexTermValueResult = compileTermValueTemplate({
            previousAmount: termValue.previousAmount,
            additionalAmount: termValue.additionalAmount,
            totalAmount: termValue.totalAmount,
          })
          break

        default:
          break
      }

      worksheet.getCell('A32').value = '1.1'
      worksheet.mergeCells('B32:I32')
      const mergedCell = worksheet.getCell('B32')
      mergedCell.value = annexTermValueResult

      const totalMergedWidth = getTotalMergedWidth(worksheet, 'B32:I32')
      // Calculate and set the row height based on the merged width and content
      worksheet.getRow(32).height = calculateRowHeight(mergedCell.value, totalMergedWidth, 13) / EXCEL_POINT_PER_PIXEL

      // add logo
      addHeader(workbook, worksheet, {
        filename: path.join(__dirname, 'src/assets/header.svg'),
        extension: 'svg',
      })

      await workbook.xlsx.writeFile(`${path.join(__dirname, 'src/assets/')}annex-xlsx-template-output.xlsx`)

      return {
        data: 'File saved with styles retained.',
      }
    }
    catch (err) {
      console.error('Error:', err)

      return {
        error: err,
      }
    }

    // const result = {
    //   ...data,
    //   _id: `custom-id-${Date.now()}`, // Generate a temporary ID
    //   createdAt: Date.now(), // Add creation timestamp
    //   userId: params.user._id, // Attach user ID from the authenticated user
    // }

    // // Return the data without calling the super method (which would save to MongoDB)
    // return result
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

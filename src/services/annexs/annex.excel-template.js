import fs from 'node:fs'
import ExcelJS from 'exceljs'
import Handlebars from 'handlebars'
import XlsxTemplate from 'xlsx-template'
import { addHeader } from '../../utils/add-header.js'
import { calculateRowHeight, EXCEL_POINT_PER_PIXEL } from '../../utils/calculate-row-height.js'
import { ANNEX_CUSTOM_TERM_CHANGE, ANNEX_SHEET_NAME, ANNEX_TEMPLATE_PATH, ASSETS_ROOT_PATH, DEFAULT_FONT_SIZE, HEADER_IMAGE_PATH, TERM_CHANGES_CELL_NUMBERING, TERM_CHANGES_CELL_RANGE, TERM_CHANGES_CELL_ROW, TERM_CHANGES_MERGED_CELL } from '../../utils/constants.js'
import { getTotalMergedWidth } from '../../utils/get-total-merged-width.js'
import { annexTermTemplate } from './annex.term-template.js'

export async function processAnnexExcel(data) {
  const excelData = fs.readFileSync(ANNEX_TEMPLATE_PATH)
  const option = { imageRootPath: ASSETS_ROOT_PATH }

  const template = new XlsxTemplate(excelData, option)

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

  const requireAnnexData = {
    annex_creation_date: annexCreationDate, //
    annex_no: annexNo, //
    contract_no: contractNo, //
    project_name: projectName, //
    item_name: itemName, //
    annex_short_location: annexShortLocation, //
    contract_signed_date: contractSignedDate, //
    p_a_name: pAName,
    p_a_represented: pARepresented,
    p_a_address: pAAddress,
    p_a_id_code: pAIdCode,
    p_a_annex_sign_name: pAAnnexSignName,
  }

  template.substitute(ANNEX_SHEET_NAME, requireAnnexData)
  const buffer = template.generate({ type: 'nodebuffer' })

  const ANNEX_OUTPUT_FILE_NAME = `${ASSETS_ROOT_PATH}/ANNEX-${annexNo}-${contractNo}.xlsx`

  fs.writeFileSync(ANNEX_OUTPUT_FILE_NAME, buffer)

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(ANNEX_OUTPUT_FILE_NAME)
  const worksheet = workbook.getWorksheet('1')

  let annexTermValueResult = termValue

  if (annexType !== ANNEX_CUSTOM_TERM_CHANGE) {
    const compileTermValueTemplate = Handlebars.compile(annexTermTemplate[annexType])
    annexTermValueResult = compileTermValueTemplate(termValue)
  }

  worksheet.getCell(TERM_CHANGES_CELL_NUMBERING).value = '1.1'
  worksheet.mergeCells(TERM_CHANGES_CELL_RANGE)
  const mergedCell = worksheet.getCell(TERM_CHANGES_MERGED_CELL)
  mergedCell.value = annexTermValueResult

  const totalMergedWidth = getTotalMergedWidth(worksheet, TERM_CHANGES_CELL_RANGE)
  worksheet.getRow(TERM_CHANGES_CELL_ROW).height = calculateRowHeight(mergedCell.value, totalMergedWidth, DEFAULT_FONT_SIZE) / EXCEL_POINT_PER_PIXEL

  // Add the logo
  addHeader(workbook, worksheet, {
    filename: HEADER_IMAGE_PATH,
    extension: 'svg',
  })

  await workbook.xlsx.writeFile(ANNEX_OUTPUT_FILE_NAME)
}

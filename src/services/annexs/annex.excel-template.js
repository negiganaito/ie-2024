import fs from 'node:fs'
import ExcelJS from 'exceljs'
import Handlebars from 'handlebars'
import XlsxTemplate from 'xlsx-template'
import { calculateRowHeight, EXCEL_POINT_PER_PIXEL } from '../../utils/calculate-row-height.js'
import { ANNEX_CUSTOM_TERM_CHANGE, ANNEX_SHEET_NAME, ANNEX_TEMPLATE_PATH, ASSETS_ROOT_PATH, DEFAULT_FONT_SIZE, TERM_CHANGES_CELL_NUMBERING, TERM_CHANGES_CELL_RANGE, TERM_CHANGES_CELL_ROW, TERM_CHANGES_MERGED_CELL } from '../../utils/constants.js'
import { getTotalMergedWidth } from '../../utils/get-total-merged-width.js'
import { EXCEL_POSITION } from './annex.excel-position.js'
import { annexTermTemplate } from './annex.term-template.js'


export const mergeCellsIfNeeded = (
  worksheet,
  range
) => {
  const [startCell, endCell] = range.split(":");
  const startRow = worksheet.getCell(startCell).row;
  const endRow = worksheet.getCell(endCell).row;
  const startCol = worksheet.getCell(startCell).col;
  const endCol = worksheet.getCell(endCell).col;

  let alreadyMerged = false;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cell = worksheet.getCell(row, col);
      if (cell.isMerged) {
        alreadyMerged = true;
        break;
      }
    }
    if (alreadyMerged) break;
  }

  if (!alreadyMerged) {
    worksheet.mergeCells(range);
  }
};


function moveMergesModel(
  worksheet,
  afterRow,
  numRows,
) {
  // @ts-ignore - _merges is a private property
  const merges = worksheet._merges;
  // @ts-ignore - _merges is a private property
  worksheet._merges = Object.fromEntries(
    // Loop through each of the ranges in the merges map
    Object.entries(merges).map(([cell, range]) => {
      // If the range is below the target row, return it as is
      if (range.top <= afterRow) {
        return [cell, range];
      }
      // Otherwise, move the precached merge range down by numRows
      // This also works for negative numbers if rows were deleted
      range.top += numRows;
      range.bottom += numRows;
      // Update the name of the map entry to the new top-left cell name
      const newTopLeftCell = worksheet.getCell(range.top, range.left).address;
      return [newTopLeftCell, range];
    }),
  );
}


async function insertCustomerWithStyle(worksheet, insertPosition, key, value, styles) {


  // Insert a new row at the specified index
  // worksheet.insertRow(insertPosition);

  // Define cell positions
  const startKeyCell = `${EXCEL_POSITION.customer_info.key.cell_start}${insertPosition}`;
  const endKeyCell = `${EXCEL_POSITION.customer_info.key.cell_end}${insertPosition}`;
  const startValueCell = `${EXCEL_POSITION.customer_info.value.cell_start}${insertPosition}`;
  const endValueCell = `${EXCEL_POSITION.customer_info.value.cell_end}${insertPosition}`;

  // Merge cells for "Represented by" key
  // mergeCellsIfNeeded(worksheet, `${startKeyCell}:${endKeyCell}`);
  // mergeCellsIfNeeded(worksheet, `${startValueCell}:${endValueCell}`);

  worksheet.mergeCells(`${startKeyCell}:${endKeyCell}`)
  worksheet.mergeCells(`${startValueCell}:${endValueCell}`)

  const keyCell = worksheet.getCell(startKeyCell);
  const valueCell = worksheet.getCell(startValueCell);

  keyCell.value = key
  valueCell.value = `: ${value}`

  keyCell.style = styles.key;
  valueCell.style = styles.value
}


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
    termValue,
    customer,
  } = data

  const requireAnnexData = {
    annex_creation_date: annexCreationDate, //
    annex_no: annexNo, //
    contract_no: contractNo, //
    project_name: projectName, //
    item_name: itemName, //
    annex_short_location: annexShortLocation, //
    contract_signed_date: contractSignedDate, //

    p_a_name: customer.company.toUpperCase(),
    p_a_represented: customer.representedBy,
    p_a_address: customer.address,
    p_a_annex_sign_name: customer.representedBy,
  }

  template.substitute(ANNEX_SHEET_NAME, requireAnnexData)
  const buffer = template.generate({ type: 'nodebuffer' })

  const ANNEX_OUTPUT_FILE_NAME = `${ASSETS_ROOT_PATH}/ANNEX-${annexNo}-${contractNo}.xlsx`

  fs.writeFileSync(ANNEX_OUTPUT_FILE_NAME, buffer)

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(ANNEX_OUTPUT_FILE_NAME)
  const worksheet = workbook.getWorksheet('1')

  const annexTermValueResult = termValue

  let pAInfoIndex = EXCEL_POSITION.customer_info.start_position
  let termIndex = EXCEL_POSITION.term.y

  worksheet.insertRow(pAInfoIndex, []);
  mergeCellsIfNeeded(worksheet, `A${pAInfoIndex}:C${pAInfoIndex}`);
  worksheet.getCell(`A${pAInfoIndex}`).value = "Merged Row Data";

  worksheet.insertRow(pAInfoIndex+1, []);
  mergeCellsIfNeeded(worksheet, `A${pAInfoIndex + 1}:C${pAInfoIndex + 1}`);
  worksheet.getCell(`A${pAInfoIndex + 1}`).value = "Merged Row Data 2";


  // worksheet.insertRows(pAInfoIndex, new Array(Object.keys(customer.original ?? {}).length + 2))
  // worksheet.duplicateRow(pAInfoIndex, new Array(Object.keys(customer.original ?? {}).length + 2), true);
  // moveMergesModel(worksheet, pAInfoIndex, new Array(Object.keys(customer.original ?? {}).length + 2));
  
  // await  insertCustomerWithStyle(worksheet, pAInfoIndex, 'Represented by', customer.representedBy, {
  //   key: {
  //     font: {
  //       name: "Times New Roman",
  //       size: 13,
  //       bold: true,
  //     },
  //     alignment: {
  //       vertical: "top"
  //     }
  //   },
  //   value: {
  //     font: {
  //       name: "Times New Roman",
  //       size: 13,
  //       bold: true,
  //     },
  //     alignment: {
  //       vertical: "top"
  //     }
  //   }
  // })
  // pAInfoIndex++;

  // if (customer.optional && customer.optional.position) {
  //   insertCustomerWithStyle(worksheet, pAInfoIndex, 'Position', customer.position, {
  //     key: {
  //       font: {
  //         name: "Times New Roman",
  //         size: 13,
  //       },
  //       alignment: {
  //         vertical: "top"
  //       }
  //     },
  //     value: {
  //       font: {
  //         name: "Times New Roman",
  //         size: 13,
  //       },
  //       alignment: {
  //         vertical: "top"
  //       }
  //     }
  //   })
  //   pAInfoIndex++;
  // }

  // await insertCustomerWithStyle(worksheet, pAInfoIndex, 'Address', customer.address, {
  //   key: {
  //     font: {
  //       name: "Times New Roman",
  //       size: 13,
  //     },
  //     alignment: {
  //       vertical: "top"
  //     }
  //   },
  //   value: {
  //     font: {
  //       name: "Times New Roman",
  //       size: 13,
  //     },
  //     alignment: {
  //       vertical: "top"
  //     }
  //   }
  // })
  // pAInfoIndex++;
  
  // add information:
  // if (customer.optional) {
  //   for (const [key, value] of Object.entries(customer.optional)) {
  //     let _key
  //     switch (key) {
  //       case 'position':
  //         continue;
  //       case 'taxCode':
  //         _key = 'Tax Code'
  //         break
  //       case 'tel':
  //         _key = 'Tel'
  //         break
  //       case 'fax':
  //         _key = 'Fax'
  //         break
  //       case 'website':
  //         _key = 'Website'
  //         break
  //       case 'idCode':
  //         _key = 'Id Code'
  //         break

  //       default: 
  //         continue;
  //     }
      
  //     insertCustomerWithStyle(worksheet, pAInfoIndex, key, value, {
  //       key: {
  //         font: {
  //           name: "Times New Roman",
  //           size: 13,
  //         },
  //         alignment: {
  //           vertical: "top"
  //         }
  //       },
  //       value: {
  //         font: {
  //           name: "Times New Roman",
  //           size: 13,
  //         },
  //         alignment: {
  //           vertical: "top"
  //         }
  //       }
  //     })
  //     pAInfoIndex++;
  //     // termIndex++
  //   }
  // }

  // if (annexType !== ANNEX_CUSTOM_TERM_CHANGE) {
  //   const compileTermValueTemplate = Handlebars.compile(annexTermTemplate[annexType])
  //   annexTermValueResult = compileTermValueTemplate(termValue)
  // }

  // worksheet.getCell(TERM_CHANGES_CELL_NUMBERING).value = '1.1'
  // worksheet.mergeCells(TERM_CHANGES_CELL_RANGE)
  // const mergedCell = worksheet.getCell(TERM_CHANGES_MERGED_CELL)
  // mergedCell.value = annexTermValueResult

  // const totalMergedWidth = getTotalMergedWidth(worksheet, TERM_CHANGES_CELL_RANGE)
  // worksheet.getRow(TERM_CHANGES_CELL_ROW).height = calculateRowHeight(mergedCell.value, totalMergedWidth, DEFAULT_FONT_SIZE) / EXCEL_POINT_PER_PIXEL

  // // Add the logo
  // addHeader(workbook, worksheet, {
  //   filename: HEADER_IMAGE_PATH,
  //   extension: 'svg',
  // })

  await workbook.xlsx.writeFile(ANNEX_OUTPUT_FILE_NAME)
}

export function addHeader(workbook, worksheet, { filename, extension }) {
  const headerId = workbook.addImage({
    filename,
    extension,
  })

  // Get the column width and row height (after merging, they will be the same for the entire merged area)
  const colWidth = worksheet.getColumn(1).width || 10 // Default width if not set
  const rowHeight = worksheet.getRow(1).height || 15 // Default height if not set

  // Approximate conversions from column width and row height to pixels
  const totalColWidthInPixels = colWidth * 7.5 * 10 // Total width for A1 to H1 (8 columns merged)
  const rowHeightInPixels = rowHeight * 1.33 // Height in pixels for row 1

  // Step 3: Place the image in the merged cell (adjust to the size of the merged cell)
  worksheet.addImage(headerId, {
    tl: { col: 0, row: 0 }, // Top-left corner at A1 (column 0, row 0)
    ext: { width: totalColWidthInPixels, height: rowHeightInPixels }, // Fit within merged cell
    editAs: 'oneCell', // Image will move with the merged cell
  })
}

export function getTotalMergedWidth(worksheet, mergeRange) {
  const [start, end] = mergeRange.split(':')
  const startColumn = start.replace(/\d/g, '')
  const endColumn = end.replace(/\d/g, '')

  const startColumnIndex = worksheet.getColumn(startColumn).number
  const endColumnIndex = worksheet.getColumn(endColumn).number

  let totalWidth = 0
  for (let i = startColumnIndex; i <= endColumnIndex; i++) {
    const columnWidth = worksheet.getColumn(i).width || 10 // Width in Excel units (approx 7 pixels per unit)
    totalWidth += columnWidth * 7 // Convert column width to pixels
  }

  return totalWidth
}

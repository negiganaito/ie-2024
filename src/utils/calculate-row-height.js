export function calculateRowHeight(text, totalWidthInPixels, fontSize) {
  // const charactersPerLine = totalWidthInPixels / (fontSize * 0.6); // Approximation: each char ~0.6 of font size in width
  // const lines = Math.ceil(text.length / charactersPerLine);
  // const rowHeightInPoints = lines * fontSize * 1.2; // 1.2 line height multiplier for spacing
  // return rowHeightInPoints;

  const linesFromNewlines = text.split('\n').length // Count explicit line breaks
  const charactersPerLine = totalWidthInPixels / (fontSize * 0.6) // Approximation for characters per line
  const linesFromWidth = Math.ceil(text.length / charactersPerLine)
  const totalLines = Math.max(linesFromNewlines, linesFromWidth) // Take the maximum of both
  const rowHeightInPoints = totalLines * fontSize * 1.2 // Adjust for font size and line height
  return rowHeightInPoints
}

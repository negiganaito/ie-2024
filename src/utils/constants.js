import path from 'node:path'
import { __dirname_ } from './dir-name.js'

// Centralized constants for static values
export const ANNEX_TEMPLATE_PATH = path.join(__dirname_, 'src/assets/annex_1.xlsx')
export const ANNEX_OUTPUT_PATH = path.join(__dirname_, 'src/assets')
export const HEADER_IMAGE_PATH = path.join(__dirname_, 'src/assets/header.svg')

export const ASSETS_ROOT_PATH = path.join(__dirname_, 'src/assets')

// Define other static constants if needed
export const ANNEX_SHEET_NAME = '1'
export const DEFAULT_FONT_SIZE = 13

export const IMAGE_ROOT_PATH = path.join(__dirname_, 'src/assets')

export const TERM_CHANGES_CELL_NUMBERING = 'A32'
export const TERM_CHANGES_CELL_RANGE = 'B32:I32'
export const TERM_CHANGES_MERGED_CELL = 'B32'
export const TERM_CHANGES_CELL_ROW = 32

export const ANNEX_CUSTOM_TERM_CHANGE = 0

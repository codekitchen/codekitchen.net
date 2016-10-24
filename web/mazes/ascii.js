// @flow
import _ from 'underscore'

import { Grid } from './grid'

function renderRow(grid, output, row) {
  output.push("|")
  for (const cell of row) {
    output.push(` ${grid.contentsOf(cell)} `)
    output.push(cell.linked(cell.east) ? ' ' : '|')
  }
  output.push("\n+")
  for (const cell of row) {
    output.push(cell.linked(cell.south) ? '   +' : '---+')
  }
  output.push("\n")
}

export default function ascii(grid: Grid) {
  const output = []
  output.push("+")
  _.times(grid.cols, () => output.push("---+"))
  output.push("\n")

  for (const row of grid.eachRow()) {
    renderRow(grid, output, row)
  }

  return output.join('')
}

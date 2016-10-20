// @flow
import _ from 'underscore'

import { Grid } from './grid'

function renderRow(grid, output, row) {
  output.push("|")
  for (let cell of row) {
    output.push(` ${grid.contentsOf(cell)} `)
    output.push(cell.linked(cell.east) ? ' ' : '|')
  }
  output.push("\n+")
  for (let cell of row) {
    output.push(cell.linked(cell.south) ? '   +' : '---+')
  }
  output.push("\n")
}

export default function ascii(grid: Grid) {
  let output = []
  output.push("+")
  _.times(grid.cols, () => output.push("---+"))
  output.push("\n")

  for (let row of grid.eachRow()) {
    renderRow(grid, output, row)
  }

  return output.join('')
}

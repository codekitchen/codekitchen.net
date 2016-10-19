import _ from 'underscore'

export default function canvas2d(grid, ctx, cellSize = 20) {
  let width = cellSize * grid.cols
  let height = cellSize * grid.rows

  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, width, height)

  for (let cell of grid.eachCell()) {
    renderCell(grid, ctx, cell, cellSize)
  }
}

function renderCell(grid, ctx, cell, cellSize) {
  let x = cell.col * cellSize
  let y = cell.row * cellSize

  let color = grid.backgroundColorFor(cell)
  if (color) {
    ctx.fillStyle = color
  } else {
    ctx.fillStyle = "white"
  }
  ctx.fillRect(x, y, cellSize, cellSize)

  if (!cell.north)
    drawLine(ctx, x, y, x+cellSize, y)
  if (!cell.west)
    drawLine(ctx, x, y, x, y+cellSize)
  if (!cell.linked(cell.east) && !(cell.col == grid.cols-1 && cell.row == grid.rows-1))
    drawLine(ctx, x+cellSize, y, x+cellSize, y+cellSize)
  if (!cell.linked(cell.south))
    drawLine(ctx, x, y+cellSize, x+cellSize, y+cellSize)
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.fillStyle = "black"
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

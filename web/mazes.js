// @flow
import _ from 'underscore'

import { Grid } from './mazes/grid.js'
import GENERATORS from './mazes/generators.js'
import canvas2d from './mazes/canvas2d.js'

import './main.css'

const MIN_CELL_SIZE = 25

// trust that we know grid is a canvas element
const canvas : HTMLCanvasElement = (document.getElementById('grid') : any)
const box = document.getElementById('box')
const ctx = canvas.getContext("2d")

function doMaze() {
  const cols = Math.min(60, Math.floor(box.clientWidth / MIN_CELL_SIZE))
  const rows = Math.min(60, Math.floor(box.clientHeight / MIN_CELL_SIZE))
  const cellSize = Math.floor(Math.min(box.clientWidth / cols, box.clientHeight / rows))
  canvas.width = cols * cellSize
  canvas.height = rows * cellSize

  const mazeDesc = []
  const grid = new Grid(rows, cols)
  const generator = _.sample(GENERATORS)
  mazeDesc.push(generator.name)
  mazeDesc.push(`${rows}x${cols}`)
  generator.on(grid)
  if (Math.random() > 0.6) {
    const pval = Math.random()
    grid.braid(pval)
    mazeDesc.push(`braid: ${pval}`)
  }

  var steps

  if (Math.random() > 0.5) {
    const centerx = Math.floor(grid.cols / 2)
    const xjitter = Math.floor(grid.cols / 4)
    const centery = Math.floor(grid.rows / 2)
    const yjitter = Math.floor(grid.rows / 4)
    const ystart = _.random(-yjitter, yjitter) + centery
    const xstart = _.random(-xjitter, xjitter) + centerx
    const start = grid.get(ystart, xstart)
    if (!start) return
    const distances = start.distancesFull()
    steps = distances.pathTo(grid.get(grid.rows - 1, grid.cols - 1))
    mazeDesc.push('solving')
  } else {
    const start = grid.randomCell()
    steps = start.distances()
    mazeDesc.push('filling')
  }

  console.log(mazeDesc.join(' '))

  function doStep() {
    const step = steps.next()
    if (!step.value) {
      setTimeout(doMaze, 4000)
      return
    }

    grid.distances = step.value
    if (!ctx) {
      document.write("your browser does not support the HTML Canvas element")
      throw "doh"
    }
    canvas2d(grid, ctx, cellSize)

    setTimeout(doStep, 50)
  }

  doStep()
}

doMaze()

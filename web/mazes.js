// @flow
import _ from 'underscore'

import { Grid } from './mazes/grid.js'
import Distances from './mazes/distances.js'
import GENERATORS from './mazes/generators.js'
import canvas2d from './mazes/canvas2d.js'

import './mazes.css'

const MIN_CELL_SIZE = 25

// trust that we know grid is a canvas element
const canvas : HTMLCanvasElement = (document.getElementById('grid') : any)
const box = document.getElementById('box')
const ctx = canvas.getContext("2d")

if (!ctx) {
  document.write("your browser does not support the HTML Canvas element")
  throw "doh"
}

function generateMaze() {
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

  let steps

  if (Math.random() > 0.5) {
    const centerx = Math.floor(grid.cols / 2)
    const xjitter = Math.floor(grid.cols / 4)
    const centery = Math.floor(grid.rows / 2)
    const yjitter = Math.floor(grid.rows / 4)
    const ystart = _.random(-yjitter, yjitter) + centery
    const xstart = _.random(-xjitter, xjitter) + centerx
    const start = grid.get(ystart, xstart) || grid.randomCell()
    const distances = start.distancesFull()
    steps = distances.pathTo(grid.get(grid.rows - 1, grid.cols - 1))
    mazeDesc.push('solving')
  } else {
    const start = grid.randomCell()
    steps = start.distances()
    mazeDesc.push('filling')
  }

  console.log(mazeDesc.join(' '))

  return { cellSize, grid, steps }
}

async function mazesForever() {
  while (true) {
    const { grid, steps, cellSize } = generateMaze()
    for (let dist of steps) {
      grid.distances = dist
      canvas2d(grid, ctx, cellSize)
      await sleep(50)
    }
    await sleep(3500)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

mazesForever()

import _ from 'underscore'

import Grid from './mazes/grid.js'
import RandomWalk from './mazes/random_walk.js'
import canvas2d from './mazes/canvas2d.js'

import './main.css'

let MIN_CELL_SIZE = 25

let canvas = document.getElementById('grid')
let box = document.getElementById('box')
let cols = Math.min(60, Math.floor(box.clientWidth / MIN_CELL_SIZE))
let rows = Math.min(60, Math.floor(box.clientHeight / MIN_CELL_SIZE))
let cellSize = Math.floor(Math.min(box.clientWidth / cols, box.clientHeight / rows))
canvas.width = cols * cellSize
canvas.height = rows * cellSize
let ctx = canvas.getContext("2d")

function doMaze() {
  var grid = new Grid(rows, cols)
  RandomWalk.on(grid)

  var steps

  if (Math.random() > 0.5) {
    let centerx = Math.floor(grid.cols / 2)
    let xjitter = Math.floor(grid.cols / 4)
    let centery = Math.floor(grid.rows / 2)
    let yjitter = Math.floor(grid.rows / 4)
    let ystart = _.random(-yjitter, yjitter) + centery
    let xstart = _.random(-xjitter, xjitter) + centerx
    let start = grid.get(ystart, xstart)
    let distances = start.distancesFull()
    steps = distances.pathTo(grid.get(grid.rows - 1, grid.cols - 1))
  } else {
    let start = grid.get(_.random(0, grid.rows-1), _.random(0, grid.cols-1))
    steps = start.distances()
  }

  function doStep() {
    let step = steps.next()
    if (!step.value) {
      setTimeout(doMaze, 4000)
      return
    }

    grid.distances = step.value
    canvas2d(grid, ctx, cellSize)

    setTimeout(doStep, 50)
  }

  doStep()
}

doMaze()

import Grid from './grid.js'
import _ from 'underscore'

let DIRS = ['north', 'south', 'east', 'west']

export default class RandomWalk {
  static on(grid) {
    let cur = grid.get(_.random(0, grid.rows-1), _.random(0, grid.cols-1))
    var unvisited = grid.size - 1
    var neighbor

    while (unvisited > 0) {
      while (!neighbor) {
        let dir = _.sample(DIRS)
        neighbor = cur[dir]
      }
      if (!neighbor.links.length) {
        unvisited -= 1
        cur.link(neighbor)
      }
      cur = neighbor
      neighbor = null
    }
  }
}

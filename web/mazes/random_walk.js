import Grid from './grid.js'
import _ from 'underscore'

export default class RandomWalk {
  static on(grid) {
    let cur = grid.randomCell()
    var unvisited = grid.size - 1

    while (unvisited > 0) {
      let neighbor = _.sample(cur.neighbors())
      if (!neighbor.links.length) {
        unvisited -= 1
        cur.link(neighbor)
      }
      cur = neighbor
    }
  }
}

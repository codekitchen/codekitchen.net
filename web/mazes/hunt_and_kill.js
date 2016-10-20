// @flow
import _ from 'underscore'

export default class HuntAndKill {
  static on(grid) {
    var cur = grid.randomCell()

    while (cur) {
      let unlinked = _.filter(cur.neighbors(), cell => cell.links.length == 0)
      if (unlinked.length < 1) {
        // hunt phase
        cur = null
        for (let scanCell of grid.eachCell()) {
          if (scanCell.links.length == 0) {
            let linkedNeighbor = _.sample(_.filter(scanCell.neighbors(), cell => cell.links.length > 0))
            if (linkedNeighbor) {
              linkedNeighbor.link(scanCell)
              cur = scanCell
              break
            }
          }
        }
      } else {
        let next = _.sample(unlinked)
        cur.link(next)
        cur = next
      }
    }
  }
}

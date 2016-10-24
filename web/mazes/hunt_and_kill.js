// @flow
import _ from 'underscore'

export default class HuntAndKill {
  static on(grid) {
    let cur = grid.randomCell()

    while (cur) {
      const unlinked = _.filter(cur.neighbors(), cell => cell.links.length == 0)
      if (unlinked.length < 1) {
        // hunt phase
        cur = null
        for (const scanCell of grid.eachCell()) {
          if (scanCell.links.length == 0) {
            const linkedNeighbor = _.sample(_.filter(scanCell.neighbors(), cell => cell.links.length > 0))
            if (linkedNeighbor) {
              linkedNeighbor.link(scanCell)
              cur = scanCell
              break
            }
          }
        }
      } else {
        const next = _.sample(unlinked)
        cur.link(next)
        cur = next
      }
    }
  }
}

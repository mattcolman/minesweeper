/**
 * @author Matt Colman
 * This is a generic 2d Grid class.
 * It allows you to set an item to a grid position,
 * get an item from a grid position,
 * compare 2 items in the grid and
 * find consecutive matches from a start point in
 * a directional line.
 */

class Grid {

  /**
   * Constructor
   * @param  {Int} columns   number of columns in the grid
   * @param  {Int} rows      number of rows in the grid
   * @return {Grid}
   */
  constructor(columns, rows) {
    this.pos = []
    for (let i = 0; i < columns; i++) {
      let a = []
      this.pos.push(a)
      for (let j = 0; j < rows; j++) {
        a.push([])
      }
    }

    this.directions = {
      'n': [0, -1],
      'e': [1, 0],
      's': [0, 1],
      'w': [-1, 0]
    }
  }

  /**
   * Set an item to the grid
   * @public
   * @param {Int} x    x position in the grid
   * @param {Int} y    y position in the grid
   * @param {Object}   the item stored in the grid
   */
  setItem(x, y, item) {
    this.pos[x][y] = item
  }

  /**
   * Get an item from the grid
   * @public
   * @param  {Int} x   x position in the grid
   * @param  {Int} y   y position in the grid
   * @return {*}   GridItem
   */
  getItem(x, y) {
    if (this.pos[x]) return this.pos[x][y]
    return undefined
  }

  /**
   * Compare method
   * @public
   * @param  {*} a ItemA
   * @param  {*} b ItemB
   * @return {Boolean}   A boolean to determine if a and b are a match
   * @note - Override me if you need a custom compare method.
   */
  compare(a, b) {
    return a == b
  }

  /**
   * Finds all matches from an array of directions
   * @public
   * @param  {Int} x            x position in the grid
   * @param  {Int} y            y position in the grid
   * @param  {Array} directions a list of directions to include in the search
   * @param  {Int} min          Minimum allowed matches. If under the minimum will return null.
   * @return {Array}            Array of matches.
   */
  findMatches(x, y, directions, min) {
    let a = this.getItem(x, y)
    var matches = [a]
    for (let str of directions) {
      let direction = this._parseDirection(str)
      matches = matches.concat(this.findMatchByDirection(x, y, direction))
    }

    if (matches.length >= min) {
      return matches
    } else {
      return null
    }
  }

  /**
   * Recursively returns all consecutive matches from an
   * x, y grid position in a direction.
   * @public
   * @param  {Int} x            x position in the grid
   * @param  {Int} y            y position in the grid
   * @param  {Array} direction  a single direction of the search in Array form e.g [1, 1] goes SE
   * @param  {Array} matches    used for the recursive result
   * @return {Array}            Array of matches
   */
  findMatchByDirection(x, y, direction, matches = []) {
    let a = this.getItem(x, y)
    x += direction[0]
    y += direction[1]
    let b = this.getItem(x, y)
    if (this.compare(a, b)) {
      matches.push(b)
      return this.findMatchByDirection(x, y, direction, matches)
    } else {
      return matches
    }
  }

  /**
   * converts a direction string into an Array
   * @private
   * @param  {String} str  e.g. 'ne'
   * @return {Array}       e.g. [-1, 1]
   */
  _parseDirection(str) {
    let directions = str.split('')
    let result = [0, 0]
    for (let d of directions) {
      result[0] += this.directions[d][0]
      result[1] += this.directions[d][1]
    }
    return result
  }

}

export {Grid};



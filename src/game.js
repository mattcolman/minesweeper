/**
 * @author Matt Colman
 */

import {Grid} from './grid';
import {_} from 'lodash';

class Game {

  constructor(config) {
    this.numRows    = 10
    this.numColumns = 10

    this.createBlocks()
    this.blocks = Array.from($('li')) // convert array-like to array
    this.addGrid()
    this.layBombs()
    this.listenForClick()
  }

  layBombs() {
    var shuffledBlocks = _.shuffle(this.blocks)
    var numBombs = 10
    for (var i = 0; i < numBombs; i++) {
      this.placeBomb(shuffledBlocks[i])
    };
    this.drawGrid()
  }

  drawGrid() {
    var data;
    var str;
    var x;
    var y;
    for (var block of this.blocks) {
      [x, y] = this.getXY(block)
      data = this.data[x][y]
      if (data.isBomb) {
        str = 'X'
      } else {
        str = data.number
      }
      $(block).text(str)
    }
  }

  placeBomb(bomb) {
    var [x, y] = this.getXY(bomb)
    this.data[x][y].isBomb = true
    let blocks = this.grid.getNeighbours(x, y)
    for (var block of blocks) {
      [x, y] = this.getXY(block)
      this.data[x][y].number++
    }
  }

  listenForClick(cb) {
    $('ul').click((e)=> {
      let target = e.target
      cb(target)
    })
  }

  destroy() {
    $('ul').off()
    $('ul').empty()
  }

  createBlocks() {
    this.data = []
    for (var j = 0; j < this.numRows; j++) {
      this.data.push([])
      for (var i = 0; i < this.numColumns; i++) {
        this.data[j].push({isBomb: false, number: 0})
        let form = `<li id="${i},${j}"></li>`
        form = $(form)
        $('#game').append(form)
      };
    };
    let blockWidth = $("li").outerWidth(true)
    $('#game').width(this.numColumns*blockWidth)
    $('#game').height(this.numRows*blockWidth)
  }

  addGrid() {
    this.grid = new Grid(this.numColumns, this.numRows)
    this.grid.compare = function(a, b) {
      if (!a || !b) return false
      return a.innerHTML == b.innerHTML
    }

    for (let li of this.blocks) {
      let [x, y] = li.id.split(',')
      this.grid.setItem(x, y, li)
    }
  }

  handleClick(symbol, block) {
    if (this.placeSymbolInBlock(symbol, block)) {
      this.handleWin()
    } else {
      this.handleTurnComplete()
    }
  }

  placeSymbolInBlock(symbol, block) {
    let a
    let [x, y] = this.getXY(block)

    if (this.gravity) block = this.findNextBlockInColumn(x)
    if (!this.isVacant(block)) return

    block.className = symbol;
    block.innerHTML = symbol;

    [x, y] = this.getXY(block);
    if (this.findMatches(x, y)) return true
    return false
  }

  handleTurnComplete() {
    if (++this.turn >= this.numTurns) {
      this.gameOver()
    } else {
      this.nextTurn()
    }
  }

  getXY(block) {
    let [x, y] = block.id.split(',')
    return [parseInt(x), parseInt(y)]
  }

  findNextBlockInColumn(x) {
    let y = -1
    let block, a
    while (true) {
      a = this.grid.getItem(x, y+1)
      if (this.isVacant(a)) {
        y++
        block = a
      } else {
        return block
      }
    }
  }

  isVacant(block) {
    return (block && block.innerHTML == '')
  }

  findMatches(x, y) {
    return (this.grid.findMatches(x, y, ['n', 's'], this.numMatches) ||
            this.grid.findMatches(x, y, ['e', 'w'], this.numMatches) ||
            this.grid.findMatches(x, y, ['ne', 'sw'], this.numMatches) ||
            this.grid.findMatches(x, y, ['nw', 'se'], this.numMatches))
  }

  handleWin() {
    $('ul').off()
    let symbol = this.players[this.turn%2].symbol
    $('#result')[0].className = symbol
    $('#result').text(`${symbol.toUpperCase()} WINS!`)
    // $('#result').show()
  }

  gameOver() {
    $('ul').off()
    $('#result').text('DRAW!')
    // $('#result').show()
  }
}

export {Game};



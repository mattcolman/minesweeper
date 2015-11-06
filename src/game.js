/**
 * @author Matt Colman
 */

import {Grid} from './grid';
import {_} from 'lodash';

class Game {

  constructor(config) {
    this.numRows    = 10
    this.numColumns = 10

    this.symbols = {
      BOMB: 'X',
      FLAG: 'Y'
    }

    this.createBlocks()
    this.blocks = Array.from($('li')) // convert array-like to array
    this.addGrid()
    this.layBombs()

    // disable the context menu
    $(document).on("contextmenu", "ul", function(e){
      return false;
    });

    $('ul').mousedown((e)=>{
      switch (e.which) {
        case 1:
          this.handleSingleClick(e.target)
          break;
        case 2:
          console.log('Middle Mouse button pressed.');
          break;
        case 3:
          this.handleRightClick(e.target)
          break;
        default:
          console.log('You have a strange Mouse!');
      }
    });
  }

  handleSingleClick(target) {
    let data = this.getData(target)
    if (data.open) return;
    let [x, y] = this.getXY(target)
    console.log('clicked on', x, y)
    if (data.isBomb) {
      this.reveal(target)
      this.handleBombClicked()
    } else if (data.number > 0) {
      this.reveal(target)
    } else {
      this.reveal(target)
      this.cluster(x, y)
    }
  }

  handleBombClicked() {
    console.log("OH NO BOMB!!!!!!!!!!!!")
  }

  handleRightClick(target) {
    let data = this.getData(target)
    if (!data.open || data.isFlag) {
      this.toggleFlag(target)
    }
  }

  toggleFlag(block) {
    console.log('place flag!!')
    let data = this.getData(block)
    data.isFlag = !data.isFlag
    if (data.isFlag) {
      $(block).text(this.symbols.FLAG)
    } else {
      $(block).text('')
    }
  }

  cluster(x, y) {
    console.log('cluster time!', x, y)

    // look for corners first. The corners will only
    // reveal if they're empty, NOT if they're numbers.
    var corners = this.getCorners(x, y)
    for (var block of corners) {
      let [x, y] = this.getXY(block)
      let data = this.data[x][y]
      if (data.open == true) continue
      if (data.number == 0) {
        this.reveal(block)
        this.cluster(x, y)
      }
    }

    // reveal north, south, east and west. They will be
    // either empty or a number and we reveal regardless.
    var nesw = this.getNESW(x, y)
    for (var block of nesw) {
      let [x, y] = this.getXY(block)
      let data = this.data[x][y]
      if (data.open == true) continue
      this.reveal(block)
      if (data.number == 0) {
        this.cluster(x, y)
      }
    }
  }

  // CUSTOM GRID FUNCTIONS
  getCorners(x, y) {
    let arr = [
      this.grid.getItemAtDirection(x, y, 'nw'),
      this.grid.getItemAtDirection(x, y, 'ne'),
      this.grid.getItemAtDirection(x, y, 'se'),
      this.grid.getItemAtDirection(x, y, 'sw')
    ]
    return _.compact(arr)
  }

  getNESW(x, y) {
    let arr = [
      this.grid.getItemAtDirection(x, y, 'n'),
      this.grid.getItemAtDirection(x, y, 'e'),
      this.grid.getItemAtDirection(x, y, 's'),
      this.grid.getItemAtDirection(x, y, 'w')
    ]
    return _.compact(arr)
  }

  reveal(block) {
    let data = this.getData(block)
    data.open = true
    if (data.isBomb) {
      $(block).text(this.symbols.BOMB)
    } else {
      $(block).text(data.number)
    }
  }

  getData(block) {
    let [x, y] = this.getXY(block)
    return this.data[x][y]
  }

  layBombs() {
    var shuffledBlocks = _.shuffle(this.blocks)
    var numBombs = 10
    for (var i = 0; i < numBombs; i++) {
      this.placeBomb(shuffledBlocks[i])
    };
    // this.drawGrid()
  }

  // Draw the whole grid. ***** DEBUG ONLY ******
  // drawGrid() {
  //   var data;
  //   var str;
  //   var x;
  //   var y;
  //   for (var block of this.blocks) {
  //     [x, y] = this.getXY(block)
  //     data = this.data[x][y]
  //     if (data.isBomb) {
  //       str = 'X'
  //     } else {
  //       str = data.number
  //     }
  //     $(block).text(str)
  //   }
  // }

  placeBomb(bomb) {
    var [x, y] = this.getXY(bomb)
    this.data[x][y].isBomb = true
    let blocks = this.grid.getNeighbours(x, y)
    for (let block of blocks) {
      this.getData(block).number++
    }
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
        this.data[j].push({isBomb: false, number: 0, open: false})
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

  getXY(block) {
    let [x, y] = block.id.split(',')
    return [parseInt(x), parseInt(y)]
  }

  handleWin() {
    $('ul').off()
    $('#result').text('You WIN!')
  }

  handleLose() {
    $('ul').off()
    $('#result').text('You hit a mine!')
  }
}

export {Game};



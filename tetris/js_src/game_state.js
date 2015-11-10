var GameState = {
  pos: {
    x: 0,
    y: 0
  },
  shape: {
    id: 0,
    ori: 0
  },
  next_shape_id: 0,
  map: [],
  level: 1,
  score: 0,
  last_loop_time: null,
  num_cleared_line: 0,
  state: "start",
};

GameState.get_interval = function () {
  return Math.round((Tetris.base_interval / this.level));
};

GameState.reset_map = function () {
  var w = Tetris.width;
  var h = Tetris.height + Tetris.hidden_height;

  this.map = [];

  var x, y;
  for (y = 0; y < h; y++) {
    this.map.push([]);
    for (x = 0; x < w; x++) {
      this.map[y].push(0);
    }
  }
};

GameState.reset_shape = function () {
  this.pos.x = (Tetris.width - 1) >> 1;
  this.pos.y = Tetris.hidden_height - 1;
  this.shape.id = Shape.get_random_shape_idx();
  this.shape.ori = 0;
};

GameState.reset_score = function () {
  this.score = 0;
  this.num_cleared_line = 0;
  this.level = 1;
};

GameState.get_next_shape = function () {
  this.pos.x = (Tetris.width - 1) >> 1;
  this.pos.y = Tetris.hidden_height - 1;
  this.shape.id = this.next_shape_id;
  this.shape.ori = 0;
  this.next_shape_id = Shape.get_random_shape_idx();
};

GameState.init = function () {
  this.reset_shape();
  this.reset_map();
  this.reset_score();
  this.state = "start";
};

GameState.transverse_map = function (fn, afn, range) {
  var w = Tetris.width;
  var h = Tetris.height + Tetris.hidden_height;
  var x, y;

  var acc = null;

  if (range === undefined) {
    range = [0, h - 1];
  }

  if (range[0] < 0) {
    range[0] = 0;
  } else if (range[0] >= h) {
    range[0] = h - 1;
  }

  if (range[1] < range[0]) {
    range[1] = range[0];
  } else if (range[1] >= h) {
    range[1] = h - 1;
  }

  for (y = range[0]; y <= range[1]; y++) {
    for (x = 0; x < w; x++) {
      if (typeof afn === "function") {
        acc = afn(fn(x, y, GameState.map[y][x]), acc);
      } else {
        fn(x, y, GameState.map[y][x]);
      }
    }
  }

  if (typeof afn === "function") {
    return acc;
  }
};

GameState.transverse_shape_location = function (fn, afn) {
  var pos = GameState.pos;
  var shape = GameState.shape;

  var shape_data = Shape.get_shape_data(shape.id, shape.ori);

  var acc = null;

  var i;
  for (i = 0; i < shape_data.length; i++) {
    var x = pos.x + shape_data[i][0];
    var y = pos.y + shape_data[i][1];

    if (typeof afn === "function") {
      acc = afn(fn(x, y), acc);
    } else {
      fn(x, y);
    }
  }

  if (typeof afn === "function") {
    return acc;
  }
};

GameState.solidify = function () {
  this.transverse_shape_location(function (x, y) {
    GameState.map[y][x] = GameState.shape.id + 1;
  });
};

GameState.check_game_over = function () {
  return (this.map[Tetris.hidden_height][4] > 0 || this.map[Tetris.hidden_height][5] > 0);
};

GameState.increase_score = function (lines) {

  this.score += Tetris.line_score[lines - 1] * this.level;
  this.num_cleared_line += lines;
  this.level = Math.floor(this.num_cleared_line / 10) + 1;

  if (this.level > 100) {
    this.level = 100;
  }
};

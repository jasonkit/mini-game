function GameTimer(routine, interval) {
  var self = this;

  this.routine = routine;
  this.interval = interval;
  this.timer_id = null;

  this.start = function () {
    self.timer_id = setInterval(self.routine, self.interval);
  };

  this.stop = function () {
    if (self.timer_id !== null) {
      clearInterval(self.timer_id);
    }
  };
}

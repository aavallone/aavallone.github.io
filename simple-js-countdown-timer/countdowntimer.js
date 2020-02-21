function CountDownTimer(duration, granularity) {
  this.duration = duration;
  this.granularity = granularity || 1000;
  this.tickFtns = [];
  this.expireFtns = [];
  this.startFtns = [];
  this.running = false;
  this.expired = false;
  this.paused = false;
  this.pausedTime = 0;
  this.pausedTimeStamp = 0;
  this.timerID;
  this.startTimeStamp;
}

CountDownTimer.prototype.start = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  this.expired = false;
  this.paused = false;
  this.pausedTime = 0;
  this.startTimeStamp = Date.now();
  var that = this,
      diff, obj;

  (function timer() {
    that.timerID = setTimeout(timer, that.granularity);
    if(that.paused){
        return;
    }
    diff = that.duration - (((Date.now() - that.startTimeStamp - that.pausedTime) / 1000) | 0);

    if (diff <= 0) {
      diff = 0;
      that.expired = true;
      that.stop();
      that.expireFtns.forEach(function(ftn) {
        ftn.call(this);
      }, that);
    }

    obj = CountDownTimer.parse(diff);
    that.tickFtns.forEach(function(ftn) {
      ftn.call(this, obj.minutes, obj.seconds);
    }, that);
  }());
  that.startFtns.forEach(function(ftn) {
    ftn.call(this);
  }, that);
};

CountDownTimer.prototype.onTick = function(ftn, overrideALL = false) {
  if(overrideALL) this.tickFtns = [];
  if (typeof ftn === 'function') {
    this.tickFtns.push(ftn);
  }
  return this;
};

CountDownTimer.prototype.onExpire = function(ftn, overrideALL = false) {
  if(overrideALL) this.expireFtns = [];
  if (typeof ftn === 'function') {
    this.expireFtns.push(ftn);
  }
  return this;
};

CountDownTimer.prototype.onStart = function(ftn, overrideALL = false) {
  if(overrideALL) this.startFtns = [];
  if (typeof ftn === 'function') {
    this.startFtns.push(ftn);
  }
  return this;
};

CountDownTimer.prototype.isExpired = function() {
  return this.expired;
};

CountDownTimer.prototype.isRunning = function() {
  return this.running && !this.paused;
};

CountDownTimer.prototype.stop = function() {
  this.running = false;
  this.paused = false;
  clearTimeout(this.timerID);
};

CountDownTimer.prototype.reset = function() {
  this.stop();
  this.expired = false;
};

CountDownTimer.prototype.pause = function() {
  if(this.paused) return;
  this.paused = true;
  this.pausedTimeStamp = Date.now();
};

CountDownTimer.prototype.startResume = function() {
  this.paused = false;
  if(this.running){
    this.pausedTime += Date.now() - this.pausedTimeStamp;
  }else{
    this.start();
  }
};

CountDownTimer.prototype.setDuration = function(duration) {
  this.duration = duration;
};

CountDownTimer.prototype.setGranularity = function(granularity) {
  this.granularity = granularity;
};

CountDownTimer.parse = function(seconds) {
  return {
    'minutes': (seconds / 60) | 0,
    'seconds': (seconds % 60) | 0
  };
};
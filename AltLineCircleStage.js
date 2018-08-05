var w = window.innerWidth, h = window.innerHeight;
console.log(w);
console.log(h);
var nodes = 5;
var AltLineCircleStage = (function () {
    function AltLineCircleStage() {
        this.canvas = document.createElement('canvas');
        this.linkedALC = new LinkedALC();
        this.animator = new Animator();
        this.initCanvas();
    }
    AltLineCircleStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    AltLineCircleStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.linkedALC.draw(this.context);
    };
    AltLineCircleStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.linkedALC.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.linkedALC.update(function () {
                        _this.animator.stop();
                    });
                });
            });
        };
    };
    AltLineCircleStage.init = function () {
        var stage = new AltLineCircleStage();
        stage.render();
        stage.handleTap();
    };
    return AltLineCircleStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.prevScale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += 0.1 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            }, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var ALCNode = (function () {
    function ALCNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    ALCNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new ALCNode(this.i + 1);
            this.next.prev = this;
        }
    };
    ALCNode.prototype.draw = function (context) {
        var gap = w / nodes;
        var index = this.i % 2;
        var r = gap / 4;
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(this.state.scale - 0.5, 0)) * 2;
        var scale1 = (1 - index) * sc1 + (1 - sc1) * index;
        context.strokeStyle = 'white';
        context.lineWidth = Math.min(w, h) / 60;
        context.lineCap = 'round';
        context.save();
        context.translate(gap * this.i + gap * sc2 + gap / 2, h / 2);
        context.beginPath();
        for (var i = 0; i < 360; i++) {
            var x = r * scale1 * Math.cos(i * Math.PI / 180);
            var y = r * Math.sin(i * Math.PI / 180);
            if (i == 0) {
                context.moveTo(x, y);
            }
            else {
                context.lineTo(x, y);
            }
        }
        context.stroke();
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    ALCNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    ALCNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    ALCNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return ALCNode;
})();
var LinkedALC = (function () {
    function LinkedALC() {
        this.curr = new ALCNode(0);
        this.dir = 1;
    }
    LinkedALC.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedALC.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    LinkedALC.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    return LinkedALC;
})();

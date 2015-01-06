/// <reference path="../libs/ds/easeljs/easeljs.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
window.onload = function () { return new demo.Main(); };
var demo;
(function (demo) {
    /*
     * メインのクラス
     * */
    var Main = (function () {
        function Main() {
            var _this = this;
            // ステージを準備
            this._stage = new createjs.Stage(document.getElementById("myCanvas"));
            // Tickerを作成
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.addEventListener("tick", function (event) { return _this.tickeHandler(event); });
            // メインのレイヤーを配置
            this._mainLayer = new MainLayer();
            this._stage.addChild(this._mainLayer);
            // リサイズイベント
            this.resizeHandler();
            window.addEventListener("resize", function () { return _this.resizeHandler(); });
        }
        /*
         * Tick Handler
         * */
        Main.prototype.tickeHandler = function (event) {
            if (!event.paused) {
                this._stage.update();
            }
        };
        /*
         * リサイズのイベント処理
         * */
        Main.prototype.resizeHandler = function () {
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            // ステージのサイズをwindowのサイズに変更
            this._stage.canvas.width = windowWidth;
            this._stage.canvas.height = windowHeight;
            // メインレイヤーにリサイズイベントを通知
            this._mainLayer.resizeHandler(windowWidth, windowHeight);
        };
        return Main;
    })();
    demo.Main = Main;
    /*
     * メインのレイヤー
     * */
    var MainLayer = (function (_super) {
        __extends(MainLayer, _super);
        function MainLayer() {
            var _this = this;
            _super.call(this);
            this._bg = new createjs.Shape();
            this.drawBG(800, 600);
            this.addChild(this._bg);
            this._particleEmitter = new ParticleEmitter(); // パーティクル発生装置のインスタンスを作成
            this.addChild(this._particleEmitter);
            this.addEventListener("tick", function (event) { return _this.tickHandler(event); });
            this.addEventListener("mousedown", function (event) { return _this.mouseDownHandler(event); });
            this.addEventListener("pressup", function (event) { return _this.mouseUpHandler(event); });
        }
        MainLayer.prototype.resizeHandler = function (windowWidth, windowHeight) {
            this.drawBG(windowWidth, windowHeight);
        };
        /*
        * 指定の大きさの背景を描画
        * */
        MainLayer.prototype.drawBG = function (bgWidth, bgHeight) {
            this._bg.graphics.clear();
            this._bg.graphics.beginLinearGradientFill(["#001529", "#000911"], [0, 1], 0, 0, 0, bgHeight).drawRect(0, 0, bgWidth, bgHeight).endFill();
        };
        /*
        * マウスを押した時の処理
        * */
        MainLayer.prototype.mouseDownHandler = function (event) {
            this._isMouseDown = true;
        };
        /*
         * マウスを離した時の処理
         * */
        MainLayer.prototype.mouseUpHandler = function (event) {
            this._isMouseDown = false;
        };
        /*
         * Tickイベントで実行される処理
         * */
        MainLayer.prototype.tickHandler = function (event) {
            // マウスの座標
            var mouseX = this.getStage().mouseX;
            var mouseY = this.getStage().mouseY;
            // パーティクル発生装置の座標を更新
            this._particleEmitter.update(mouseX, mouseY);
            if (this._isMouseDown) {
                // マウスを押している場合にパーティクル発生命令
                this._particleEmitter.emitParticle();
            }
        };
        return MainLayer;
    })(createjs.Container);
    /*
     * パーティクル発生装置
     * */
    var ParticleEmitter = (function (_super) {
        __extends(ParticleEmitter, _super);
        function ParticleEmitter() {
            _super.call(this);
            // アニメーション中のパーティクルを格納する配列
            this._animationParticles = [];
            // パーティクルのオブジェクトプール。アニメーションがされていないパーティクルがここに待機している。
            this._particlePool = [];
            this._emitX = 0;
            this._emitY = 0;
            this._vx = 0;
            this._vy = 0;
        }
        /*
        * MainLayerのtickイベント毎に実行される処理
        * */
        ParticleEmitter.prototype.update = function (goalX, goalY) {
            // 発生装置はgoalに徐々に近づいていく。
            var dx = goalX - this._emitX;
            var dy = goalY - this._emitY;
            var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)); // 斜め方向の移動距離
            var rad = Math.atan2(dy, dx); // 移動角度
            this._vx = Math.cos(rad) * d * 0.1; // 速度の更新
            this._vy = Math.sin(rad) * d * 0.1; // 速度の更新
            this._emitX += this._vx;
            this._emitY += this._vy;
            // アニメーション中のパーティクルの状態を更新
            this.updateParticles();
        };
        /*
         *　パーティクルを発生させる
         * */
        ParticleEmitter.prototype.emitParticle = function () {
            var particle = this.getParticle();
            particle.init(this._emitX, this._emitY, this._vx, this._vy);
            this.addChild(particle);
            // アニメーション中のパーティクルとして設定
            this._animationParticles.push(particle);
        };
        /*
         *　パーティクルのアニメーション
         * */
        ParticleEmitter.prototype.updateParticles = function () {
            for (var i = 0; i < this._animationParticles.length; i++) {
                var particle = this._animationParticles[i];
                if (!particle.isDead) {
                    particle.update();
                }
                else {
                    // particleを取り除く
                    this.removeParticle(particle, i);
                }
            }
        };
        /*
         * オブジェクトプールからパーティクルを取得。
         * プールにパーティクルが無ければ新規作成
         * */
        ParticleEmitter.prototype.getParticle = function () {
            if (this._particlePool.length > 0) {
                return this._particlePool.shift();
            }
            else {
                return new Particle();
            }
        };
        /*
         * パーティクルを取り除く。
         * */
        ParticleEmitter.prototype.removeParticle = function (particle, animationIndex) {
            // Containerからパーティクルをremove
            this.removeChild(particle);
            // アニメーションのパーティクルから取り除く。
            this._animationParticles.splice(animationIndex, 1);
            if (this._particlePool.indexOf(particle) == -1) {
                // プールにパーティクルが無いことを確認して格納
                this._particlePool.push(particle);
            }
        };
        return ParticleEmitter;
    })(createjs.Container);
    /*
     * パーティクルのクラス
     * */
    var Particle = (function (_super) {
        __extends(Particle, _super);
        function Particle() {
            _super.call(this);
            // 加算で重ねる
            this.compositeOperation = "lighter";
            this.mouseEnabled = false;
        }
        /*
         * パーティクルの初期化
         * @param parentVX, parentVY :親コンテナの速度。パーティクルの速度に影響を与える。
         * */
        Particle.prototype.init = function (emitX, emitY, parentVX, parentVY) {
            this.x = emitX;
            this.y = emitY;
            this._life = 70 + Math.random() * 20;
            this._count = 0;
            this._vx = parentVX + (Math.random() - 0.5) * 4;
            this._vy = parentVY + 4 + Math.random() * 2;
            this.isDead = false;
            this.alpha = 1;
            var size = 30 + Math.random() * 20;
            var colorHSL = createjs.Graphics.getHSL(new Date().getTime() / 20 + Math.random() * 5, 100, 50);
            // 既存のグラフィックを一旦クリア
            this.graphics.clear();
            // ぼんやりとした円を描く
            this.graphics.beginRadialGradientFill([colorHSL, "#000000"], [0, 1], 0, 0, size / 2, 0, 0, size);
            this.graphics.drawCircle(0, 0, size);
            this.graphics.endFill();
        };
        /*
         * パーティクルの時間経過処理。
         * _countがパーティクルの年齢。
         * _lifeを超えたら死亡する。
         *
         * */
        Particle.prototype.update = function () {
            this._count++;
            if (this._count <= this._life) {
                this.x += this._vx;
                this._vy -= 0.5;
                this.y += this._vy;
                // 死にそうになったら点滅を開始
                if (this._count >= this._life / 2) {
                    // this.alpha = 0.6 + Math.random() * 0.4;
                    this.alpha = (1 - this._count / this._life);
                }
            }
            else {
                // 寿命が来たらフラグを立てる
                this.isDead = true;
            }
        };
        return Particle;
    })(createjs.Shape);
})(demo || (demo = {}));
//# sourceMappingURL=main.js.map
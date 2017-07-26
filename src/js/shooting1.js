"use strict"

var canvas, ctx;

var FPS = 30;

var MSPF = 1000 / FPS;

var ENEMIES = 10;

var KEYS = new Array(256);

for (var i=0; i<KEYS.length; i++) {
  KEYS[i] = false;
}

var BULLETS = 5;

var FIRE_INTERVAL = 20;

var STAR_INTERVAL = 20;

var img_player;
var img_enemy;
var img_player_bullet;

var player_x, player_y;

var player_bullets_x = new Array(BULLETS);
var player_bullets_y = new Array(BULLETS);

var enemies_x = new Array(ENEMIES);
var enemies_y = new Array(ENEMIES);

var killed = 0;

var player_hp;

var player_bullets_hp = new Array(BULLETS);

var enemies_hp = new Array(ENEMIES);

var player_fire_interval = 0;

var player_star_interval = 0;

var movePlayer = function() {

  if (player_hp <= 0) {
    return;
  }

  var SPEED = 2;

  var RIGHT = 39;
  var LEFT  = 37;
  var SPACE = 32;

  if (KEYS[RIGHT] && (player_x + img_player.width) < canvas.width) {
    player_x += SPEED;
  }

  if (KEYS[LEFT] && player_x > 0) {
    player_x -= SPEED;
  }

  if (KEYS[SPACE] && player_fire_interval == 0) {
    for (var i=0; i<BULLETS; i++) {
      if (player_bullets_hp[i] == 0) {
        player_bullets_x[i] = player_x;
        player_bullets_y[i] = player_y;
        player_bullets_hp[i] = 1;
        player_fire_interval = FIRE_INTERVAL;
        break;
      }
    }
  }

  if (player_fire_interval > 0) {
    player_fire_interval--;
  }

  if (player_x < 0) {
    player_x = 0;
  } else if ((player_x + img_player.width) > canvas.width) {
    player_x = canvas.width - img_player.width;
  }
};

// プレイヤーの弾の移動処理を定義
var movePlayerBullets = function() {
  // 上下左右の移動速度を定義
  var SPEED = -6;

  // 各弾ごとに処理を行う
  for(var i=0; i<BULLETS; i++) {
    // ヒットポイントを確認し、生きている場合のみ処理をする
    if(player_bullets_hp[i] <= 0) {
      // ループの残りのステップを無視して次のループに行く場合
      // は `continue` を指定する
      continue;
    }

    // 弾のy座標を少し増やす（減らす）
    player_bullets_y[i] += SPEED;

    // 弾が上画面にはみ出た場合はHPを0にして未使用状態に戻す
    if (player_bullets_y[i] < img_player_bullet.height) {
      player_bullets_hp[i] = 0;
    }
  }
};

var hitCheck = function(x1, y1, obj1, x2, y2, obj2) {
  var cx1, cy1, cx2, cy2, r1, r2, d;
  // 中心座標の取得
  cx1 = x1 + obj1.width/2;
  cy1 = y1 + obj1.height/2;
  cx2 = x2 + obj2.width/2;
  cy2 = y2 + obj2.height/2;
  // 半径の計算
  r1 = (obj1.width+obj1.height)/4;
  r2 = (obj2.width+obj2.height)/4;
  // 中心座標同士の距離の測定
  // Math.sqrt(d) -- dのルートを返す
  // Math.pow(x, a) -- xのa乗を返す
  d = Math.sqrt(Math.pow(cx1-cx2, 2) + Math.pow(cy1-cy2, 2));
  // 当たっているか判定
  // ちなみに `return r1+r2 > d;` とだけ書いてもOK
  if(r1 + r2 > d) {
    // 当たってる
    return true;
  } else {
    // 当たっていない
    return false;
  }
};


var moveEnemies = function() {

  var SPEED = 2;

  for (var i=0; i<ENEMIES; i++) {

    if (enemies_hp[i] <= 0) {
      continue;
    }

    enemies_y[i] += SPEED;

    if (enemies_y[i] > canvas.height) {
      enemies_y[i] = -img_enemy.height;

      enemies_x[i] = Math.random() * (canvas.width - img_enemy.width);
    }
  }
};

var mainloop = function() {
  var startTime = new Date();

  movePlayer();

  moveEnemies();

  if (player_hp > 0) {
    for (var i=0; i<ENEMIES; i++) {
      if (enemies_hp[i] > 0) {
        if (hitCheck(player_x, player_y, img_player,
                     enemies_x[i], enemies_y[i], img_enemy)) {
          player_hp -= 1;
          enemies_hp[i] -= 1;
        }
      }
    }
  }

  // プレイヤー弾と敵キャラの当たり判定（プレイヤーが生きている場合）
  if(player_hp > 0 && player_star_interval == 0) {
    for(var i=0; i<ENEMIES; i++) {
      // 敵が死んでいる場合はスルーする
      if(enemies_hp[i] > 0) {
        for(var j=0; j<BULLETS; j++) {
          // 弾が死んでいる場合はスルーする
          if(player_bullets_hp[j] > 0) {
            if(hitCheck(player_bullets_x[j],
              player_bullets_y[j],
              img_player_bullet,
              enemies_x[i],
              enemies_y[i],
              img_enemy)){
                // 当たっているのでお互いのHPを1削る
                player_bullets_hp[j] -= 1;
                enemies_hp[i] -=1;
              }
          }
        }
      }
    }
  }

  if (player_star_interval > 0) {
    player_star_interval--;
  }

  redraw();

  var deltaTime = (new Date()) - startTime;
  var interval = MSPF - deltaTime;
  if (interval > 0) {
    setTimeout(mainloop, interval);
  } else {
    mainloop();
  }
};

window.onkeydown = function(e) {
  KEYS[e.keyCode] = true;
};
window.onkeyup = function(e) {
  KEYS[e.keyCode] = false;
};

var redraw = function() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (player_hp > 0) {
    ctx.drawImage(img_player, player_x, player_y);
  }

  for (var i=0; i<BULLETS; i++) {
    if (player_bullets_hp[i] > 0) {
      ctx.drawImage(img_player_bullet,
                    player_bullets_x[i],
                    player_bullets_y[i]);
    }
  }

  for (var i=0; i<ENEMIES; i++) {
    if (enemies_hp[i] > 0) {
      ctx.drawImage(img_enemy, enemies_x[i], enemies_y[i]);
    }
  }

  ctx.save();

  ctx.fillStyle = '#fff';
  ctx.fillRect(10, canvas.height-10, 10 * 5, 5);
  ctx.fillStyle = '#f00'
  ctx.fillRect(10, canvas.height-10, player_hp * 5, 5);

  var text = 'Killed: ' + killed + '/' + ENEMIES;

  var width = ctx.measureText(text).width;

  ctx.fillStyle = '#fff';
  ctx.fillText(text,
               canvas.width - 10 - width,
               canvas.height - 10);

  ctx.restore();
};

window.onload = function() {

  canvas = document.getElementById('screen');
  ctx = canvas.getContext('2d');
  //ctx.fillStyle = '#fff';

  img_player = document.getElementById('player');
  img_player_bullet = document.getElementById('player_bullet');
  img_enemy = document.getElementById('enemy');

  player_x = (canvas.width - player.width) / 2;
  player_y = (canvas.height -player.height) - 20;
  player_hp = 10;

  for (var i=0; i<BULLETS; i++) {
    player_bullets_x[i] = 0;
    player_bullets_y[i] = 0;
    player_bullets_hp[i] = 0;
  }

  for (var i=0; i<ENEMIES; i++) {
    enemies_x[i] = Math.random() * (canvas.width - img_enemy.width);
    enemies_y[i] = Math.random() * (canvas.height - img_enemy.height);
    enemies_hp[i] = 2;
  }

  mainloop();

};

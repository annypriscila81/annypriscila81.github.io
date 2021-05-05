class Game {

  engine;
  config;
  level;
  player;
  enemies;
  items;
  volume;

  sounds = {
    track: null,
    start: null,
    gameover: null,
    levelup: null,
    collect: null,
    collision: null
  };

  constructor(config) {

    this.config = config.game;
    
    const { sounds } = this.config;

    this.config = config.game;
    this.resources = new Resources();
    this.engine = new Engine(this, config.engine, config.resources);

    this.level = config.game.level;
    this.player = new Player(this, config.player);

    this.sounds.track = Utils.registerSound(sounds.track.src, sounds.track.volume);
    this.sounds.start = Utils.registerSound(sounds.start.src, sounds.start.volume);
    this.sounds.gameover = Utils.registerSound(sounds.gameover.src, sounds.gameover.volume);
    this.sounds.levelup = Utils.registerSound(sounds.levelup.src, sounds.levelup.volume);
    this.sounds.collect = Utils.registerSound(sounds.collect.src, sounds.collect.volume);
    this.sounds.collision = Utils.registerSound(sounds.collision.src, sounds.collision.volume);

    /* incia a música de fundo, assim que o jogo começa. */
    this.sounds.track.play();

    const volume = document.body.querySelector(".volume_controls");
    volume.addEventListener('click', () => {

      const controls = Array.from(volume.querySelectorAll('span.fas'));

      this.volumeToggle();

      controls.forEach(control => control.classList.toggle('d-none'));
    })

    this.enemies = config.game.enemies.map(config => new Enemy(this, config));
    this.items = config.game.items.map(config => new Item(this, config));
  }

  volumeToggle = () => {

    if (this.sounds.track.paused) this.sounds.track.play();
    else this.sounds.track.pause();
  }

  updateTopPanel = () => {

    // Atualiza o level
    const level = document.querySelector('.level-number');
    level.innerHTML = this.level;

    // Atualiza o score
    const playerScore = document.querySelector('.points');
    playerScore.innerHTML = this.player.points;

    // Atualiza as vidas
    const livesContainer = document.getElementById('lives_container');
    livesContainer.innerHTML = "";

    // Atualiza progresso
    this.player.updateProgress();

    for(let index = 0, max = this.player.lives; index < max; index++){

      const lifeIcon = document.createElement('i');
      
      lifeIcon.setAttribute("class", "fa fa-heart heart-lives");
      livesContainer.appendChild(lifeIcon);
    }
  };

  startGettingInput = () => {

    const input = direction => this.player.handleInput(direction);

    /* quais direções o jogador pode ir */
    document.addEventListener('keyup', (e) => {

      const allowedKeys = {
        39: 'right',
        37: 'left'
      };

      input(allowedKeys[e.keyCode]);
    });

    // Setas de direção para dispositivos móveis.
    document.getElementById('arrow-right')
            .addEventListener('click', () => input('right'));

    document.getElementById('arrow-left')
            .addEventListener('click', () => input('left'));
  };

  showStartScreen = () => {

    const startScreen = document.querySelector('#startScreen');
    const buttonPlay = document.querySelector('#playGame');

    const startGame = () => {

      this.sounds.start.play();
      startScreen.classList.remove('show');
      this.engine.startExecution();
      this.startGettingInput();
    }
    const spaceBarStartGame = (e) => { 

      if (e.keyCode == 32) startGame();
      document.removeEventListener('keyup', spaceBarStartGame);
    };

    startScreen.classList.add('show');

    buttonPlay.focus();
    buttonPlay.addEventListener('click', startGame);
    document.addEventListener('keyup', spaceBarStartGame);

    this.updateTopPanel();
  };

  goToNextLevel = () => {

    let counter;
    let timeout = 3; // cooldown até trocar de level

    const overlay = document.querySelector("#canvas_container .overlay");
    const counterElement = overlay.querySelector(".overlay_countdown");

    overlay.classList.toggle('d-none');

    this.level++;
    this.engine.pauseExecution();
    
    this.sounds.levelup.play();
    this.updateTopPanel();

    counterElement.innerHTML = timeout;
    timeout--;

    counter = setInterval(() => {

      counterElement.innerHTML = timeout;

      if(timeout < 0) {

        clearInterval(counter);

        this.engine.startExecution()
        this.enemies.forEach(enemy => enemy.goToNextLevel());

        overlay.classList.toggle('d-none');

        counterElement.innerHTML = ""
      }

      timeout--;

    }, 1000);
  };

  showGameOverScreen = () => {

    const resetGame = () => {

      this.sounds.gameover.pause();
      this.sounds.gameover.currentTime = 0;
      this.sounds.track.play();
      this.sounds.start.play();

      gameOverScreen.classList.remove('show');

      this.reset();
    }
    const spaceBarResetGame = (e) => { 

      if (e.keyCode == 32) resetGame();
      document.removeEventListener('keyup', spaceBarResetGame);
    };

    this.engine.pauseExecution();

    this.sounds.track.pause();
    this.sounds.track.currentTime = 0;
    this.sounds.gameover.play();

    const gameOverScreen = document.querySelector('#gameOverScreen');
          gameOverScreen.classList.add('show');

    const finalScore = document.querySelector('.points-finalScore');
          finalScore.innerHTML = this.player.points;
    
    const buttonTryAgain = document.querySelector('#tryAgain');
          buttonTryAgain.focus();
          buttonTryAgain.addEventListener('click', resetGame);

    document.addEventListener('keyup', spaceBarResetGame);
  };

  reset = () => {

    this.level = this.config.level;
    this.player.reset();

    for(let index = 0, max = this.enemies.length; index < max; index++){
      this.enemies[index].reset();
    };

    this.engine.startExecution();

    this.updateTopPanel();
  };
}

class Enemy {

  game;
  config;

  speed = 0;

  constructor(game, config) {

    const { sprite } = config;

    this.config = config;
    this.game = game;

    this.sprite = sprite;

    /* Coordenada no eixo vertical que os inimigos spawnam, quando chegam 
     * ao fim da tela ou colidem com o jogador. */
    this.game.config.spawn = { yCoord: -180 };
    this.x = this.game.config.spawn.yCoord;

    this.reset();
  }

  /* O parâmetro dt é o delta de tempo entre game ticks.
   * 
   * Você deve multiplicar qualquer movimento por este parâmetro.
   * Isso garante que o jogo execute na mesma velocidade, em qualquer computador. */
  update = (dt) => {
  
    this.y = this.y + (this.speed * dt);
    
    /* Quando o inimigo alcança a borda inferior, ele recebe uma nova 
     * coordenada vertical. */
    if (this.y > this.game.engine.canvas.height) {

      this.x = this.getRandomColumn();
      this.y = this.game.config.spawn.yCoord;
    }
  };
  
  reset = () => {

    this.x = this.getRandomColumn();
    this.y = this.game.config.spawn.yCoord;

    this.setSpeed();
  };
  
  goToNextLevel = () => {

    this.x = this.getRandomColumn();
    this.y = this.game.config.spawn.yCoord;

    this.setSpeed();
  };
  
  render = () => {
    this.game.engine.ctx.drawImage(this.game.resources.get(this.sprite), this.x, this.y);
  };
  
  checkCollisions = () => {

    /* Confere se o inimigo e jogador estão na mesma linha do grid. */
    if (this.x === this.game.player.x) {
      
      /* Confere se o inimigo e jogador estão se tocado, verticalmente. */
      const enemyBottomSideY = this.y + 101;
      const playerBottomSideY = this.game.player.y;

      if((enemyBottomSideY > playerBottomSideY) && !(playerBottomSideY < this.y)) {
        this.game.player.hit();
        this.reset();
      }
    }
  };

  setSpeed = () => {

    this.speed = 0;

    for(let index = 0, max = this.game.level; index < max; index++){
      this.speed += Utils.getRandomInt(100,200);
    };
  };

  getRandomColumn = () => {

    let randomColumn = Utils.getRandomInt(0, this.game.engine.column.count - 1) * 100;

    return randomColumn
  }
}

class Item {

  game;
  config;

  speed = 0;

  constructor(game, config) {

    const { sprite, xCoord } = config;

    this.config = config;
    this.game = game;

    this.sprite = sprite;
    this.x = xCoord;

    this.reset();
  }

  /* O parâmetro dt é o delta de tempo entre game ticks.
   * 
   * Você deve multiplicar qualquer movimento por este parâmetro.
   * Isso garante que o jogo execute na mesma velocidade, em qualquer computador. */
  update = (dt) => {
  
    this.y = this.y + (this.speed * dt);
    
    /* Quando o inimigo alcança a borda inferior, ele recebe uma nova 
     * coordenada vertical. */
    if (this.y > this.game.engine.canvas.height) {

      this.x = this.getRandomColumn();
      this.y = this.game.config.spawn.yCoord;
    }
  };
  
  reset = () => {

    this.x = this.getRandomColumn();
    this.y = this.game.config.spawn.yCoord;

    this.setSpeed();
  };
  
  goToNextLevel = () => {

    this.x = this.getRandomColumn();
    this.y = this.game.config.spawn.yCoord;

    this.setSpeed();
  };
  
  render = () => {
    this.game.engine.ctx.drawImage(this.game.resources.get(this.sprite), this.x, this.y);
  };
  
  /* Para determinar se o jogador encostou em algo, precisamos 
   * conferir as coordenadas das entidades. */
  checkCollisions = () => {

    /* Confere se o item e jogador estão na mesma linha do grid. */
    if (this.x === this.game.player.x) {
      
      const enemyBottomSideY = this.y + 101;
      const playerBottomSideY = this.game.player.y;

      /* Confere se o item e jogador estão na mesma coluna do grid. */
      if((enemyBottomSideY > playerBottomSideY) && !(playerBottomSideY < this.y)) {

        this.game.player.collected();

        if (this.game.player.points >= this.game.player.required_xp) this.game.player.goToNextLevel();
        this.reset();
      }
    }
  };

  setSpeed = () => {

    this.speed = 0;

    for(let index = 0, max = this.game.level; index < max; index++){
      this.speed += Utils.getRandomInt(100,200);
    };
  };

  /* configura spawn aleatório no eixo horizontal */
  getRandomColumn = () => {

    let randomColumn = Utils.getRandomInt(0, this.game.engine.column.count - 1) * 100;

    return randomColumn
  }
}

class Player {

  game;
  config;
  required_xp;

  constructor(game, config) {

    const { sprite, lives, points, required_xp } = config;

    
    this.config = config;
    
    this.game = game;
    this.sprite = sprite;
    this.required_xp = required_xp;
    
    this.lives = lives;
    this.points = points;

    this.backToInitialPosition();
  }
  
  reset = () => {

    this.lives = this.config.lives;
    this.points = this.config.points;
    this.required_xp = this.config.required_xp;

    this.backToInitialPosition();
  };
  
  backToInitialPosition = () => {

    const middleColumn = Math.floor(this.game.engine.column.count/2) * 100;
    const lastRow = (this.game.engine.row.images.length * 100) - 200;

    this.x = this.config.coords ? this.config.coords.x : middleColumn;
    this.y = this.config.coords ? this.config.coords.y : lastRow;
  };
  
  hit = () =>{

    const canvasContainer = document.querySelector("#canvas_container");
  
    this.lives--;

    this.game.sounds.collision.pause();
    this.game.sounds.collision.currentTime = 0;
    this.game.sounds.collision.play();

    canvasContainer.classList.add('anim--shake');
    canvasContainer.addEventListener('animationend', () => {

      canvasContainer.classList.remove('anim--shake');
    })

    this.game.updateTopPanel();

    if (this.lives === 0) this.game.showGameOverScreen();
  };

  collected = () =>{
  
    this.points += 10;

    this.game.sounds.collect.pause();
    this.game.sounds.collect.currentTime = 0;
    this.game.sounds.collect.play();

    this.game.updateTopPanel();
  };

  updateProgress = () => {

    let progress, result;

    progress = document.body.querySelector('.panel .progress-bar');
    result = (this.points * 100) / this.required_xp;
    progress.style.width = `${result}%`;
  }
  
  render = () => {
    this.game.engine.ctx.drawImage(this.game.resources.get(this.sprite), this.x, this.y);
  };
  
  goToNextLevel = () =>{

    this.required_xp = this.required_xp + this.points;
    this.backToInitialPosition();

    this.game.goToNextLevel();
  };
  
  handleInput = (key) => {

    switch (key) {
      case 'right':
        const lastColumn = this.game.engine.column.count * 100;
        this.x += 100;
        if (this.x === lastColumn) this.x = lastColumn - 100;
        break;

      case 'left':
        this.x -= 100;
        if (this.x === -100) this.x = 0;
        break;
    }
  };
}

/*
 ****** UTILS ******
*/

class Utils {

  static getRandomInt = (min, max) => {

    min = Math.ceil(min);
    max = Math.floor(max);
  
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // Fisher-Yates shuffle algorithm
  static shuffleArray(array) {

    let value, index;
    let iteration = array.length;
  
    while (iteration) {
  
      index = Math.floor(Math.random() * iteration--);
  
      value = array[iteration];
      array[iteration] = array[index];
      array[index] = value;
    }
  
    return array;
  }

  static registerSound(src, volume = 0.5) {

    let sound = document.createElement("audio");

    sound.src = src;
    sound.volume = volume;

    sound.setAttribute("preload", "auto");
    sound.setAttribute("controls", "none");

    sound.style.display = "none";

    document.body.appendChild(sound);

    return sound
  }
}

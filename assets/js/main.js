/* Esta variável deve ser configurada de acordo com 
 * o nome do repositório GitHub / Gitlab. */
var baseURL = "./";

/* configurações gerais */
const game = {
  level: 1, // estágio inicial

  /* basta inserir mais elementos, para inserir mais lixo não coletável. */
  enemies: [
    { sprite: `${baseURL}/assets/img/objects/radioativo.png` },
    { sprite: `${baseURL}/assets/img/objects/hospitalar.png`  },
    { sprite: `${baseURL}/assets/img/objects/vidro.png` }
  ],

  /* Para cada elemento inserido na array, um item coletável é inserido no jogo.
   * Basta inserior mais elementos, se quiser inserir mais itens no jogo. */
  items: [
    { sprite: `${baseURL}/assets/img/objects/plastico.png` },
    { sprite: `${baseURL}/assets/img/objects/plastico.png` }
  ],

  sounds: {
    /* música de fundo */
    track: {
      src: `${baseURL}/assets/audio/soundtrack.webm`,
      volume: 0.2
    },
    
    /* som de início de jogo */
    start: {
      src: `${baseURL}/assets/audio/effects/start.ogg`,
      volume: 0.5
    },

    /* som de gameover */
    gameover: {
      src: `${baseURL}/assets/audio/effects/gameover.ogg`,
      volume: 0.5
    },

    /* música de quando sobe de nível */
    levelup: {
      src: `${baseURL}/assets/audio/effects/levelup.ogg`,
      volume: 0.5
    },

    /* som de quando o plástico é coletado. */
    collect: {
      src: `${baseURL}/assets/audio/effects/collect.ogg`,
      volume: 0.5
    },

    /* som de quando o jogador coleta outro tipo de lixo. */
    collision: {
      src: `${baseURL}/assets/audio/effects/collision.mp3`,
      volume: 1
    }
  }
};

/* configurações do jogador
 * 
 * Qualquer imagem utilizada aqui, precisa ser declarada na constante resources. */
const player = {
  sprite: `${baseURL}/assets/img/objects/lixeira.png`,

  lives: 5, // vidas iniciais
  points: 0, // pontos iniciais
  
  required_xp: 30 // quantos pontos até passar de nível
};

/* configurações da engine.js
 *
 * Aqui você pode declarar a altura e largura do jogo.
 * 
 * A altura do jogo é calculada de acordo com a quantia de elementos em
 * row.images[]. A largura é configurada em column.count.
 * 
 * Qualquer imagem utilizada aqui, precisa ser declarada na constante resources. */
const engine = {
  canvas: {
    container: document.getElementById("canvas_container"),
    element: document.createElement('canvas'),
  },

  row: {
    images: [
      `${baseURL}/assets/img/sprites/sky.png`,   // céu
      `${baseURL}/assets/img/sprites/sky.png`,   // céu
      `${baseURL}/assets/img/sprites/sky.png`,   // céu
      `${baseURL}/assets/img/sprites/sky.png`,   // céu

      `${baseURL}/assets/img/sprites/grass-block.png`,   // linha feita de grama
    ]
  },

  column: {
    count: 9
  }
};

/* configurações resource.js
 * 
 * Qualquer sprite utilizado no jogo PRECISA ser declarado aqui.
 * 
 * SE VOCÊ SUBSTITUIR ALGUM SPRITE, DECLARE ELE AQUI NOVAMENTE! */
const resources = [
  /* cenário */
  `${baseURL}/assets/img/sprites/stone-block.png`,
  `${baseURL}/assets/img/sprites/sky.png`,
  `${baseURL}/assets/img/sprites/grass-block.png`,

  /* inimigos */
  `${baseURL}/assets/img/objects/radioativo.png`,
  `${baseURL}/assets/img/objects/vidro.png`,
  `${baseURL}/assets/img/objects/nonrecy.png`,
  `${baseURL}/assets/img/objects/hospitalar.png`,
  `${baseURL}/assets/img/objects/madeira.png`,
  `${baseURL}/assets/img/objects/metal.png`,
  `${baseURL}/assets/img/objects/organico.png`,
  `${baseURL}/assets/img/objects/papel.png`,
  `${baseURL}/assets/img/objects/perigoso.png`,
  
  /* player */
  `${baseURL}/assets/img/objects/lixeira.png`,

  /* itens coletáveis */
  `${baseURL}/assets/img/objects/plastico.png`
];

const config = {
  game,
  player,
  engine,
  resources
}

window.onload = () => {

  const reciclus = new Game(config);
  
  reciclus.showStartScreen();
}

/* engine.js
 * 
 * Este arquivo tem a funcionalidade de loop: atualização e renderização entidades.
 * 
 * Desenha a tela inicial e depois invoca os métodos de atualização e renderização do
 * avatar e outras entidades (definidos no game.js).
 * 
 * Uma game engine tem a funcionalidade de desenhar os frames do jogo repetidamente 
 * (como no caso de flipbooks que você fazia quando era criança). Quando seu 
 * avatar se anda pela tela, pode parecer que ele esta em movimento apesar de 
 * não ser o caso. O que está acontecendo de fato é que toda a cena foi desenhada 
 * diversas vezes para criar uma ilusão de animação.
 * 
 * Esta engine faz com que o objeto de contexto do canvas fique disponível globalmente.
 * Deste modo, o desenvolvimento no arquivo game.js fica mais simples.
 */

class Engine {

  game;
  lastTime;
  canvas;
  ctx;
  row;
  column;
  dt;
  paused = true;

  constructor(game, { canvas, row, column }, resources) {

    this.game = game;

    this.canvas = canvas.element;
    this.canvas.width = column.count * 101;
    this.canvas.height = row.images.length * 101;

    this.row = row;
    this.column = column;

    this.ctx = this.canvas.getContext('2d');

    canvas.container.appendChild(this.canvas);

    /* Aqui, carregamos todas as images que sabemos que vamos precisar para desenhar 
    * o level do nosso jogo. Depois, init() é definido como método de callback 
    * para que quando todas estas imagens estejam adequadamente carregadas e nosso 
    * jogo seja iniciado. */
    this.game.resources.load(resources);
    this.game.resources.onReady(this.init);
  }

  /* Esta função serve como um ponto de início para o loop do jogo, além de 
   * se encarregar da invocação dos métodos de atualização e renderização.  */
  main = () => {

    /* Obtém o nosso delta timing, que é um requisito para o jogo rodar liso.
     * 
     * Devido ao fato que diferentes computadores processam instruções em
     * diferentes velocidades, nós precisamos obter um valor constante e identico no 
     * computador de todo mundo (independente de quão rápido seja o computador). */
    const now = Date.now();
    this.dt = this.paused ? 0 : (now - this.lastTime) / 1000.0;

    this.update(this.dt);
    this.render();

    /* Cria nossa variável lastTime que é usada para determinar o delta timing,
     * quando a função for invocada novamente. */
    this.lastTime = now;

    /* Use a função nativa do navegador "requestAnimationFrame" para invocar esta
     * função recursivamente, sempre que o navegador puder desenhar um novo frame. */
    window.requestAnimationFrame(this.main);
  }

  /* Esta função faz algumas configurações iniciais que devem acontecer somente uma
   * vez. Mais especificamente: configurando a variável lastTime que é um requisito 
   * para o loop do jogo. */
  init = () => {

    this.reset();
    this.lastTime = Date.now();
    this.main();
  }

  /* Esta função é invocada por main() e ela invoca todas as funções que podem
   * estar precisando atualizar os dados de uma entidade.
   * 
   * Dependendo de como você implementa a detecção de colisão (quando duas 
   * entidades ocupam o mesmo espaço), você pode precisar invocar outras 
   * funções, por aqui.
   * */
  update = (dt) => {

    this.updateEntities(dt);
    this.checkCollisions();
  }

  /* Esta função é invocada por update() para fazer iteração e invocação 
   * do método update() de objetos na sua array de inimigos, definida em game.js.
   * 
   * Métodos update() de entidades devem focar apenas em atualizar dados ou 
   * propriedades relacionadas ao objeto. Crie desenhos no canvas, usando 
   * métodos render().
  */
  updateEntities = (dt) => {

    this.game.enemies.forEach((enemy) => enemy.update(dt));
    this.game.items.forEach((item) => item.update(dt));
  }

  checkCollisions = () => {

    this.game.enemies.forEach((enemy) => enemy.checkCollisions());
    this.game.items.forEach((item) => item.checkCollisions());
  }

  /* Esta função, inicialmente, desenha o level do jogo. É só depois que a 
   * função renderEntities() passa à ser invocada.
   * 
   * Lembre-se que esta função é invocada a cada game tick (loop do jogo) e é 
   * assim que jogos funcionam: são flipbooks que criam a ilusão de animação. 
   * No entanto, por debaixo dos panos: são vários desenhos exibidos em curto 
   * espaço de tempo. */
  render = (row = this.row, column = this.column) => {

    /* Esta array armazena URLs relativas das imagens utilizadas 
     * por uma determinada linha da tela do jogo. */
    const rowImages = row.images,
          rowCount = row.images.length,
          colCount = column.count;

    let rowIndex, colIndex;
    
    // antes de desenhar no canvas, limpe-o.
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    /* Faça iterações de acordo com o número de linhas e colunas definidas acima e,
     * usando a array rowImages: desenhe a imagem correta para aquela parte do grid. */
    for (rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (colIndex = 0; colIndex < colCount; colIndex++) {

        /* Para começar a desenhar, a função drawImage() do elemento de contexto 
         * do canvas requer 3 parâmetros: url da imagem à ser desenhada, 
         * coordenada do eixo horizontal e coordenada do eixo vertical.
         * 
         * Estamos utilizando métodos utilitário de Resources para que tenhamos o 
         * benefício de fazer cache de imagens, já que elas são desenhadas 
         * repetidamente. */
        const URL = this.game.resources.get(rowImages[rowIndex]);
        const xCoord = colIndex * 101;
        const yCoord = rowIndex * 83;

        this.ctx.drawImage(URL, xCoord, yCoord);
      }
    }

    this.renderEntities();
  }

  /* Esta função é invocada por render() a cada game tick. O propósito desta é 
   * invocar funções render() que você tenha definido nas entidades do jogo, em game.js. */
  renderEntities = () => {

    this.game.enemies.forEach((enemy) => enemy.render());
    this.game.items.forEach((item) => item.render());
    this.game.player.render();
  }

  pauseExecution = () => {

    this.paused = true;
  }

  startExecution = () => {

    this.paused = false;
  }

  /* Esta função não faz nada, mas pode servir para manipular o estado de reset 
   * do jogo. Talvez: um novo menu de jogo, tela de gameover ou algo parecido. 
   * Esta função só é invocada uma única vez pelo método init(). */
  reset = () => {
    // noop
  }
}

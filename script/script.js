"use strict";

const settings = {
  canvas: null,
  ctx: null,
  bufferCanvas: null,
  bufferCtx: null,
  gameWindowWidth: 700, //ширина игрового поля
  gameWindowHeight: 400, //высота игрового поля
  platformWidth: 16, //ширина платформы
  platformHeight: 170, //высота платформы
  ballRadius: 20, //радиус мяча
  countLevel: 5, //количество раундов в игре
  velocity: 5, //скорость перемещения мяча
  angleBound: 2,//насколько сильно изменится траектория мячика, если платформа двигается
  minSpeedFromLeftPlatforn: -2, //минимальная скорость мяча при отбивании от движущейся вниз левой платформы
  minSpeedFromRightPlatforn: 2, //минимальная скорость мяча при отбивании от движущейся вниз правой платформы
  maxSpeedFromLeftPlatforn: -13, //максимальная скорость мяча при отбивании от движущейся вверх левой платформы
  maxSpeedFromRightPlatforn: 13, //максимальная скорость мяча при отбивании от движущейся вверх правой платформы
}

//Класс создает HTML структуру игры и выводит на страницу
class App {
  constructor() {
  }

  createHTML() {
    const pingPong = document.createElement('div')
    pingPong.classList.add('ping-pong')

    //Верхняя часть игры
    const header = () => {
      const pingPongTop = document.createElement('div')
      pingPongTop.classList.add('ping-pong__top')

      const buttonStart = document.createElement('button')
      buttonStart.classList.add('ping-pong__start')
      buttonStart.innerHTML = 'Старт'

      const score = document.createElement('div')
      score.classList.add('ping-pong__score')
      score.innerHTML = '<span class="ping-pong__player_01">0</span>:<span class="ping-pong__player_02">0</span>'

      pingPongTop.append(buttonStart)
      pingPongTop.append(score)

      return pingPongTop
    }
    //игровое поле
    const gameWindow = () => {

      const pingPongGameWindow = document.createElement('div')
      pingPongGameWindow.classList.add('ping-pong__game-window')

      const popUp = document.createElement('span')
      popUp.classList.add('ping-pong__pop-up')
      

      // создаем и собираем данные об канвасе
      settings.canvas = document.createElement('canvas')
      settings.canvas.id = 'ping-pong'
      settings.canvas.width = settings.gameWindowWidth
      settings.canvas.height = settings.gameWindowHeight
      settings.canvas.style.backgroundColor = '#d9d452'
      settings.ctx = settings.canvas.getContext("2d")
      
      // создаем буферизирующий канвас
      settings.bufferCanvas = document.createElement("canvas");
      settings.bufferCtx = settings.bufferCanvas.getContext("2d");
      settings.bufferCtx.canvas.width = settings.gameWindowWidth;
      settings.bufferCtx.canvas.height = settings.gameWindowHeight;

      //левая платформа
      settings.ctx.fillStyle = 'blue'
      settings.ctx.fillRect(0, 0, settings.platformWidth, settings.platformHeight)

      //правая платформа
      settings.ctx.fillStyle = 'green'
      settings.ctx.fillRect(settings.gameWindowWidth-settings.platformWidth, 0, settings.platformWidth, settings.platformHeight)
 
      //отрисовка мячика
      settings.ctx.fillStyle = 'red';
      settings.ctx.strokeStyle = 'red';
      settings.ctx.lineWidth = 1;
  
      settings.ctx.beginPath();
      settings.ctx.arc(settings.gameWindowWidth/2, settings.gameWindowHeight/2, settings.ballRadius, 0, Math.PI * 2);
      settings.ctx.fill()
      settings.ctx.stroke();

      
      pingPongGameWindow.append(popUp)
      pingPongGameWindow.append(settings.canvas)

      return pingPongGameWindow
    }

    pingPong.append(header())
    pingPong.append(gameWindow())

    document.querySelector('.wrapper').append(pingPong)
  }
}
const app = new App()
app.createHTML()

//Класс обрабатывает нажатие клавиш на клавиатуре
class KeyControls {
  constructor(keysList){ //массив клавиш, нажание на которые надо отслеживать
    this.keysList = keysList
    this.keys = {}
 
    window.addEventListener('keydown', (e) => this.changeState(e))
    window.addEventListener('keyup', (e) => this.changeState(e))
  } 

  changeState(e){
    if(!this.keysList.includes(e.code)) return //проврека, нажата ли клавиша из массива keysList
    
    //если клавиша нажата, ей присваивается значение true, если отпущена - false 
    this.keys[e.code] = e.type === 'keydown' ? true : false
  }
}

//Класс для создания мяча
class Ball {
  constructor() {
    this.gameWindowWidth = settings.gameWindowWidth
    this.gameWindowHeight = settings.gameWindowHeight
    this.velocity = settings.velocity
    this.radius = settings.ballRadius
    this.position = {
      x: this.gameWindowWidth / 2, //устанавливаем начальное положение мяча. В центре поля
      y: this.gameWindowHeight / 2,
    }
    this.speed = {
      x: ((Math.random() < 0.5) ? -1 : 1)*this.velocity, //случайным образом определяется, в какую сторону полетит мяч
      y: ((Math.random() < 0.5) ? -1 : 1)*this.velocity,
    }
  }

  //Метод находит HTML код мяча и задает ему позицию 
  draw() {
    settings.bufferCtx.fillStyle = 'red';
    settings.bufferCtx.strokeStyle = 'red';
    settings.bufferCtx.lineWidth = 1;

    settings.bufferCtx.beginPath();
    settings.bufferCtx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    settings.bufferCtx.fill()
    settings.bufferCtx.stroke();
  }

  //Метод обновляет позицию мяча
  update() {
    this.draw()
    this.position.x += this.speed.x
    this.position.y += this.speed.y
  }
}

//Класс для создание платформ
class Platform{
  constructor(type){
    this.line
    this.gameWindowWidth = settings.gameWindowWidth
    this.width = settings.platformWidth 
    this.height = settings.platformHeight
    this.color = type === 'left' ? 'blue' : 'green'
    this.position = {
      x: type === 'left' ? 0 : this.gameWindowWidth-this.width, 
      y: 0,
    }
    this.speed = {
      x:0,
      y:0,
    }
  }

  //Метод находит HTML код платфомы(в зависимости от типа) и задает ему позицию 
  draw(){    
    settings.bufferCtx.fillStyle = this.color;
    settings.bufferCtx.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  //Метод обновляет позицию платформы
  update(){
    this.draw()
    this.position.y += this.speed.y
  }
}

//Класс игрового окна
class GameWindow {
  constructor() {
    this.requestID // свойство хранит анимацию
    this.ball = new Ball() //создание мяча
    this.leftPlatform = new Platform('left') //создание левой платформы
    this.rightPlatform = new Platform('right')//создание правой платформы
    this.keyBoard = new KeyControls(['ShiftLeft', 'ControlLeft', 'ArrowUp', 'ArrowDown']) //кнопки управления платформами
    this.keys = this.keyBoard.keys //объект хратит значения true-если клавиша нажата, false-если отпущена
    this.width = settings.gameWindowWidth
    this.height = settings.gameWindowHeight
    this.playerScore_01 = 0 //очки игроков 
    this.playerScore_02 = 0
    this.countLevel = settings.countLevel
    this.angleBound = settings.angleBound
  }

  blank() {
    settings.bufferCtx.fillStyle = '#d9d452'
    settings.bufferCtx.fillRect(0, 0, settings.gameWindowWidth, settings.gameWindowHeight);
  }

  //меттод срабатывает после выигрыша одного из игроков
  playerWin(player){
    document.querySelector('.ping-pong__start').disabled=false
    document.querySelector('.ping-pong__pop-up').innerHTML=`${player} победил`
  }
  

  //метод срабатывает при клике на конпку 'Старт'
  startGame(){

    //останавливаем анимацию
    cancelAnimationFrame(this.requestID)
    
    document.querySelector('.ping-pong__pop-up').innerHTML = ''

    //обнуляем счет
    this.playerScore_01 = 0
    this.playerScore_02 = 0

    this.ball = new Ball()//обнуялем данные мяча(положение, скорость)
    this.createLevel()
  }

  //Метод срабатывает, когда один из игроков забил гол 
  createNewlevel(){
    let countdown = 3 //обратный отсчет
    document.querySelector('.ping-pong__start').disabled=true//делаем кнопку не активной
    const popUp = document.querySelector('.ping-pong__pop-up')
    popUp.innerHTML = countdown


    //проверяем, в какие ворота был забит мяч и добавляем соответствующему игроку очки
    if(this.ball.position.x-this.ball.radius<=0){
      this.playerScore_02+=1
    }else{
      this.playerScore_01+=1
    }

    //если игрок достиг максимального количества очков, объявляется победитель
    if(this.playerScore_01===this.countLevel){
      this.playerWin('Игрок1')
      return
    }else if(this.playerScore_02===this.countLevel){
      this.playerWin('Игрок2')
      return
    }

    //обратный отсчет 
    let setIntervalID = setInterval(()=>{
      popUp.innerHTML = --countdown
    
      if(countdown == 0){
        clearInterval(setIntervalID)   
        popUp.innerHTML = ''
        document.querySelector('.ping-pong__start').disabled=false
        this.ball = new Ball()//обнуляем позицию мяча
        this.createLevel()//активируем новый раунд
      }
    }, 1000)

  }

  //управление платформами
  updatePlatforms(){
    
    //управление левой платформой
    if(this.keys.ShiftLeft && this.leftPlatform.position.y >= 0){  
      this.leftPlatform.speed.y = -7 
    }else if(this.keys.ControlLeft && this.leftPlatform.position.y+this.leftPlatform.height<this.height){ 
      this.leftPlatform.speed.y = +7 
    }else{
      this.leftPlatform.speed.y = 0
    }

    //управление правой платформой
    if(this.keys.ArrowUp && this.rightPlatform.position.y > 0){  
      this.rightPlatform.speed.y = -7 
    }else if(this.keys.ArrowDown && this.rightPlatform.position.y+this.rightPlatform.height<this.height){ 
      this.rightPlatform.speed.y = +7 
    }else{
      this.rightPlatform.speed.y = 0
    }
  }

  createLevel() {
    document.querySelector('.ping-pong__player_01').innerHTML= this.playerScore_01 //обновляем очки игроков
    document.querySelector('.ping-pong__player_02').innerHTML= this.playerScore_02
    this.blank() //закрашиваем игровое поле
    this.ball.update() //обновляем позцию мяча
    this.leftPlatform.update() 
    this.rightPlatform.update() 
    this.updatePlatforms()

    //отскок мяча от верхней границы поля
    if(this.ball.position.y-this.ball.radius<0){
      this.ball.speed.y=-this.ball.speed.y
      this.ball.position.y=this.ball.radius
    }

    //отскок мяча от нижней границы поля
    if(this.ball.position.y+this.ball.radius>=this.height){
      this.ball.speed.y=-this.ball.speed.y
      this.ball.position.y=this.height-this.ball.radius
    }

    //отскок мяча от левой платформы
    if(this.ball.position.x-this.ball.radius<this.leftPlatform.position.x+this.leftPlatform.width//шар попал на платфору
    && this.ball.position.y-this.ball.radius<this.leftPlatform.position.y+this.leftPlatform.height
    && this.ball.position.y+this.ball.radius>this.leftPlatform.position.y
    ){
      
      //изменение угла полета мячика при движении платформы
      if(this.keys.ShiftLeft && this.ball.speed.x>settings.maxSpeedFromLeftPlatforn){//платформа перемещается вверх - мяч ускоряется
        this.ball.speed.x-=settings.angleBound;
      }
      if(this.keys.ControlLeft && this.ball.speed.x<settings.minSpeedFromLeftPlatforn){//платформа перемещается вниз - мяч замедляется
        this.ball.speed.x+=settings.angleBound; 
      }
      
      //удар мяча о верхний угол
      if(this.leftPlatform.position.y>=this.ball.position.y-this.ball.radius
        && this.leftPlatform.position.y<=this.ball.position.y+this.ball.radius
        && this.ball.speed.y > 1
        ){            
          this.ball.speed.y=-this.ball.speed.y;
        }

      //удар мяча о нижний угол
      if(this.leftPlatform.position.y+this.leftPlatform.height>=this.ball.position.y-this.ball.radius
        && this.leftPlatform.position.y+this.leftPlatform.height<=this.ball.position.y+this.ball.radius
        && this.ball.speed.y < 1
        ){    
          this.ball.speed.y=-1*this.ball.speed.y;
        }

      this.ball.speed.x=-this.ball.speed.x;
      this.ball.position.x = this.leftPlatform.width+this.ball.radius
    }
 
    //отскок мяча от правой платформы
    if(this.ball.position.x+this.ball.radius>this.rightPlatform.position.x//шар попал на платфору
      && this.ball.position.y+this.ball.radius>this.rightPlatform.position.y
      && this.ball.position.y-this.ball.radius<this.rightPlatform.position.y + this.rightPlatform.height
      ){

        //изменение угла полета мячика при движении платформы
        if(this.keys.ArrowUp && this.ball.speed.x<settings.maxSpeedFromRightPlatforn){//платформа перемещается вверх - мяч ускоряется
          this.ball.speed.x+=settings.angleBound;
        }
        if(this.keys.ArrowDown && this.ball.speed.x>settings.minSpeedFromRightPlatforn){//платформа перемещается вниз - мяч замедляется
          this.ball.speed.x-=settings.angleBound; 
        }

        //удар мяча о верхний угол платформы
        if(this.rightPlatform.position.y>=this.ball.position.y-this.ball.radius
          && this.rightPlatform.position.y<=this.ball.position.y+this.ball.radius
          && this.ball.speed.y > 1
          ){       
            this.ball.speed.y=-this.ball.speed.y;
          }

        //удар мяча о нижний угол платформы
        if(this.rightPlatform.position.y+this.rightPlatform.height>=this.ball.position.y-this.ball.radius
          && this.rightPlatform.position.y+this.rightPlatform.height<=this.ball.position.y+this.ball.radius
          && this.ball.speed.y < 1
          ){       
            this.ball.speed.y=-1*this.ball.speed.y;
          }

        this.ball.speed.x=-this.ball.speed.x;
        this.ball.position.x = this.width-this.ball.radius-this.rightPlatform.width;
      }

    //игрок забил гол
    if(this.ball.position.x>=this.width||this.ball.position.x<=0){ 
      cancelAnimationFrame(this.requestID)
      this.createNewlevel()
      return
    }

    //как только мяч и платформы отрисовались в буфере, мы копируем все это в наш основной канвас
    settings.ctx.drawImage(settings.bufferCanvas, 0, 0, settings.gameWindowWidth, settings.gameWindowHeight);
    this.requestID = requestAnimationFrame(()=> this.createLevel())//запускаем анимацию
  }
}

const gameWindow = new GameWindow()

document.querySelector('.ping-pong__start').addEventListener('click', () => {
  gameWindow.startGame()
})


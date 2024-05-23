class MazeBuilder {  
    constructor(width, height) {
  
      this.width = width;
      this.height = height;
  
      this.cols = 2 * this.width + 1;
      this.rows = 2 * this.height + 1;
  
      this.maze = this.initArray([]);
      /* place initial walls */
  
      this.maze.forEach((row, r) => {
        row.forEach((cell, c) => {
          switch(r)
          {
            case 0:
            case this.rows - 1:
              this.maze[r][c] = ["wall"];
              break;
  
            default:
              if((r % 2) == 1) {
                if((c == 0) || (c == this.cols - 1)) {
                  this.maze[r][c] = ["wall"];
                }
              } else if(c % 2 == 0) {
                this.maze[r][c] = ["wall"];
              }
  
          }
        });
  
        if(r == 0) {
          /* place exit in top row */
          let doorPos = this.posToSpace(this.rand(1, this.width));
          this.maze[r][doorPos] = ["door", "exit"];
        }
  
        if(r == this.rows - 1) {
          /* place entrance in bottom row */
          let doorPos = this.posToSpace(this.rand(1, this.width));
          this.maze[r][doorPos] = ["door", "entrance"];
        }
  
      });
  
      /* start partitioning */
  
      this.partition(1, this.height - 1, 1, this.width - 1);
      this.placeSentinels();
      this.placeNubbins();
    }

    placeSentinels() {
      const numberOfSentinels = 200; 
      for (let i = 0; i < numberOfSentinels; i++) {
        let row = this.rand(1, this.height);
        let col = this.rand(1, this.width);
        this.maze[this.posToSpace(row)][this.posToSpace(col)] = ["sentinel", "wall"];
      }
    }

    placeNubbins() {
      const numberOfSentinels = 5; 
      for (let i = 0; i < numberOfSentinels; i++) {
        let row = this.rand(1, this.height);
        let col = this.rand(1, this.width);
        this.maze[this.posToSpace(row)][this.posToSpace(col)] = ["nubbin"];
      }
    }

    initArray(value) {
      return new Array(this.rows).fill().map(() => new Array(this.cols).fill(value));
    }
  
    rand(min, max) {
      return min + Math.floor(Math.random() * (1 + max - min));
    }
  
    posToSpace(x) {
      return 2 * (x-1) + 1;
    }
  
    posToWall(x) {
      return 2 * x;
    }
  
    inBounds(r, c) {
      if((typeof this.maze[r] == "undefined") || (typeof this.maze[r][c] == "undefined")) {
        return false; /* out of bounds */
      }
      return true;
    }

    shuffle(array) {
      /* sauce: https://stackoverflow.com/a/12646864 */
      for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    partition(r1, r2, c1, c2) {
      /* create partition walls
         ref: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method */
  
      let horiz, vert, x, y, start, end;
  
      if((r2 < r1) || (c2 < c1)) {
        return false;
      }
  
      if(r1 == r2) {
        horiz = r1;
      } else {
        x = r1+1;
        y = r2-1;
        start = Math.round(x + (y-x) / 4);
        end = Math.round(x + 3*(y-x) / 4);
        horiz = this.rand(start, end);
      }
  
      if(c1 == c2) {
        vert = c1;
      } else {
        x = c1 + 1;
        y = c2 - 1;
        start = Math.round(x + (y - x) / 3);
        end = Math.round(x + 2 * (y - x) / 3);
        vert = this.rand(start, end);
      }
  
      for(let i = this.posToWall(r1)-1; i <= this.posToWall(r2)+1; i++) {
        for(let j = this.posToWall(c1)-1; j <= this.posToWall(c2)+1; j++) {
          if((i == this.posToWall(horiz)) || (j == this.posToWall(vert))) {
            this.maze[i][j] = ["wall"];
          }
        }
      }
  
      let gaps = this.shuffle([true, true, true, false]);
  
      /* create gaps in partition walls */
  
      if(gaps[0]) {
        let gapPosition = this.rand(c1, vert);
        this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
      }
  
      if(gaps[1]) {
        let gapPosition = this.rand(vert+1, c2+1);
        this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
      }
  
      if(gaps[2]) {
        let gapPosition = this.rand(r1, horiz);
        this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
      }
  
      if(gaps[3]) {
        let gapPosition = this.rand(horiz+1, r2+1);
        this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
      }
  
      /* recursively partition newly created chambers */
  
      this.partition(r1, horiz-1, c1, vert-1);
      this.partition(horiz+1, r2, c1, vert-1);
      this.partition(r1, horiz-1, vert+1, c2);
      this.partition(horiz+1, r2, vert+1, c2);
  
    }
  
    isGap(...cells) {
      return cells.every((array) => {
        let row, col;
        [row, col] = array;
        if(this.maze[row][col].length > 0) {
          if(!this.maze[row][col].includes("door")) {
            return false;
          }
        }
        return true;
      });
    }
  
    countSteps(array, r, c, val, stop) {
  
      if(!this.inBounds(r, c)) {
        return false; /* out of bounds */
      }
  
      if(array[r][c] <= val) {
        return false; /* shorter route already mapped */
      }
  
      if(!this.isGap([r, c])) {
        return false; /* not traversable */
      }
  
      array[r][c] = val;
  
      if(this.maze[r][c].includes(stop)) {
        return true; /* reached destination */
      }
  
      this.countSteps(array, r-1, c, val+1, stop);
      this.countSteps(array, r, c+1, val+1, stop);
      this.countSteps(array, r+1, c, val+1, stop);
      this.countSteps(array, r, c-1, val+1, stop);
  
    }
  
    getKeyLocation() {
  
      let fromEntrance = this.initArray();
      let fromExit = this.initArray();
  
      this.totalSteps = -1;
  
      for(let j = 1; j < this.cols-1; j++) {
        if(this.maze[this.rows-1][j].includes("entrance")) {
          this.countSteps(fromEntrance, this.rows-1, j, 0, "exit");
        }
        if(this.maze[0][j].includes("exit")) {
          this.countSteps(fromExit, 0, j, 0, "entrance");
        }
      }
  
      let fc = -1, fr = -1;
  
      this.maze.forEach((row, r) => {
        row.forEach((cell, c) => {
          if(typeof fromEntrance[r][c] == "undefined") {
            return;
          }
          let stepCount = fromEntrance[r][c] + fromExit[r][c];
          if(stepCount > this.totalSteps) {
            fr = r;
            fc = c;
            this.totalSteps = stepCount;
          }
        });
      });
  
      return [fr, fc];
    }
  
  
    display(id) {
  
      this.parentDiv = document.getElementById(id);
  
      if(!this.parentDiv) {
        alert("Cannot initialise maze - no element found with id \"" + id + "\"");
        return false;
      }
  
      while(this.parentDiv.firstChild) {
        this.parentDiv.removeChild(this.parentDiv.firstChild);
      }
  
      const container = document.createElement("div");
      container.id = "maze";
      container.dataset.steps = this.totalSteps;
  
      this.maze.forEach((row) => {
        let rowDiv = document.createElement("div");
        row.forEach((cell) => {
          let cellDiv = document.createElement("div");
          if(cell) {
            cellDiv.className = cell.join(" ");
          }
          rowDiv.appendChild(cellDiv);
        });
        container.appendChild(rowDiv);
      });
  
      this.parentDiv.appendChild(container);
  
      return true;
    }
  
  }

  //Maze Gameplay Functions
  var Position = function(x, y) {
    this.x = x;
    this.y = y;
  }
  
  Position.prototype.toString = function() {
    return this.x + ":" + this.y;
  };
  
  var Mazing = function(id) {
    this.mazeContainer = document.getElementById(id);
  
    this.mazeScore = document.createElement("div");
  
    this.mazeMessage = document.createElement("div");
  
    this.heroScore = this.mazeContainer.getAttribute("data-steps") - 2;
  
    this.maze = [];
    this.heroPos = {};
    this.childMode = false;
  
    this.utter = null;
  
    for(i=0; i < this.mazeContainer.children.length; i++) {
      for(j=0; j < this.mazeContainer.children[i].children.length; j++) {
        var el =  this.mazeContainer.children[i].children[j];
        this.maze[new Position(i, j)] = el;
        if(el.classList.contains("entrance")) {
          /* place hero on entrance square */
          this.heroPos = new Position(i, j);
          this.maze[this.heroPos].classList.add("hero");
        }
      }
    }
  
    var mazeOutputDiv = document.createElement("div");
    mazeOutputDiv.id = "maze_output";
  
    mazeOutputDiv.appendChild(this.mazeScore);
    mazeOutputDiv.appendChild(this.mazeMessage);
  
    mazeOutputDiv.style.width = this.mazeContainer.scrollWidth + "px";
  
    this.mazeContainer.insertAdjacentElement("afterend", mazeOutputDiv);
  
    /* activate control keys */
  
    this.keyPressHandler = this.mazeKeyPressHandler.bind(this);
    document.addEventListener("keydown", this.keyPressHandler, false);
  };
  
  Mazing.prototype.enableSpeech = function() {
    this.utter = new SpeechSynthesisUtterance()
    this.setMessage(this.mazeMessage.innerText);
  };
  
  Mazing.prototype.setMessage = function(text) {
  
    /* display message on screen */
    this.mazeMessage.innerHTML = text;
    this.mazeScore.innerHTML = this.heroScore;
  
    if(this.utter && text.match(/^\w/)) {
      /* speak message aloud */
      this.utter.text = text;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(this.utter);
    }
  
  };
  
  Mazing.prototype.heroTakeTreasure = function() {
    this.maze[this.heroPos].classList.remove("nubbin");
    this.setMessage("You met a companion");
  };
  
  Mazing.prototype.gameOver = function(text) {
    /* de-activate control keys */
    document.removeEventListener("keydown", this.keyPressHandler, false);
    this.setMessage(text);
    this.mazeContainer.classList.add("finished");
  };
  
  Mazing.prototype.heroWins = function() {
    this.maze[this.heroPos].classList.remove("door");
    this.heroScore += 50;
    this.gameOver("you finished !!!");
  };
  
  function showBrownOverlay() {
    var overlay = document.getElementById("battle-area");
    overlay.style.display = "block";
  }

  function hideBrownOverlay() {
    var overlay = document.getElementById("battle-area");
    overlay.style.display = "none";
  }

  //Top and bottom overlay
  function toggleOverlay() {
    var overlayTop = document.querySelector(".overlay-top");
    var overlayBottom = document.querySelector(".overlay-bottom");
    overlayTop.classList.toggle("overlay-active");
    overlayBottom.classList.toggle("overlay-active");

    console.log("Overlay toggled. Top active:", overlayTop.classList.contains("overlay-active"), 
              "Bottom active:", overlayBottom.classList.contains("overlay-active"));
}


  Mazing.prototype.tryMoveHero = function(pos) {

    hideBrownOverlay();

    if("object" !== typeof this.maze[pos]) {
      return;
    }
  
    var nextStep = this.maze[pos].className;
  
  
    if(nextStep.match(/sentinel/)) {
      this.setMessage("ow, that hurt!");
      this.maze[pos].classList.remove("sentinel");
      this.maze[pos].classList.remove("wall");
      toggleOverlay();
      setTimeout(() => {
        toggleOverlay();
      }, 500);
      showBrownOverlay();
      setTimeout(() => {
        initalizeBattle();
      }, 500); 
      return;
    }

    if(nextStep.match(/wall/)) {
      return;
    }
  
    if(nextStep.match(/exit/)) {
      bossBattle()
      return;
    }
  
    /* move hero one step */
  
    this.maze[this.heroPos].classList.remove("hero");
    this.maze[pos].classList.add("hero");
    this.heroPos = pos;
  
    /* check what was stepped on */
  
    if(nextStep.match(/nubbin/)) {
      this.heroTakeTreasure();
      partyBonusLevel()
      return;
    }
  
    if(nextStep.match(/exit/)) {
    }
  
    if((this.heroScore >= 1) && !this.childMode) {
  
      this.heroScore--;
  
      if(this.heroScore <= 0) {
        /* game over */
        this.gameOver("sorry, you didn't make it");
        return;
      }
  
    }
  
  };
  
  Mazing.prototype.mazeKeyPressHandler = function(e) {
  
    var tryPos = new Position(this.heroPos.x, this.heroPos.y);
  
    switch(e.key)
    {
      case "ArrowLeft":
        this.mazeContainer.classList.remove("face-right");
        tryPos.y--;
        break;
  
      case "ArrowUp":
        tryPos.x--;
        break;
  
      case "ArrowRight":
        this.mazeContainer.classList.add("face-right");
        tryPos.y++;
        break;
  
      case "ArrowDown":
        tryPos.x++;
        break;
  
      default:
        return;
  
    }
  
    this.tryMoveHero(tryPos);

    e.preventDefault();
  };

  
  Mazing.prototype.setChildMode = function() {
    this.childMode = true;
    this.heroScore = 0;
    this.setMessage("collect all the treasure");
  };


//Battle System and Stat System Code
// Stat variables
  //STATS OF THE HERO PARTY
  //LVL 1 stats of the party will always be the same
  let Party = {  
	  hero:{
      name: "Hero",
      class: "hero-class",
      LVL: 1,
      HP: 10,
      ATK: 8,
      CR: 0.15,
      DEF: 13,
      MDEF: 4,
      SPD: 15,
      isHero: true,
      DamageDone: 0,
      DamageTaken: 0,
      Dodged: false,
      Fainted: false,
      DodgeCounter: 0,
      DodgeID: "hero-dodge",
      type: "heroAttack"
	  },
	  mage:{
      name: "Mage",
      class: "mage-class",
      LVL: 1,
      HP: 6,
      ATK: 14,
      CR: 0.18,
      DEF: 4,
      MDEF: 16,
      SPD: 7,
      isHero: true,
      DamageDone: 0,
      DamageTaken: 0,
      isMagic: true,
      Dodged: false,
      Fainted: false,
      DodgeCounter: 0,
      DodgeID: "mage-dodge",
      type: "mageAttack"
	  },
	  priest:{
      name: "Priest",
      class: "priest-class",
      LVL: 1,
      HP: 8,
      ATK: 6,
      CR: 0.10,
      DEF: 6,
      MDEF: 10,
      SPD: 11,
      isHero: true,
      DamageDone: 0,
      DamageTaken: 0,
      isMagic: true,
      Dodged: false,
      Fainted: false,
      DodgeCounter: 0,
      DodgeID: "priest-dodge",
      type: "priestAttack"
	  }
  };

  //skeleton slime goblino orc kitsune werewolf usoppTengu birdTengu
  let enemies = { 
    slime:{
      //Very Weak
      name: "Slime",
      class: "slime-class",
      HP: 4,
      ATK: 4,
      CR: 0.05,
      DEF: 4,
      MDEF: 4,
      SPD: 4,
      isEnemy: true,
      type: "slime"
    },
    skeleton:{
      //medium-ish difficulty
      name: "Skeleton",
      class: "skeleton-class",
      HP: 7,
      ATK: 6,
      CR: 0.10,
      DEF: 7,
      MDEF: 10,
      SPD: 10,
      isEnemy: true,
      type: "skeleton"
    },
    goblin:{ 
      //a bit weaker than skeleton
      name: "Goblin",
      class: "goblin-class",
      HP: 6,
      ATK: 5,
      CR: 0.13,
      DEF: 7,
      MDEF: 2,
      SPD: 13,
      isEnemy: true,
      type: "goblin"
    },
    orc:{
      //High Difficulty, Weakness is magic
      name: "Orc",
      class: "orc-class",
      HP: 10,
      ATK: 13,
      CR: 0.15,
      DEF: 12,
      MDEF: 2,
      SPD: 3,
      isEnemy: true,
      type: "orc"
    },
    kitsune:{
      //Glass Cannon (high damage low health), Weakness is Physical Atk
      name: "Kitsune",
      class: "kitsune-class",
      HP: 5,
      ATK: 12,
      DEF: 4,
      MDEF: 12,
      SPD: 16,
      isEnemy: true,
      isMagic: true,
      type: "kitsune"
    },
    werewolf:{
      //relatively balanced
      name: "Werewolf",
      class: "werewolf-class",
      HP: 7,
      ATK: 8,
      CR: 0.20,
      DEF: 7,
      MDEF: 10,
      SPD: 20,
      isEnemy: true,
      type: "werewolf"
    },
    mountainTengu:{
      //similar to sky tengu but slower and higher health pool
      name: "Mountain Tengu",
      class: "mountainTengu-class",
      HP: 8,
      ATK: 12,
      CR: 0.20,
      DEF: 7,
      MDEF: 10,
      SPD: 6,
      isEnemy: true,
      isMagic: true,
      type: "mountainTengu"
    },
    skyTengu:{
      //Faster but more brittle Tengu
      name: "Sky Tengu",
      class: "skyTengu-class",
      HP: 5,
      ATK: 11,
      CR: 0.23,
      DEF: 7,
      MDEF: 10,
      SPD: 18,
      isEnemy: true,
      type: "skyTengu"
    }
  };

  let boss = {
    Phase1:{
      name: "Oeneri",
      LVL: 10,
      HP: 40,
      ATK: 20,
      CR: 0.10,
      DEF: 25,
      MDEF: 15,
      SPD: 999,
      isBoss: true,
      DamageDone: 0,
      DamageTaken: 0,
      isMagic: true,
      isEnemy: true,
      type: "bossphase1"
    },
    Phase2:{
      Body:{
        name: "Overlord Oeneri",
        LVL: 10,
        HP: 40,
        ATK: 20,
        CR: 0.10,
        DEF: 25,
        MDEF: 15,
        SPD: 999,
        isBoss: true,
        DamageDone: 0,
        DamageTaken: 0,
        isMagic: true,
        isEnemy: true,
        type: 'moonLord'
      },
      Arms:{
        name: "Arm",
        LVL: 10,
        HP: 40,
        ATK: 20,
        CR: 0.10,
        DEF: 25,
        MDEF: 15,
        SPD: 999,
        isBoss: true,
        DamageDone: 0,
        DamageTaken: 0,
        isEnemy: true,
        type: 'moonLord-arms',
      }
    },
    Phase3:{
      name: "Mind of Oeneri",
        LVL: 10,
        HP: 40,
        ATK: 20,
        CR: 0.10,
        DEF: 25,
        MDEF: 15,
        SPD: 999,
        isBoss: true,
        DamageDone: 0,
        DamageTaken: 0,
        isMagic: true,
        isEnemy: true
    }
  };

  //variable declarations
  var aliveHeroes, noOfEnemies, heroParty, enemy1, enemy2, enemy3, enemy4, enemy5, turnOrder = [],
  buttonsDiv, button1, button2, button3, button4, button5, bossPhase = 0;

  let lives = 3;

  function initalizeBattle(){
    document.getElementById('enemy1Gif').style.opacity = '100';
    document.getElementById('enemy2Gif').style.opacity = '100';
    document.getElementById('enemy3Gif').style.opacity = '100';
    document.getElementById('hero1-gif').style.opacity = '100';
    document.getElementById('hero2-gif').style.opacity = '100';
    document.getElementById('hero3-gif').style.opacity = '100';
    turnOrder = [];
    disableDisplay();
    enemyNoDeclaration();
    setTurnOrder();
    setEnemyNames();
    createAtkEnemyBtn();
    HealthDisplay();
    updateTurnOrderDisp();
    enemyTurnCheck();
    hideVictory();
    heroGIF();
    disableKeyboard();
    showBattleElements();
  }

  function bossBattle(){
    disableDisplay();
    bossPhase++;
    turnOrder = []; //reset turn order
    heroParty = structuredClone(Party);
    heroesInParty = [heroParty.hero, heroParty.mage, heroParty.priest]; //note that this will not be here in the final version
    //the array above will only be used when a companion has been met
    //if the companion has been successfully recruited, just use heroesInParty.push(heroParty./*insert heroname*/);
    //turn the Party./*heronamehere*/.fainted = false       Note that its Party and NOT heroParty
    //we can add this when Jomari's part (hero recruit lines) is finished and we can include the heroes now

    console.log("mi problemmo check");
    aliveHeroes = heroesInParty;

    if (heroesInParty.includes(heroParty.mage))
    {
      document.getElementById('mage').style.display = "block";
    }
    if (heroesInParty.includes(heroParty.priest))
    {
      document.getElementById('priest').style.display = "block";
    }
    console.log("mi problemmo check");
  

    document.getElementById('battle-area').style.display = 'block';
    showBattleElements();
    bossSequenceDelcare();
    setTurnOrder();
    setEnemyNames();
    createAtkEnemyBtn();
    HealthDisplay();
    updateTurnOrderDisp();
    enemyTurnCheck();
    hideVictory();
    heroGIF();
    disableKeyboard();
  }

  function showBattleElements() {
    document.getElementById('wholeBattle').style.display = 'block';
  }

  function disableKeyboard() {
    window.addEventListener('keydown', preventDefaultForKeyboard, true);
    window.addEventListener('keyup', preventDefaultForKeyboard, true);
}

function enableKeyboard() {
    window.removeEventListener('keydown', preventDefaultForKeyboard, true);
    window.removeEventListener('keyup', preventDefaultForKeyboard, true);
}

function preventDefaultForKeyboard(event) {
    event.preventDefault();
    event.stopPropagation();
}
  
//set enemies
function enemyAssign(objNum){
  switch(objNum)
  {
    case 1:
      return enemies.slime;
      break;
    case 2:
      return enemies.skeleton;
      break;
    case 3:
      return enemies.goblin;
      break;
    case 4:
      return enemies.orc;
      break;
    case 5:
      return enemies.kitsune;
      break;
    case 6:
      return enemies.werewolf;
      break;
    case 7:
      return enemies.mountainTengu;
      break;
    case 8:
      return enemies.skyTengu;
      break;
  }
}

function disableDisplay(){
  //sets the enemy 4 and 5 disabled before rolling for the number of enemies
  document.getElementById('enemy4').style.display = "none";
  document.getElementById('enemy5').style.display = "none";
}

function bossSequenceDelcare(){
    document.getElementById('enemy1Gif').style.opacity = '100';
    document.getElementById('enemy2Gif').style.opacity = '100';
    document.getElementById('enemy3Gif').style.opacity = '100';
    document.getElementById('hero1-gif').style.opacity = '100';
    document.getElementById('hero2-gif').style.opacity = '100';
    document.getElementById('hero3-gif').style.opacity = '100';
    enemy1 = structuredClone(boss.Phase2.Arms);
    enemy1.name = "Left " + enemy1.name;
    enemy2 = structuredClone(boss.Phase2.Body);
    enemy3 = structuredClone(boss.Phase2.Arms);
    enemy3.name = "Right " + enemy3.name;
    noOfEnemies = 3;
}

function enemyNoDeclaration(){
  //roll for how many enemies in the battle (Min of 3, max of 5)
  heroParty = structuredClone(Party);
  aliveHeroes = [heroParty.hero, heroParty.mage, heroParty.priest];
  noOfEnemies = Math.ceil(Math.random() * 3);
  noOfEnemies = aliveHeroes.length; // number of alive heroes

  console.log("Number of enemies : " + noOfEnemies);
  enemy1, enemy2, enemy3, enemy4, enemy5;
  enemy1 = structuredClone(enemyAssign(Math.ceil(Math.random() * 8)));
  enemy2 = structuredClone(enemyAssign(Math.ceil(Math.random() * 8)));
  enemy3 = structuredClone(enemyAssign(Math.ceil(Math.random() * 8)));
  if (noOfEnemies > 3)
  {
    enemy4 = structuredClone(enemyAssign(Math.ceil(Math.random() * 8)));
    if (noOfEnemies > 4)
    {
      enemy5 = structuredClone(enemyAssign(Math.ceil(Math.random() * 8)));
    }
  }
}

function setTurnOrder(){
  //turn order
  //pushes the objects to the turn order array
  turnOrder.push(heroParty.hero); 
  turnOrder.push(heroParty.mage);
  turnOrder.push(heroParty.priest);
  turnOrder.push(enemy1);
  turnOrder.push(enemy2);
  turnOrder.push(enemy3);
  if (noOfEnemies > 3)
  {
    turnOrder.push(enemy4);
    if (noOfEnemies > 4)
    {
      turnOrder.push(enemy5);
    }
  }
  //sorts them according to their speed stat from Greatest to Least
  turnOrder.sort((a, b) => b.SPD - a.SPD); 
}

//Getting the enemy GIF's
//This is for the path
function getGifPath(enemyType) {
  return `${enemyType}.gif`;
}
//This is for the CSS class
function getClass(enemyType) {
  return `${enemyType}-class`;
}

function setEnemyNames() {
  // Reset and set enemy names and GIFs
    document.getElementById('enemy1Name').innerText = enemy1.name;
    const enemy1Gif = document.getElementById('enemy1Gif');
    enemy1Gif.style.display = 'block';
    enemy1Gif.src = getGifPath(enemy1.type);
    enemy1Gif.className = getClass(enemy1.type);
    
    document.getElementById('enemy2Name').innerText = enemy2.name;
    const enemy2Gif = document.getElementById('enemy2Gif');
    enemy2Gif.style.display = 'block';
    enemy2Gif.src = getGifPath(enemy2.type);
    enemy2Gif.className = getClass(enemy2.type);
  
    document.getElementById('enemy3Name').innerText = enemy3.name;
    const enemy3Gif = document.getElementById('enemy3Gif');
    enemy3Gif.style.display = 'block';
    enemy3Gif.src = getGifPath(enemy3.type);
    enemy3Gif.className = getClass(enemy3.type);
  
    if (noOfEnemies > 3) {
      document.getElementById('enemy4').style.display = 'block';
      document.getElementById('enemy4Name').innerText = enemy4.name;
      const enemy4Gif = document.getElementById('enemy4Gif');
      enemy4Gif.style.display = 'block';
      enemy4Gif.src = getGifPath(enemy4.type);
      enemy4Gif.className = getClass(enemy4.type);
      if (noOfEnemies > 4) {
        document.getElementById('enemy5').style.display = 'block';
        document.getElementById('enemy5Name').innerText = enemy5.name;
        const enemy5Gif = document.getElementById('enemy5Gif');
        enemy5Gif.style.display = 'block';
        enemy5Gif.src = getGifPath(enemy5.type);
        enemy5Gif.className = getClass(enemy5.type);
      }
    }
  }

function createAtkEnemyBtn(){
  //create attack buttons based on enemy
  buttonsDiv = document.getElementById('btnDiv');
  button1, button2, button3, button4, button5;
  button1 = document.createElement("button");
  button1.id = "btn1";
  button1.innerHTML = "Attack " + enemy1.name;
  button1.addEventListener("click", atkEnemy1);
  buttonsDiv.appendChild(button1);

  button2 = document.createElement("button");
  button2.id = "btn2";
  button2.innerHTML = "Attack " + enemy2.name;
  button2.addEventListener("click", atkEnemy2);
  buttonsDiv.appendChild(button2);

  button3 = document.createElement("button");
  button3.id = "btn3";
  button3.innerHTML = "Attack " + enemy3.name;
  button3.addEventListener("click", atkEnemy3);
  buttonsDiv.appendChild(button3);

  if (noOfEnemies > 3)
  {
    button4 = document.createElement("button");
    button4.id = "btn4";
    button4.innerHTML = "Attack " + enemy4.name;
    button4.addEventListener("click", atkEnemy4);
    buttonsDiv.appendChild(button4);
    if(noOfEnemies > 4)
    {
      button5 = document.createElement("button");
      button5.id = "btn5";
      button5.innerHTML = "Attack " + enemy5.name;
      button5.addEventListener("click", atkEnemy5);
      buttonsDiv.appendChild(button5);
    }
  }
}

function HealthDisplay(){
  //displaying the healthbars first
  document.getElementById('heroHealthBars').style.display = 'block';
  document.getElementById('enemyHealthBars').style.display = 'block';
  //initializing healthbars
  document.getElementById('hero-health-value').max = Party.hero.HP;
  document.getElementById('mage-health-value').max = Party.mage.HP;
  document.getElementById('priest-health-value').max = Party.priest.HP;

  document.getElementById("hero-health-value").value = heroParty.hero.HP;
  document.getElementById("mage-health-value").value = heroParty.mage.HP;
  document.getElementById("priest-health-value").value = heroParty.priest.HP;

  document.getElementById('enemy1-health-value').max = enemy1.HP;
  document.getElementById('enemy2-health-value').max = enemy2.HP;
  document.getElementById('enemy3-health-value').max = enemy3.HP;

  document.getElementById('enemy1-health-value').value = enemy1.HP;
  document.getElementById('enemy2-health-value').value = enemy2.HP;
  document.getElementById('enemy3-health-value').value = enemy3.HP;
  if (noOfEnemies > 3)
  {
    document.getElementById('enemy4-health-value').max = enemy4.HP;
    document.getElementById('enemy4-health-value').value = enemy4.HP;
    if (noOfEnemies > 4)
    {
      document.getElementById('enemy5-health-value').max = enemy5.HP;
      document.getElementById('enemy5-health-value').value = enemy5.HP;
    }
  }
}

function heroGIF(){
  // Binding hero GIFs
  document.getElementById('hero1-gif').src = 'hero.gif';
  document.getElementById('hero2-gif').src = 'priest.gif';
  document.getElementById('hero3-gif').src = 'mage.gif';

  document.getElementById('hero1-gif').style.display = 'block';
  document.getElementById('hero2-gif').style.display = 'block';
  document.getElementById('hero3-gif').style.display = 'block';
}

function hideVictory(){
  document.getElementById("victory-message").style.display = "none";
  document.getElementById("continue-btn").style.display = "none"; 
  document.getElementById("exit-btn").style.display = "none"; 
}

function updateTurnOrderDisp()
{
  let turnDisp = "Turn Order: ";
  for(let i = 0; i < turnOrder.length; i++)
  {
    if (i == turnOrder.length - 1)
    {
      turnDisp += turnOrder[i].name;
    }
    else
    {
      turnDisp += turnOrder[i].name + ", ";
    }
    
  }
  document.getElementById('turnOrderDisp').innerText = turnDisp;
  console.log(turnDisp);
}

async function enemyTurnCheck() {
  let a = 0;
  if (turnOrder[a] !== undefined) {
    while ("isEnemy" in turnOrder[a]) {
      if (turnOrder[a] !== undefined && aliveHeroes.length > 0) {
        console.log(turnOrder[a].name + " is Attacking");
        await enemyAttack(turnOrder[a]); // Wait for the enemy attack to complete
        let order1 = turnOrder.shift();
        turnOrder.push(order1);
        updateTurnOrderDisp();
      } else {
        break;
      }
    }
  }
}

function btnRemoval(removalID){
  let btnRemove = document.getElementById(removalID);
  if(btnRemove)
  {
    buttonsDiv.removeChild(btnRemove);
  }
}

let animationQueue = Promise.resolve();

function queueAnimation(animation) {
  animationQueue = animationQueue.then(animation);
}

// Update health bars
function updateHealthBars() {
   // Update hero health bars
   document.getElementById("hero-health-value").value = heroParty.hero.HP;
   document.getElementById("mage-health-value").value = heroParty.mage.HP;
   document.getElementById("priest-health-value").value = heroParty.priest.HP;

   if (enemy1.HP <= 0)
    {
      enemy1.HP = 0;
      splcCheck(enemy1);
      btnRemoval('btn1');
    }
    document.getElementById('enemy1-health-value').value = enemy1.HP; 

    if (noOfEnemies > 1)
    {
      if (enemy2.HP <= 0)
      {
        enemy2.HP = 0;
        splcCheck(enemy2);
        let buttonPass = document.getElementById(button2);
        btnRemoval('btn2');
      }
      document.getElementById('enemy2-health-value').value = enemy2.HP;
      if (noOfEnemies > 2)
      {
        if (enemy3.HP <= 0)
        {
          enemy3.HP = 0;
          splcCheck(enemy3);
          let buttonPass = document.getElementById(button3);
          btnRemoval('btn3');
        }
        document.getElementById('enemy3-health-value').value = enemy3.HP;
        
        if (noOfEnemies > 3)
        {
          if (enemy4.HP <= 0)
          {
            enemy4.HP = 0;
            splcCheck(enemy4);
            let buttonPass = document.getElementById(button4);
            btnRemoval('btn4');
          }
          document.getElementById('enemy4-health-value').value = enemy4.HP;
        }
      }
    }      

 
   // Check each hero's HP and display death animation if HP reaches 0
   function handleHeroDeath(hero, gifId) {
     if (hero.HP <= 0) {
       hero.HP = 0;
       const heroGif = document.getElementById(gifId);
       heroGif.style.transition = 'opacity 4s ease-out'; // Apply ease-out transition
       heroGif.style.opacity = '0'; // Start fading out
       setTimeout(() => {
         heroGif.style.display = 'none'; // Hide the GIF after fade-out
       }, 2000); // Duration of fade-out animation (milliseconds)
     }
   }
 
   handleHeroDeath(heroParty.hero, 'hero1-gif');
   handleHeroDeath(heroParty.priest, 'hero2-gif');
   handleHeroDeath(heroParty.mage, 'hero3-gif');

   // Check each enemy's HP and display death animation if HP reaches 0
   function handleEnemyDeath(enemy, gifId) {
     if (enemy.HP <= 0) {
       enemy.HP = 0;
       const enemyGif = document.getElementById(gifId);
       enemyGif.style.transition = 'opacity 4s ease-out'; 
       enemyGif.style.opacity = '0'; // Start fading out
       setTimeout(() => {
         enemyGif.style.display = 'none'; // Hide the GIF after fade-out
       }, 2000); 
     }
   }
 
   handleEnemyDeath(enemy1, 'enemy1Gif');
   handleEnemyDeath(enemy2, 'enemy2Gif');
   handleEnemyDeath(enemy3, 'enemy3Gif');

   
  if (noOfEnemies > 3) {
    handleEnemyDeath(enemy4, 'enemy4-health-value', 'enemy4Gif', 'btn4');
    if (noOfEnemies > 4) {
      handleEnemyDeath(enemy5, 'enemy5-health-value', 'enemy5Gif', 'btn5');
    }
  }
}


// Update damage counts
function updateDamageCounts() 
{
  document.getElementById("hero-damage-value").textContent = heroParty.hero.DamageDone;
  document.getElementById("hero-taken-damage-value").textContent = heroParty.hero.DamageTaken;
  document.getElementById("hero-dodge-counter-value").textContent = heroParty.hero.DodgeCounter;

  document.getElementById("mage-damage-value").textContent = heroParty.mage.DamageDone;
  document.getElementById("mage-taken-damage-value").textContent = heroParty.mage.DamageTaken;
  document.getElementById("mage-dodge-counter-value").textContent = heroParty.mage.DodgeCounter;

  document.getElementById("priest-damage-value").textContent = heroParty.priest.DamageDone;
  document.getElementById("priest-taken-damage-value").textContent = heroParty.priest.DamageTaken;
  document.getElementById("priest-dodge-counter-value").textContent = heroParty.priest.DodgeCounter;
}

// Display dodge message
function DispDodgeMessage(ID) 
{
  document.getElementById(ID).textContent = "Dodge!";
  setTimeout(function() {
    document.getElementById(ID).textContent = ""; // Clear the dodge message after a delay
  }, 1000); // Display the dodge message for 1 second
}

//check if the variable being spliced in turnOrder array is still there
function splcCheck(obj)
{
  if(turnOrder.indexOf(obj) !== -1)
  {
    turnOrder.splice(turnOrder.indexOf(obj), 1);
  }
}

function displayLevelUpMessage() {
  const levelUpMessage = document.createElement("div");
  levelUpMessage.id = "level-up-message";
  levelUpMessage.textContent = "You leveled up by one level!";
  levelUpMessage.style.position = "fixed";
  levelUpMessage.style.top = "50%";
  levelUpMessage.style.left = "50%";
  levelUpMessage.style.transform = "translate(-50%, -50%)";
  levelUpMessage.style.color = "yellow";
  levelUpMessage.style.fontSize = "50px";
  levelUpMessage.style.zIndex = "999";
  levelUpMessage.style.display = "block";
  levelUpMessage.style.opacity = "1";
  levelUpMessage.style.transition = "opacity 1s ease-in-out";

  document.body.appendChild(levelUpMessage);

  // Fade out the message after 3 seconds
  setTimeout(function() {
    levelUpMessage.style.opacity = "0";
    setTimeout(function() {
      document.body.removeChild(levelUpMessage);
    }, 1000); // Remove the element after fade out
  }, 2000); 
}

let victoryAchieved = false; // Add this variable to track victory status
function checkVictory() {
  if (heroParty.hero.HP <= 0) {
    heroParty.hero.Fainted = true;
    splcCheck(heroParty.hero);
  }
  if (heroParty.mage.HP <= 0) {
    heroParty.mage.Fainted = true;
    splcCheck(heroParty.mage);
  }
  if (heroParty.priest.HP <= 0) {
    heroParty.priest.Fainted = true;
    splcCheck(heroParty.priest);
  }


  function battleWon() {
    // Inner function for displaying when player wins battle
    partyLVLUP();
    victoryAchieved = true; // Set victory achieved to true
    
    // Add a delay before the initial overlay toggle
    setTimeout(function() {
      toggleOverlay();
  
      // Display the level up message during the overlay
      setTimeout(function() {
        displayLevelUpMessage();
        
        // Hide battle elements after showing the message
        setTimeout(function() {
          hideBattleElements();
          toggleOverlay();
        }, 2500); // Display the message for 2.5 seconds
      }, 500); // Delay slightly to ensure overlay is shown before displaying message
    }, 2000); // Adjust this delay as needed
  
    enableKeyboard();
  }

  // Function to hide all elements related to the battle system
  function hideBattleElements() {
  document.getElementById('wholeBattle').style.display = 'none';
}

function handleDefeat() {
  lives--;
  if (lives <= 0) {
    gameOver();
    return;
  }
  // Remove buttons
  let btnToRemove = ["btn1", "btn2", "btn3", "btn4", "btn5"];
  btnToRemove.forEach(function(btnId) {
    let btnRemove = document.getElementById(btnId);
    if (btnRemove) {
      buttonsDiv.removeChild(btnRemove);
    }
  });

  // Display lost life message with a black screen fade-in and fade-out
  const blackScreen = document.getElementById('blackScreen');
  const lostLifeMessage = document.createElement("div");

  lostLifeMessage.id = "lost-life-message";
  lostLifeMessage.textContent = `You lost one life. Lives remaining: ${lives}`;
  lostLifeMessage.style.position = "fixed";
  lostLifeMessage.style.top = "50%";
  lostLifeMessage.style.left = "50%";
  lostLifeMessage.style.transform = "translate(-50%, -50%)";
  lostLifeMessage.style.color = "red";
  lostLifeMessage.style.fontSize = "50px"; 
  lostLifeMessage.style.zIndex = "1001"; 
  lostLifeMessage.style.display = "block";
  lostLifeMessage.style.opacity = "0"; 

  document.body.appendChild(lostLifeMessage);

  // Fade in the black screen and the message
  blackScreen.style.display = 'block';
  setTimeout(() => {
    blackScreen.style.transition = 'opacity 1s ease-in-out';
    blackScreen.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    lostLifeMessage.style.transition = 'opacity 1s ease-in-out';
    lostLifeMessage.style.opacity = '1';
  }, 1000);

  // Fade out the message and the black screen after 4 seconds
  setTimeout(() => {
    lostLifeMessage.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(lostLifeMessage);
    }, 1000); // Remove the element after fade out
  }, 4000); // Display the message for 4 seconds

  setTimeout(() => {
    blackScreen.style.opacity = '0';
    setTimeout(() => {
      blackScreen.style.display = 'none';
    }, 1000); 
  }, 5000);

  // Ensure the battle elements are hidden
  setTimeout(hideBattleElements, 5000); // Ensure this happens after everything
  setTimeout(enableKeyboard, 6000); // Enable keyboard after hiding elements
}

// Hide all elements related to the battle system
function hideBattleElements() {
  document.getElementById('wholeBattle').style.display = 'none';
}


if (heroParty.hero.Fainted && heroParty.mage.Fainted && heroParty.priest.Fainted) {
  handleDefeat();
}
else if (enemy1.HP <= 0 && enemy2.HP <= 0 && enemy3.HP <= 0) {
    //checks if enemy 1, 2, 3 are dead
    if (noOfEnemies > 3) {
      //checks if theres 4 or 5 enemies
      if (enemy4.HP <= 0) {
        //checks if enemy 4 is dead
        if (noOfEnemies > 4) {
          // checks if theres 5 enemies
          if (enemy5.HP <= 0) {
            //checks if enemy 5 is dead
            battleWon();
          }
        } else {
          //only 4 enemies and all enemies are dead
          battleWon();
        }
      }
    } else {
      //only 3 enemies and all are dead
      battleWon();
    }
  }
}

function partyBonusLevel()
{
  console.log("LEVELING UP");
  //party members add 1 level
  console.log(Party.hero.LVL + " before lvl up");
  Party.hero.LVL += 1;
  Party.mage.LVL += 1;
  Party.priest.LVL += 1;


  // stats scaling
  //hp
  Party.hero.HP += Math.ceil(Math.random() * 10) + 7;
  Party.mage.HP += Math.ceil(Math.random() * 6) + 3;
  Party.priest.HP += Math.ceil(Math.random() * 8) + 5;
  
  //atk
  Party.hero.ATK += Math.ceil(Math.random() * 2);
  Party.mage.ATK += Math.ceil(Math.random() * 4);
  Party.priest.ATK += Math.ceil(Math.random() * 2);
  //def
  Party.hero.DEF += Math.floor(Math.random() * 4);
  Party.mage.DEF += Math.floor(Math.random() * 2);
  Party.priest.DEF += Math.floor(Math.random() * 3);
  //mdef
  Party.hero.MDEF += Math.floor(Math.random() * 2);
  Party.mage.MDEF += Math.floor(Math.random() * 5);
  Party.priest.MDEF += Math.floor(Math.random() * 4);
}

function partyLVLUP()
{
  console.log("LEVELING UP");
  //party members add 1 level
  console.log(Party.hero.LVL + " before lvl up");
  Party.hero.LVL += 1;
  Party.mage.LVL += 1;
  Party.priest.LVL += 1;


  // stats scaling
  //hp
  Party.hero.HP += Math.ceil(Math.random() * 10) + 7;
  Party.mage.HP += Math.ceil(Math.random() * 6) + 3;
  Party.priest.HP += Math.ceil(Math.random() * 8) + 5;
  
  //atk
  Party.hero.ATK += Math.ceil(Math.random() * 2);
  Party.mage.ATK += Math.ceil(Math.random() * 4);
  Party.priest.ATK += Math.ceil(Math.random() * 2);
  //def
  Party.hero.DEF += Math.floor(Math.random() * 4);
  Party.mage.DEF += Math.floor(Math.random() * 2);
  Party.priest.DEF += Math.floor(Math.random() * 3);
  //mdef
  Party.hero.MDEF += Math.floor(Math.random() * 2);
  Party.mage.MDEF += Math.floor(Math.random() * 5);
  Party.priest.MDEF += Math.floor(Math.random() * 4);

  //boss scaling
  boss.Phase1.LVL++;
  boss.Phase2.Body.LVL++;
  boss.Phase2.Arms.LVL++;
  boss.Phase3.LVL++;
  
  boss.Phase1.HP += Math.ceil(Math.random() * 6) + 3;
  boss.Phase1.ATK += Math.ceil(Math.random() * 4);
  boss.Phase1.DEF += Math.floor(Math.random() * 4);
  boss.Phase1.MDEF += Math.floor(Math.random() * 4);

  boss.Phase2.Body.HP += Math.ceil(Math.random() * 10) + 7;
  boss.Phase2.Body.ATK += Math.ceil(Math.random() * 4);
  boss.Phase2.Body.DEF += Math.floor(Math.random() * 4);
  boss.Phase2.Body.MDEF += Math.floor(Math.random() * 4);

  boss.Phase2.Arms.HP += Math.ceil(Math.random() * 8) + 5;
  boss.Phase2.Arms.ATK += Math.ceil(Math.random() * 4);
  boss.Phase2.Arms.DEF += Math.floor(Math.random() * 4);
  boss.Phase2.Arms.MDEF += Math.floor(Math.random() * 4);

  boss.Phase3.HP += Math.ceil(Math.random() * 4) + 1;
  boss.Phase3.ATK += Math.ceil(Math.random() * 6) + 1;
  boss.Phase3.DEF += Math.floor(Math.random() * 2);
  boss.Phase3.MDEF += Math.floor(Math.random() * 3);
  
  //enemies
  if (Party.hero.LVL != 2) //enemy scaling starts after hero lvl 2
  {
    //enemy HP scaling
    enemies.slime.HP += Math.ceil(Math.random() * 6) + 3;
    enemies.skeleton.HP += Math.ceil(Math.random() * 8) + 5;
    enemies.goblin.HP += Math.ceil(Math.random() * 8) + 5;
    enemies.orc.HP += Math.ceil(Math.random() * 11) + 8;
    enemies.kitsune.HP += Math.ceil(Math.random() * 6) + 4;
    enemies.werewolf.HP += Math.ceil(Math.random() * 7) + 4;
    enemies.mountainTengu.HP += Math.ceil(Math.random() * 6) + 4;
    enemies.skyTengu.HP += Math.ceil(Math.random() * 6) + 3;

    //enemy ATK
    enemies.slime.ATK += Math.ceil(Math.random() * 2) - 1;
    enemies.skeleton.ATK += Math.ceil(Math.random() * 8) + 5;
    enemies.goblin.ATK += Math.ceil(Math.random() * 8) + 5;
    enemies.orc.ATK += Math.ceil(Math.random() * 11) + 8;
    enemies.kitsune.ATK += Math.ceil(Math.random() * 6) + 4;
    enemies.werewolf.ATK += Math.ceil(Math.random() * 7) + 4;
    enemies.mountainTengu.ATK += Math.ceil(Math.random() * 6) + 4;
    enemies.skyTengu.ATK += Math.ceil(Math.random() * 6) + 3;

    //enemy DEF
    enemies.slime.DEF += Math.floor(Math.random() * 2);
    enemies.skeleton.DEF += Math.floor(Math.random() * 3);
    enemies.goblin.DEF += Math.floor(Math.random() * 3);
    enemies.orc.DEF += Math.floor(Math.random() * 4);
    enemies.kitsune.DEF += Math.floor(Math.random() * 2);
    enemies.werewolf.DEF += Math.floor(Math.random() * 3);
    enemies.mountainTengu.DEF += Math.floor(Math.random() * 3);
    enemies.skyTengu.DEF += Math.floor(Math.random() * 2);

    //enemy MDEF
    enemies.slime.MDEF += Math.floor(Math.random() * 2);
    enemies.skeleton.MDEF += Math.floor(Math.random() * 3);
    enemies.goblin.MDEF += Math.floor(Math.random() * 2);
    enemies.orc.MDEF += Math.floor(Math.random() * 2 - 0.1); //very low chancec to gain magic defense
    enemies.kitsune.MDEF += Math.floor(Math.random() * 5);
    enemies.werewolf.MDEF += Math.floor(Math.random() * 3);
    enemies.mountainTengu.MDEF += Math.floor(Math.random() * 4);
    enemies.skyTengu.MDEF += Math.floor(Math.random() * 5);
  }    
  console.log(Party.hero.LVL + " after lvl up");
  //crit chance will always remain constant

  //no speed since speed scaling will not change anything in turn order
  //Too high of speed stat can make dodges too common
}

//Heroes Animation
function playHeroAttackAnimation(heroId, attackGifId, attackGifDuration) {
  const heroGifElement = document.getElementById(heroId + '-gif');
  const attackGifElement = document.getElementById(attackGifId);
  const backgroundOverlay = document.getElementById('background-overlay');

  heroGifElement.style.display = 'none';
  // Set the position of the attack GIF to the center of the viewport
  attackGifElement.style.position = 'absolute';
  attackGifElement.style.top = '50%';
  attackGifElement.style.left = '50%';
  attackGifElement.style.transform = 'translate(-50%, -50%)';
  attackGifElement.style.zIndex = '1000';

  // Display the attack GIF
  backgroundOverlay.style.display = 'block';
  attackGifElement.style.display = 'block';

  // Hide the attack GIF after the animation duration
  setTimeout(() => {
    attackGifElement.style.display = 'none';
    backgroundOverlay.style.display = 'none';
    heroGifElement.style.display = 'block';
  }, attackGifDuration);
}

//Heroes attacks Enemies
function atkEnemy1(){
  atkEnemy(enemy1);
}
function atkEnemy2(){
atkEnemy(enemy2);
}
function atkEnemy3(){
atkEnemy(enemy3);
}
function atkEnemy4(){
atkEnemy(enemy4);
}
function atkEnemy5(){
atkEnemy(enemy5);
}

function atkEnemy(enemyNumber) {
  console.log("Attacking enemy " + enemyNumber.name);
  let attacker = turnOrder[0];

  // Get the heroId, attackGifId, and attackGifDuration based on the attacker
  let heroId, attackGifId, attackGifDuration;
  switch (attacker.name) {
    case 'Hero':
      heroId = 'hero1';
      attackGifId = 'hero-gif';
      attackGifDuration = 1200; // Adjust to match the attack GIF duration
      break;
    case 'Priest':
      heroId = 'hero2';
      attackGifId = 'priest-gif';
      attackGifDuration = 1000; // Adjust to match the attack GIF duration
      break;
    case 'Mage':
      heroId = 'hero3';
      attackGifId = 'mage-gif';
      attackGifDuration = 1000; // Adjust to match the attack GIF duration
      break;
    default:
      console.error("Unknown attacker: " + attacker.name);
      return;
  }

  // Play the attack animation for the hero and return a promise
  const heroAttackPromise = new Promise(resolve => {
    playHeroAttackAnimation(heroId, attackGifId, attackGifDuration);
    setTimeout(resolve, attackGifDuration); // Resolve the promise after the animation duration
  });

  // Wait for the hero attack animation to finish before continuing
  heroAttackPromise.then(() => {
    let damage = Math.ceil(turnOrder[0].ATK - enemyNumber.DEF * 0.8);
    if (damage <= 0) {
      damage = 1;
    }
    console.log(enemyNumber.name);
    console.log(enemyNumber.HP);
    if (Math.random() < turnOrder[0].CR) {
      damage = damage * 2; //crit hit
    }
    enemyNumber.HP -= damage;
    console.log(enemyNumber.HP);
    turnOrder[0].DamageDone += damage;

    let order1 = turnOrder.shift();
    turnOrder.push(order1);
    updateHealthBars();
    updateTurnOrderDisp();
    updateDamageCounts();
    enemyTurnCheck();
    checkVictory();
  });
}

let enemyAttackInProgress = false;

// Play enemy attack animation
function playEnemyAttackAnimation(enemyType) {
  return new Promise(resolve => {
    const enemyGifElement = document.getElementById(enemyType + '-attack-gif');
    const backgroundOverlay = document.getElementById('enemyBackground-overlay');

    enemyGifElement.style.position = 'absolute';
    enemyGifElement.style.top = '50%';
    enemyGifElement.style.left = '50%';
    enemyGifElement.style.transform = 'translate(-50%, -50%) scaleX(-1)';
    enemyGifElement.style.zIndex = '1000';

    backgroundOverlay.style.display = 'block';
    enemyGifElement.style.display = 'block';

    setTimeout(() => {
      enemyGifElement.style.display = 'none';
      backgroundOverlay.style.display = 'none';
      enemyAttackInProgress = false;
      resolve();
    }, 1000);
  });
}

// Enemy attack function
async function enemyAttack(Attacker) {
  if (enemyAttackInProgress) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  enemyAttackInProgress = true;

  console.log(turnOrder[0].name);
  let atked = Math.floor(Math.random() * aliveHeroes.length);
  console.log("Index of attacked: " + atked);
  switch (atked) {
    case 0:
      await atkHeroParty(Attacker, aliveHeroes[0]);
      break;
    case 1:
      await atkHeroParty(Attacker, aliveHeroes[1]);
      break;
    case 2:
      await atkHeroParty(Attacker, aliveHeroes[2]);
      break;
    case 3:
      await atkHeroParty(Attacker, aliveHeroes[3]);
      break;
  }

  await playEnemyAttackAnimation(Attacker.type);
}



function dodgeChance(SPEED){
if (Math.random() < (0.1 + (SPEED/1000))) { //dodge chance 10% + Speed/1000
    return true;
  } 
  else {
    return false;
  }
}

function atkHeroParty(Attacker, heroAttacked){
console.log("Enemy Now Attackin!");
console.log(Attacker.name + " Attacked " + heroAttacked.name);

// Calculate the damage based on enemy's attack and hero's defense
let damage;
if ("isMagic" in Attacker)
{
  damage = Math.ceil(Attacker.ATK*1.5 - Math.ceil(heroAttacked.MDEF * 0.8)); //80% of defense used to mitigate attack
}
else
{
  damage = Math.ceil(Attacker.ATK*1.5 - Math.ceil(heroAttacked.DEF * 0.8));
}

let t = dodgeChance(heroAttacked.SPD);
console.log("Dodged = " + t);

if (t) {
  DispDodgeMessage(heroAttacked.DodgeID);
  heroAttacked.Dodged = true;
  heroAttacked.DodgeCounter += 1;
  damage = 0;
}
else{
  heroAttacked.Dodged = false;
  if(damage < 0)
  {
    damage = 1;
  }
}

if (Math.random() < Attacker.CR)
{
  damage = damage * 2;  //crit hit
}
// Update the hero's health
console.log(heroAttacked.HP);
heroAttacked.HP -= damage;
console.log(heroAttacked.HP); 
heroAttacked.DamageTaken += damage;

if(heroAttacked.HP <=0)
{
  aliveHeroes.splice(aliveHeroes.indexOf(heroAttacked), 1);
}

// Update health bars and check victory condition
updateDamageCounts();
updateHealthBars();
checkVictory();
}

//Title Screen JS Start
// Array of dialog texts
const dialogTexts = [
  "The Chaos Domain was once crowned as the place of beginnings, a place named after the supreme element of Chaos, even superior to the Time and Space Domains. From mortals to immortals, everyone lived harmoniously, adhering to the commands of the Supreme Order of Chaos...",
  "Every race prospered in the reign of the Supreme Emperor of Chaos, the head of the Supreme Order and the wielder of the Divine Sword Omega. But a disaster struck that began the agony of the myriad races...",
  "The Supreme Emperor of Chaos ascended to Godhood and left his descendants to handle the matters of the domain. This caused a massive fight between the children, and allowed the anomaly to attack...",
  "With the war remains that was left from the internal war of the Supreme Order, the Divine Emperor of Death, Oeneri comprehended the Law of Chaos, this led him to gather his forces and launch an all out war with the exhausted force of the Order...",
  "The Army of Death ultimately defeated the current Chaos Order, and for hundreds of years, the Chaos Domain was renamed to be Chaos' Domain, a place controlled by one person. The former glorious domain was now a desolate place filled with death and chaos..."
];

const dialogMage = [
  "User: Who are you, mysterious sorceress, and why do you seek my aid?",
  "Irene: Adventurer, your arrival is no mere coincidence but a twist of fate. I, Irene, daughter of the darkness, implore your aid in my quest for redemption and revenge against the father who cast me aside like a forgotten spell.",
  "User:  Your story is tragic, Irene. But, how can I be sure you're not plotting against me?",
  "Irene: I understand your caution, but our goals align. Together, we can defy the darkness that binds us. With your help, we can face my father and rewrite our fates.",
  "User: Although we have the same enemy, we have different goals. I aim to bring peace to the Chaos Domain, to rewrite every person’s fate, and to be a worthy wielder of the Omega.",
"Irene: Your quest is noble, adventurer, but do not underestimate the ties that bind our destinies. By facing my father, we may uncover truths that illuminate the path to your goals. Together, we can shape the Chaos Domain into a realm where peace and balance reign supreme.",
"User: You speak wisely, Irene. Perhaps our paths are not so divergent after all. I will lend you my aid, but know that my ultimate allegiance lies with the greater good.",
"Irene: Your alliance is a boon, adventurer. Together, we shall navigate the shadows of betrayal and forge a new destiny where light triumphs over darkness and peace prevails over chaos.",
"User: Then let us embark on this journey together, Irene. For in unity, we shall find the strength to overcome any obstacle that dares to stand in our way."
];

const dialogPriest = [
"User: Priestess Venice, I come to you with a matter of utmost importance. Our land is under threat from the malevolent forces of Oeneri, and only with your divine guidance do we stand a chance at defeating him and purifying the Omega.",
"Venice: Oeneri... the darkness that has plagued our realm for centuries. It is a formidable adversary indeed. But why do you seek my aid in this matter?",
"User: Your connection to the divine, Priestess, is unparalleled. With your guidance, we can tap into the true power of the divine light, the very essence needed to banish Oeneri and cleanse the Omega of his taint.",
"Venice: The task you propose is daunting, [User's Name]. To wield such power is to invite great risk, not only to ourselves but to all who dwell in this realm.",
"User: I understand the risks, Priestess, but the fate of our world hangs in the balance. Together, we can harness the power of faith and righteousness to overcome any obstacle that stands in our way.",
"Venice: Very well, Great Warrior. For the sake of our world and all who inhabit it, I shall lend you my aid. But know this: the path ahead will be fraught with peril, and the cost of victory may be great.",
"User: Thank you, Priestess Venice. With your guidance and the strength of our conviction, I believe we can triumph over the darkness and restore balance to our land.",
"Venice: May the divine light illuminate our path and grant us the strength to face whatever challenges lie ahead. Let us embark on this journey together, [User's Name], and may our faith be our guide."
];

const dialogThief = [
"User: Who goes there? Show yourself!",
"Ferdinand: Easy there, friend. No need for hostility. The name's Ferdinand, just a humble traveler trying to navigate these troubled times.",
"User: A traveler, huh? In these lands, trust is a rare commodity. What brings you here?",
"Ferdinand: Curiosity, perhaps, or a stroke of fate. I overheard whispers of a quest, a journey fraught with peril and opportunity. And as a seeker of both, I couldn't resist the temptation to investigate further.",
"User: You're a bold one, Ferdinand. But boldness alone won't earn my trust. What assurance do I have that you won't turn your dagger against us when the opportunity arises?",
"Ferdinand: Ah, a fair question indeed. Trust is earned, not given freely. But let me assure you, my friend, my loyalty lies with those who offer the promise of reward and advancement. And in our shared endeavor, I see the potential for both.",
"User: You speak of loyalty, yet your words ring hollow. How can I be certain you won't betray me for your own gain?",
"Ferdinand: Actions speak louder than words, my friend. Judge me not by my words, but by my deeds. Give me a chance, and together, we may yet achieve greatness.",
"User: Very well, Ferdinand. I'll keep a wary eye on you, but for now, let us proceed cautiously. Our goals may align, but trust must be earned.",
"Ferdinand: Agreed, my friend. Let us navigate the twists and turns of fate together, and may our journey lead us to fortune and glory."

]


let currentDialogIndex = 0;
let dialogCompleted = false;

function startNewGame() {
  toggleOverlay();
  setTimeout(() => {
      toggleOverlay();
      document.querySelector(".chaos-domain").classList.add("bg2");
      document.getElementById("mainDialog").style.display = "block";
      typeWriter(dialogTexts[currentDialogIndex]);
  }, 1000);

  console.log("Starting new game...");
  document.querySelector(".title").style.display = "none";
  document.querySelector(".subtitle").style.display = "none";
  document.querySelector(".sword").style.display = "none";
  document.querySelector(".button-container").style.display = "none";
}

function openSettings() {
  console.log("Opening settings...");
  toggleOverlay();
}

function exitGame() {
  console.log("Exiting game...");
  toggleOverlay();
}

function toggleOverlay() {
  var overlayTop = document.querySelector(".overlay-top");
  var overlayBottom = document.querySelector(".overlay-bottom");
  overlayTop.classList.toggle("overlay-active");
  overlayBottom.classList.toggle("overlay-active");
}

document.getElementById("mainDialog").addEventListener("click", function() {
  if (dialogCompleted && currentDialogIndex < dialogTexts.length - 1) {
      currentDialogIndex++;
      toggleOverlay();
      setTimeout(() => {
          toggleOverlay();
          const chaosDomain = document.querySelector(".chaos-domain");

          if (currentDialogIndex === 1) {
              chaosDomain.classList.add("bg3");
          } else if (currentDialogIndex === 2) {
              chaosDomain.classList.remove("bg3");
              chaosDomain.classList.add("bg4");
          } else if (currentDialogIndex === 3) {
              chaosDomain.classList.remove("bg4");
              chaosDomain.classList.add("bg5");
          } else if (currentDialogIndex === 4) {
              chaosDomain.classList.remove("bg5");
              chaosDomain.classList.add("bg6");
          }

          document.getElementById("mainDialog").textContent = "";
          dialogCompleted = false; // Reset dialog completion state
          setTimeout(() => {
              typeWriter(dialogTexts[currentDialogIndex]);
          }, 100);
      }, 1000);
  }else if (dialogCompleted && currentDialogIndex === 4) {
    // Dialog index is 4, show the maze and hide the title screen
    toggleOverlay();
    setTimeout(() => {
        toggleOverlay();
        hideTitleScreen();
        showMaze();
    }, 1000);
}
});

function showMaze() {
  console.log("All dialogues finished. Showing maze...");
  document.getElementById("maze_container").style.display = "block"; // Show maze container
}

function hideTitleScreen() {
  console.log("Hiding title screen...");
  document.getElementById("title-screen").style.display = "none";
}

function typeWriter(text) {
  const dialogElement = document.getElementById("mainDialog");
  let charIndex = 0;
  const typing = setInterval(() => {
      if (charIndex === text.length) {
          clearInterval(typing);
          dialogCompleted = true; // Mark dialog as completed
      } else {
          dialogElement.textContent += text.charAt(charIndex);
          charIndex++;
      }
  }, 2);
}

// Title Screen JS End

function gameOver() {
  const blackScreen = document.getElementById('blackScreen');
  blackScreen.style.display = 'block';
  blackScreen.style.opacity = '0'; 

  setTimeout(() => {
    blackScreen.style.transition = 'opacity 1s ease-in-out';
    blackScreen.style.opacity = '1'; 
  }, 10); 

  // Display the game over message
  const gameOverMessage = document.createElement("div");
  gameOverMessage.id = "game-over-message";
  gameOverMessage.textContent = "Game Over";
  gameOverMessage.style.position = "fixed";
  gameOverMessage.style.top = "50%";
  gameOverMessage.style.left = "50%";
  gameOverMessage.style.transform = "translate(-50%, -50%)";
  gameOverMessage.style.color = "red";
  gameOverMessage.style.fontSize = "72px"; 
  gameOverMessage.style.zIndex = "1001"; 
  gameOverMessage.style.opacity = "0"; 

  document.body.appendChild(gameOverMessage);

  setTimeout(() => {
    gameOverMessage.style.transition = 'opacity 1s ease-in-out';
    gameOverMessage.style.opacity = '1';
  }, 1000); 


  setTimeout(() => {
    location.reload();
  }, 5000); 
}






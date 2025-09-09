const $startScreen = document.querySelector('#start_screen');
const $gameMenu = document.querySelector('#game_menu');
const $battleMenu = document.querySelector('#battle_menu');

const $heroName = document.querySelector('#hero_name');
const $heroLevel = document.querySelector('#hero_level');
const $heroHp = document.querySelector('#hero_hp');
const $heroXp = document.querySelector('#hero_xp');
const $heroAtk = document.querySelector('#hero_atk');

const $monsterName = document.querySelector('#monster_name');
const $monsterHp = document.querySelector('#monster_hp');
const $monsterAtk = document.querySelector('#monster_atk');
const $message = document.querySelector('#message');

class Game {
  constructor(name) {
    this.monster = null;
    this.hero = null;
    this.monsterList = [
      { name: '슬라임', hp: 25, atk: 10, xp: 10 },
      { name: '스켈레톤', hp: 50, atk: 15, xp: 20 },
      { name: '마왕', hp: 150, atk: 35, xp: 50 },
    ];
    this.start(name);
  }
  start(name) {
    $gameMenu.addEventListener('submit', this.onGameMenuInput);
    $battleMenu.addEventListener('submit', this.onBattleMenuInput);
    this.changeScreen('game');
    this.hero = new Hero(name);
    this.updateHeroState();
  }
  changeScreen(screen) {
    if (screen === 'start') {
      $startScreen.style.display = 'block';
      $gameMenu.style.display = 'none';
      $battleMenu.style.display = 'none';
    } else if (screen === 'game') {
      $startScreen.style.display = 'none';
      $gameMenu.style.display = 'block';
      $battleMenu.style.display = 'none';
    } else if (screen === 'battle') {
      $startScreen.style.display = 'none';
      $gameMenu.style.display = 'none';
      $battleMenu.style.display = 'block';
    }
  }
  onGameMenuInput = (event) => {
    event.preventDefault();
    const input = event.target['menu_input'].value;
    if (input === '1') {  //모험
      this.changeScreen('battle');
      this.createMonster();
    } else if (input === '2') {  // 휴식

    } else if (input === '3') {  // 종료

    }
  }
  onBattleMenuInput = (event) => {
    event.preventDefault();
    const input = event.target['battle_input'].value;;
    const { hero, monster } = this;
    if (input === '1') {  // 공격
      hero.attack(monster);
      monster.attack(hero);
      if (hero.hp <= 0) {
        this.showMessage(`${hero.lev}에서 사망하였습니다...`);
        this.quit()
      } else if (monster.hp <= 0) {
        this.showMessage(`몬스터를 잡아 ${monster.xp}의 경험치를 얻었다.`);
        hero.getXp(monster.xp);
        this.monster = null;
        this.updateHeroState();
        this.updateMonsterState();
        this.changeScreen('game');
      } else {
        this.showMessage(`${hero.atk}의 피해를 주고, ${monster.atk}의 피해를 받았다!`);
        this.updateHeroState();
        this.updateMonsterState();
      }
    }
     else if (input === '2') {  // 회복
      hero.heal(monster);
      this.updateHeroState();
      this.updateMonsterState();
      this.showMessage(`Hp를 20 회복했고, ${monster.atk}의 피해를 받았습니다`);
    } else if (input === '3') {  // 도망

    }
  }
  quit() {
    this.hero = null;
    this.monster = null;
    this.updateHeroState();
    this.updateMonsterState();
    $gameMenu.removeEventListener('submit', this.onGameMenuInput);
    $battleMenu.removeEventListener('submit', this.onBattleMenuInput);
    this.changeScreen('start');
    game = null;
  }
  updateHeroState() {
    const { hero } = this;
    if (hero === null) {
      $heroName.textContent = '';
      $heroLevel.textContent = '';
      $heroHp.textContent = '';
      $heroXp.textContent = '';
      $heroAtk.textContent = '';
      return;
    }
    $heroName.textContent = hero.name;
    $heroLevel.textContent = `${hero.lev}Lev.`;
    $heroHp.textContent = `HP : ${hero.hp}/${hero.maxhp}`;
    $heroXp.textContent = `XP : ${hero.xp}/${hero.xp * 15}`;
    $heroAtk.textContent = `ATK : ${hero.atk}`;
  }
  createMonster() {
    const randomIndex = Math.floor(Math.random() * this.monsterList.length);
    const randomMonster = this.monsterList[randomIndex];
    this.monster = new Monster (
      randomMonster.name,
      randomMonster.hp,
      randomMonster.atk,
      randomMonster.xp,
    );
    this.updateMonsterState();
    this.showMessage(`몬스터를 마주쳤다! ${this.monster.name}인 것 같다!`);
  }
  updateMonsterState() {
    const { monster } = this;
    if (monster === null) {
      $monsterName.textContent = '';
      $monsterHp.textContent = '';
      $monsterAtk.textContent = '';
      return;
    }
    $monsterName.textContent = monster.name;
    $monsterHp.textContent = `HP: ${monster.hp}/${monster.maxhp}`;
    $monsterAtk.textContent = `ATK: ${monster.atk}`;
  }
  showMessage(text) {
    $message.textContent = text;
  }
}

class Unit {
  constructor(name, hp, atk, xp) {
    this.name = name;
    this.hp = hp;
    this.maxhp = hp;
    this.atk = atk;
    this.xp = xp;
  }
  attack(target) {
    target.hp -= this.atk;
  }
}

class Hero extends Unit {
  constructor(name) {
    super(name, 100, 10, 0);
    this.lev = 1;
  }
  heal(monster) {
    const healHp = Math.min(this.hp += 20, this.maxhp);
    this.hp = healHp;
    this.hp -= monster.atk;
  }
  getXp(xp) {
    this.xp += this.xp;
    if (this.xp >= this.lev * 15) {
      this.xp -= this.lev * 15;
      this.lev += 1;
      this.maxhp += 5;
      this.atk += 5;
      this.hp = this.maxhp;
      game.showMessage(`레벨업! ${this.lev}레벨이 되었습니다!`)
    }
  }
}

class Monster extends Unit {

}

let game = null;
$startScreen.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = event.target['user_name'].value;
  game = new Game(name);
})
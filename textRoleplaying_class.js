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
    $startScreen.style.display = (screen === 'start') ? 'block' : 'none';
    $gameMenu.style.display = (screen === 'game') ? 'block' : 'none';
    $battleMenu.style.display = (screen === 'battle') ? 'block' : 'none';
  }

  onGameMenuInput = (event) => {
    event.preventDefault();
    const input = event.target['menu_input'].value.trim();
    event.target.reset();

    if (input === '1') {
      this.changeScreen('battle');
      this.createMonster();
    } else if (input === '2') {
      const healed = this.hero.rest();
      this.updateHeroState();
      this.showMessage(`휴식을 취해 HP를 ${healed} 회복했습니다.`);
    } else if (input === '3') {
      this.quit();
      this.showMessage('게임을 종료합니다.');
    } else {
      this.showMessage('1~3 중 하나를 입력하세요.');
    }
  }

  onBattleMenuInput = (event) => {
    event.preventDefault();
    const input = event.target['battle_input'].value.trim();
    const { hero, monster } = this;
    event.target.reset();

    if (input === '1') { // 공격
      hero.attack(monster);
      monster.attack(hero);

      if (hero.hp <= 0) {
        this.showMessage(`${hero.lev} 레벨에서 사망하였습니다...`);
        this.quit();
      } else if (monster.hp <= 0) {
        this.showMessage(`${monster.name}을(를) 잡고 경험치 ${monster.xp}를 얻었습니다.`);
        hero.getXp(monster.xp);
        this.monster = null;
        this.updateHeroState();
        this.updateMonsterState();
        this.changeScreen('game');
      } else {
        this.showMessage(`${hero.name}이(가) ${hero.atk}의 피해를 주고, ${monster.name}에게 ${monster.atk}의 피해를 받았습니다.`);
        this.updateHeroState();
        this.updateMonsterState();
      }

    } else if (input === '2') { // 회복
      hero.heal(monster);
      this.updateHeroState();
      this.updateMonsterState();
      if (hero.hp <= 0) {
        this.showMessage(`회복 중 공격을 받아 사망하였습니다...`);
        this.quit();
      } else {
        this.showMessage(`${hero.name}이(가) HP를 회복했지만, ${monster.name}에게 ${monster.atk}의 피해를 입었습니다.`);
      }

    } else if (input === '3') { // 도망
      this.showMessage(`${monster.name}에게서 도망쳤습니다.`);
      this.monster = null;
      this.updateMonsterState();
      this.changeScreen('game');
    } else {
      this.showMessage('1~3 중 하나를 입력하세요.');
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
    if (!hero) {
      $heroName.textContent = '';
      $heroLevel.textContent = '';
      $heroHp.textContent = '';
      $heroXp.textContent = '';
      $heroAtk.textContent = '';
      return;
    }
    $heroName.textContent = hero.name;
    $heroLevel.textContent = `${hero.lev} Lev.`;
    $heroHp.textContent = `HP : ${hero.hp}/${hero.maxhp}`;
    $heroXp.textContent = `XP : ${hero.xp}/${hero.lev * 15}`;
    $heroAtk.textContent = `ATK : ${hero.atk}`;
  }

  createMonster() {
    const randomIndex = Math.floor(Math.random() * this.monsterList.length);
    const { name, hp, atk, xp } = this.monsterList[randomIndex];
    this.monster = new Monster(name, hp, atk, xp);
    this.updateMonsterState();
    this.showMessage(`${this.monster.name}이(가) 나타났다!`);
  }

  updateMonsterState() {
    const { monster } = this;
    if (!monster) {
      $monsterName.textContent = '';
      $monsterHp.textContent = '';
      $monsterAtk.textContent = '';
      return;
    }
    $monsterName.textContent = monster.name;
    $monsterHp.textContent = `HP : ${monster.hp}/${monster.maxhp}`;
    $monsterAtk.textContent = `ATK : ${monster.atk}`;
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
    const healAmount = Math.min(20, this.maxhp - this.hp);
    this.hp += healAmount;
    this.hp -= monster.atk;  // 회복 중 몬스터 공격 피해
  }

  rest() {
    const healAmount = Math.min(20, this.maxhp - this.hp);
    this.hp += healAmount;
    return healAmount;
  }

  getXp(xp) {
    this.xp += xp;
    const xpNeeded = this.lev * 15;
    if (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.lev += 1;
      this.maxhp += 5;
      this.atk += 5;
      this.hp = this.maxhp;
      game.showMessage(`레벨업! ${this.lev}레벨이 되었습니다!`);
    }
  }
}

class Monster extends Unit {
  // 현재 추가 로직 없으니 기본 상속만
}

// 전역 변수 game 선언
let game = null;

// 게임 시작 이벤트
$startScreen.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = event.target['user_name'].value.trim();
  if (!name) {
    alert('이름을 입력하세요!');
    return;
  }
  game = new Game(name);
  event.target.reset();  // 입력폼 초기화
});

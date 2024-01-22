/*
* Tento script obsahuje hlavní herní logiku
*/

const MIN_DISTANCE_BETWEEN_DIAMONDS = 150; // Konstanta pro minimální vzdálenost mezi diamanty (aby se netvořily příliš blízko sebe)
const CANVAS_WIDTH = 1024; // Šířka hracího plátna (px)
const CANVAS_HEIGHT = 768; // Výška hracího plátna (px)

let player; // Proměnná pro uložení instance hráče
let diamonds = []; // Pole, které se naplní instancemi diamantů
let score = 0; // Celkově získané body za sebrání diamantů
let backgroundMusic, collectSound; // Zvuky ve hře
let gameStarted = false; // Proměnná ukládající true nebo false podle toho, jestli hra začala

function preload() { // Funkce, která přednačte zvuky
    soundFormats('mp3');
    backgroundMusic = loadSound('Sounds/purple_smasher.mp3');
    collectSound = loadSound('Sounds/collect.mp3');
}

function setup() { // Tato funkce se zavolá po načtení stránky, vytvoří plátno a hlavní menu
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    createMenu();
}

function createMenu() { // Vykreslení hlavního menu
    background(0);
    // Tlačítko `Play!`
    let startButton = createButton('Play!');
    startButton.mousePressed(startGame);
    startButton.class('start-button');
    startButton.position(875, 400); // Přibližné vycentrování tlačítka
    // Nadpis hry
    fill(255);
    textSize(75);
    text('Diamond Collector', 200, 250);
    // Verze hry
    fill(255);
    textSize(32);
    text('v1.0.0', 920, 750);
}

function startGame() { // Funkce, která při startu hry skryje tlačítko, vytvoří hráče a pár diamantů
    if (!gameStarted) {
        document.querySelector('.start-button').style.visibility = 'hidden';
        player = new Player(400, 300, 4);
        spawnDiamonds(5);
        playBackgroundMusic(); // Přehrávání hudby do pozadí během hry
        gameStarted = true;
    }
}

function playBackgroundMusic() { // Funkce, která zajistí, že hudba na pozadí bude hrát opakovaně, nastavení hlasitosti a povolení zvuku
    backgroundMusic.play();
    backgroundMusic.loop();
    backgroundMusic.setVolume(0.3);
    userStartAudio();
}

function playCollectSound() { // Funkce, která přehraje zvuk sebrání diamantu a nastavení jeho hlasitost
    collectSound.play();
    collectSound.setVolume(0.5);
    userStartAudio();
}

let collectedDiamonds = { // Objekt, který uchovává počet modrých, zelených a fialových diamantů
    blue: 0,
    green: 0,
    purple: 0
};

function draw() { // Hlavní vykreslovací funkce
    if (gameStarted) {
        background(0); // Nastavení pozadí na černou barvu

        player.animate(); // Animování postavičky hráče
        player.move(); // Ovládání pohybu hráče
        player.display(); // Nastavení statické pozice hráče

        for (let i = 0; i < diamonds.length; i++) { // Cyklus, který se stará o diamanty
            if (!diamonds[i].collected) { // Pokud není diamant sebrán, tak ho zobraz
                diamonds[i].show();
                if (diamonds[i].hits(player.x, player.y, player.spriteWidth, player.spriteHeight)) { // Pokud se hráč dotkne diamantu,
                    diamonds[i].collected = true; // tak ho smaž a
                    score += diamonds[i].getScore(); // hráči připiš počet bodů podle toho, který typ diamantu sebral
                    playCollectSound(); // Přehraj zvuk sebrání
                    collectedDiamonds[diamonds[i].color]++; // Zvýšení počtu sebraných diamantů podle barvy (modrá, zelená, fialová)
                }
            }
        }

        let allCollected = diamonds.every(diamond => diamond.collected); // Všechny diamanty jsou sebrané

        if (allCollected) { // Pokud jsou všechny sebrané,
            spawnDiamonds(5); // vytvoř novou várku náhodně rozmístěných diamantů
        }

        fill(255);
        textSize(30);
        text('Points: ' + score, 20, 40); // Vykreslení bodů za sebrané diamanty

        textSize(18);
        fill('#03bafc');
        text('Blue diamonds: ' + collectedDiamonds.blue, width - 200, 60); // Výpis celkem sebraných modrých diamantů
        fill('#03fc28');
        text('Green diamonds: ' + collectedDiamonds.green, width - 200, 90); // Výpis celkem sebraných zelených diamantů
        fill('#a903fc');
        text('Purple diamonds: ' + collectedDiamonds.purple, width - 200, 120); // Výpis celkem sebraných fialových diamantů

        if (!backgroundMusic.isPlaying()) { // Pokud hudba v pozadí přestala hrát (skončila),
            backgroundMusic.play(); // přehraj ji znova
        }
    }
}

function isTooCloseToOtherDiamonds(x, y, size) { // Jak jsou diamanty u sebe blízko
    for (let i = 0; i < diamonds.length; i++) {
        let d = dist(x, y, diamonds[i].x, diamonds[i].y);
        let minDistance = MIN_DISTANCE_BETWEEN_DIAMONDS + diamonds[i].size / 2 + size / 2;
        if (d < minDistance) { // Pokud jsou diamanty u sebe moc blízko
            return true; // vrať true
        }
    }
    return false; // jinak false
}

function spawnBlueDiamond(x, y) { // Funkce pro vytvoření modrého diamantu
    diamonds.push(new Diamond(x, y, 'blue'));
}

function spawnGreenDiamond(x, y) { // Funkce pro vytvoření zeleného diamantu
    diamonds.push(new Diamond(x, y, 'green'));
}

function spawnPurpleDiamond(x, y) { // Funkce pro vytvoření fialového diamantu
    diamonds.push(new Diamond(x, y, 'purple'));
}

function spawnDiamonds(num) { // Hlavní funkce pro vytvoření diamantů
    diamonds = []; // Vynulování pole diamantů
    const minDistanceFromEdges = 50; // Minimální vzdálenost od okrajů plátna, kde se diamant může vytvořit

    function generateRandomPosition() { // Určení náhodné pozice diamantu
        return {
            x: random(minDistanceFromEdges, width - minDistanceFromEdges),
            y: random(minDistanceFromEdges, height - minDistanceFromEdges)
        };
    }

    function spawnBlue() { // Vytvoř modrý diamant
        let position;
        do {
            position = generateRandomPosition();
        } while (isTooCloseToOtherDiamonds(position.x, position.y, 20));
        spawnBlueDiamond(position.x, position.y);
    }

    function spawnGreen() { // Vytvoř zelený diamant
        let position;
        do {
            position = generateRandomPosition();
        } while (isTooCloseToOtherDiamonds(position.x, position.y, 20));
        spawnGreenDiamond(position.x, position.y);
    }

    function spawnPurple() { // Vytvoř fialový diamant
        if (random() > 0.5) { // Šance 50/50
            let position;
            do {
                position = generateRandomPosition();
            } while (isTooCloseToOtherDiamonds(position.x, position.y, 20));
            spawnPurpleDiamond(position.x, position.y);
        }
    }

    let minBlueCount = 7; // Minimální počet modrých diamantů v aktuální várce
    let maxBlueCount = 12; // Maximální počet modrých diamantů v aktuální várce
    let minGreenCount = 1; // Minimální počet zelených diamantů v aktuální várce
    let maxGreenCount = 3; // Maximální počet zelených diamantů v aktuální várce

    let blueCount = floor(random(minBlueCount, maxBlueCount + 1)); // Náhodná šance na počet modrých diamantů
    let greenCount = floor(random(minGreenCount, maxGreenCount + 1)); // Náhodná šance na počet zelených diamantů

    for (let i = 0; i < blueCount; i++) { // Cyklus pro vytvoření modrých diamantů
        spawnBlue(); 
    }

    for (let i = 0; i < greenCount; i++) { // Cyklus pro vytvoření zelených diamantů
        spawnGreen(); 
    }

    spawnPurple(); // Vytvoření fialových diamantů
}
/*
* Tento script obsahuje třídy pro hráče a diamanty
*/

class Player { // Třída pro vytvoření hráče
    constructor(x, y, speed) { // Konstruktor, který přijímá pozici X, Y a rychlost pohybu hráče
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.currentFrame = 0; // Aktuální rámeček spritu
        this.currentDirection = 'down'; // Aktuální pozice hráče, dolní je výchozí
        this.spriteHeight = 64; // Výška spritu
        this.spriteWidth = 64; // Šířka spritu
        this.totalFrames = 4; // Rámečky, které obsahuje spritesheet horizontálně i vertikálně
        this.spritesheet = loadImage('Sprites/player.png'); // Načtení spritesheetu hráče
    }

    move() { // Pohyb hráče pomocí šipek
        if (keyIsDown(LEFT_ARROW) && this.x > 0) {
            this.x -= this.speed;
            this.currentDirection = 'left';
        } else if (keyIsDown(RIGHT_ARROW) && this.x < width - this.spriteWidth) {
            this.x += this.speed;
            this.currentDirection = 'right';
        } else if (keyIsDown(UP_ARROW) && this.y > 0) {
            this.y -= this.speed;
            this.currentDirection = 'up';
        } else if (keyIsDown(DOWN_ARROW) && this.y < height - this.spriteHeight) {
            this.y += this.speed;
            this.currentDirection = 'down';
        }
    }

    animate() { // Vykreslení animace hráče
        if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) && !keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
            this.currentFrame = 0;
        } else {
            if (frameCount % 10 === 0) {
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            }
        }
    }

    display() { // Nastavení statické pozice hráče
        let sx = this.currentFrame * this.spriteWidth;
        let sy;

        if (this.currentDirection === 'down') {
            sy = 0;
        } else if (this.currentDirection === 'left') {
            sy = this.spriteHeight;
        } else if (this.currentDirection === 'right') {
            sy = 2 * this.spriteHeight;
        } else if (this.currentDirection === 'up') {
            sy = 3 * this.spriteHeight;
        }

        image(this.spritesheet, this.x, this.y, this.spriteWidth, this.spriteHeight, sx, sy, this.spriteWidth, this.spriteHeight);
    }
}

class Diamond { // Třída pro vytvoření diamantu
    constructor(x, y, color) { // Jako parametry bere pozici X, Y a barvu diamantu
        this.x = x;
        this.y = y;
        this.size = 40; // Velikost jednoho diamantu
        this.color = color;
        this.diamondImage = loadImage(`Sprites/${color}_diamond.gif`); // Načtení gifu diamantu podle barvy
        this.collected = false;
    }

    getScore() { // Přidání bodů za určitou barvu diamantu
        if (this.color === 'green') { // Za zelený 20 bodů
            return 20;
        } else if (this.color === 'blue') { // Za modrý 10 bodů
            return 10; 
        } else if (this.color === 'purple') { // Za fialový 50 bodů
            return 50;
        }
    }

    update() {
        this.size = 30 + sin(frameCount * 0.05) * 5;
    }

    show() { // Zobrazení diamantu
        let scaledSize = this.size;
        image(this.diamondImage, this.x - scaledSize / 2, this.y - scaledSize / 2, scaledSize, scaledSize);
    }

    hits(playerX, playerY, playerW, playerH) { // Zjišťovaní detekce kolize mezi hráčem a diamantem
        if (!this.collected) {
            let d = dist(this.x + this.size / 2, this.y + this.size / 2, playerX + playerW / 2, playerY + playerH / 2);
            return d < this.size / 2 + playerW / 2;
        }
        return false;
    }
}
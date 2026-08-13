/* =====================================================
   CUIA.IO
   SCRIPT.JS
   MOTOR PRINCIPAL DO JOGO
===================================================== */


/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


/* =====================================================
   ESTADO DO JOGO
===================================================== */

const game = {
    running: false,
    paused: false,

    level: 1,

    score: 0,
    xp: 0,

    time: 0,
    maxTime: 180,

    objectsEaten: 0
};


/* =====================================================
   MUNDO
===================================================== */

const world = {
    width: 5000,
    height: 5000,

    background: "#65a765"
};


/* =====================================================
   CÂMERA
===================================================== */

const camera = {
    x: 0,
    y: 0,

    zoom: 1,
    targetZoom: 1,

    follow(target) {

        this.targetZoom =
            Math.max(
                0.45,
                1 - target.radius / 1500
            );

        this.zoom +=
            (this.targetZoom - this.zoom) * 0.05;

        const viewWidth =
            canvas.width / this.zoom;

        const viewHeight =
            canvas.height / this.zoom;

        this.x =
            target.x - viewWidth / 2;

        this.y =
            target.y - viewHeight / 2;

        this.x = Math.max(
            0,
            Math.min(
                this.x,
                world.width - viewWidth
            )
        );

        this.y = Math.max(
            0,
            Math.min(
                this.y,
                world.height - viewHeight
            )
        );
    }
};


/* =====================================================
   CONTROLES
===================================================== */

const keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

window.addEventListener("keydown", event => {

    switch (event.key) {

        case "ArrowUp":
        case "w":
        case "W":
            keys.up = true;
            break;

        case "ArrowDown":
        case "s":
        case "S":
            keys.down = true;
            break;

        case "ArrowLeft":
        case "a":
        case "A":
            keys.left = true;
            break;

        case "ArrowRight":
        case "d":
        case "D":
            keys.right = true;
            break;
    }
});

window.addEventListener("keyup", event => {

    switch (event.key) {

        case "ArrowUp":
        case "w":
        case "W":
            keys.up = false;
            break;

        case "ArrowDown":
        case "s":
        case "S":
            keys.down = false;
            break;

        case "ArrowLeft":
        case "a":
        case "A":
            keys.left = false;
            break;

        case "ArrowRight":
        case "d":
        case "D":
            keys.right = false;
            break;
    }
});


/* =====================================================
   MOUSE
===================================================== */

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

canvas.addEventListener("mousemove", event => {

    const rect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});


/* =====================================================
   JOYSTICK
===================================================== */

const joystick = {
    active: false,
    x: 0,
    y: 0
};

const joystickBox =
    document.getElementById("joystick");

const stick =
    document.getElementById("stick");

if (joystickBox) {

    joystickBox.addEventListener(
        "touchmove",
        event => {

            event.preventDefault();

            const touch = event.touches[0];

            const rect =
                joystickBox.getBoundingClientRect();

            let x =
                touch.clientX -
                rect.left -
                rect.width / 2;

            let y =
                touch.clientY -
                rect.top -
                rect.height / 2;

            const distance =
                Math.sqrt(x * x + y * y);

            const maxDistance = 50;

            if (distance > maxDistance) {

                x =
                    x / distance *
                    maxDistance;

                y =
                    y / distance *
                    maxDistance;
            }

            joystick.x = x / maxDistance;
            joystick.y = y / maxDistance;

            if (stick) {

                stick.style.transform =
                    `translate(${x}px, ${y}px)`;
            }

        },
        { passive: false }
    );

    joystickBox.addEventListener(
        "touchend",
        () => {

            joystick.x = 0;
            joystick.y = 0;

            if (stick) {
                stick.style.transform =
                    "translate(0, 0)";
            }
        }
    );
}


/* =====================================================
   JOGADOR
===================================================== */

const player = {

    x: world.width / 2,
    y: world.height / 2,

    radius: 25,

    size: 1,

    speed: 5,

    color: "#8d5524",

    update() {

        let dx = 0;
        let dy = 0;


        /* WASD / SETAS */

        if (keys.up) dy -= 1;
        if (keys.down) dy += 1;
        if (keys.left) dx -= 1;
        if (keys.right) dx += 1;


        /* MOUSE */

        if (mouseControl) {

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const mouseDX =
                mouse.x - centerX;

            const mouseDY =
                mouse.y - centerY;

            const distance =
                Math.sqrt(
                    mouseDX * mouseDX +
                    mouseDY * mouseDY
                );

            if (distance > 30) {

                dx = mouseDX / distance;
                dy = mouseDY / distance;
            }
        }


        /* JOYSTICK */

        if (
            Math.abs(joystick.x) > 0 ||
            Math.abs(joystick.y) > 0
        ) {

            dx = joystick.x;
            dy = joystick.y;
        }


        /* NORMALIZAÇÃO */

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {

            dx /= distance;
            dy /= distance;
        }


        /* MOVIMENTO */

        this.x += dx * this.speed;
        this.y += dy * this.speed;


        /* LIMITES */

        this.x =
            Math.max(
                this.radius,
                Math.min(
                    world.width - this.radius,
                    this.x
                )
            );

        this.y =
            Math.max(
                this.radius,
                Math.min(
                    world.height - this.radius,
                    this.y
                )
            );


        camera.follow(this);
    },


    draw() {

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            this.color;

        ctx.fill();

        ctx.strokeStyle =
            "#4e342e";

        ctx.lineWidth = 5;

        ctx.stroke();


        /* DESENHO DA CUIA */

        ctx.font =
            `${Math.max(20, this.radius)}px Arial`;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "🧉",
            this.x,
            this.y
        );
    }
};

let mouseControl = true;


/* =====================================================
   OBJETOS
===================================================== */

const objects = [];


const objectTypes = {

    agua: {
        name: "Gota de água",
        size: 8,
        color: "#2196f3",
        emoji: "💧",
        value: 1
    },

    erva: {
        name: "Erva-mate",
        size: 15,
        color: "#558b2f",
        emoji: "🌿",
        value: 2
    },

    bomba: {
        name: "Bomba de chimarrão",
        size: 35,
        color: "#444",
        emoji: "🥄",
        value: 5
    },

    termica: {
        name: "Garrafa térmica",
        size: 55,
        color: "#e53935",
        emoji: "🍼",
        value: 8
    },

    chaleira: {
        name: "Chaleira",
        size: 75,
        color: "#795548",
        emoji: "♨️",
        value: 12
    },

    arvore: {
        name: "Árvore",
        size: 100,
        color: "#2e7d32",
        emoji: "🌳",
        value: 20
    },

    casa: {
        name: "Casa",
        size: 160,
        color: "#ff9800",
        emoji: "🏠",
        value: 35
    },

    predio: {
        name: "Prédio",
        size: 260,
        color: "#757575",
        emoji: "🏢",
        value: 60
    },

    gaucho: {
        name: "Gaúcho",
        size: 220,
        color: "#795548",
        emoji: "🤠",
        value: 50
    },

    horse: {
        name: "Cavalo",
        size: 350,
        color: "#4e342e",
        emoji: "🐴",
        value: 80
    },

    gauchoHorse: {
        name: "Cavalo com Gaúcho Cuiudo",
        size: 500,
        color: "#3e2723",
        emoji: "🐴🤠",
        value: 120
    },

    megaPredio: {
        name: "Prédio Gigante",
        size: 800,
        color: "#37474f",
        emoji: "🏢",
        value: 200
    }
};


class GameObject {

    constructor(type) {

        const data =
            objectTypes[type];

        this.type = type;

        this.name = data.name;
        this.size = data.size;
        this.radius = data.size;

        this.color = data.color;
        this.emoji = data.emoji;
        this.value = data.value;

        this.x =
            Math.random() *
            world.width;

        this.y =
            Math.random() *
            world.height;

        this.eaten = false;
    }


    draw() {

        if (this.eaten)
            return;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            this.color;

        ctx.fill();

        ctx.font =
            `${Math.max(15, this.radius)}px Arial`;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            this.emoji,
            this.x,
            this.y
        );
    }
}


function createObject(type) {

    if (!objectTypes[type])
        return;

    objects.push(
        new GameObject(type)
    );
}


/* =====================================================
   GERAR FASE
===================================================== */

function generateLevel(level) {

    objects.length = 0;

    if (level === 1) {

        generate("agua", 100);
        generate("erva", 70);
        generate("bomba", 30);
    }

    if (level === 2) {

        generate("termica", 50);
        generate("chaleira", 30);
        generate("casa", 30);
    }

    if (level === 3) {

        generate("arvore", 40);
        generate("casa", 40);
        generate("predio", 20);
    }

    if (level === 4) {

        generate("gaucho", 5);
        generate("horse", 5);

        createObject("gauchoHorse");
        createObject("megaPredio");
    }
}


function generate(type, amount) {

    for (let i = 0; i < amount; i++) {
        createObject(type);
    }
}


/* =====================================================
   CIDADE
===================================================== */

const city = {
    streets: [],
    cars: [],
    people: []
};


function createCity() {

    city.streets = [];

    for (
        let y = 300;
        y < world.height;
        y += 500
    ) {

        city.streets.push({
            x: 0,
            y: y,
            width: world.width,
            height: 80
        });
    }

    for (
        let x = 300;
        x < world.width;
        x += 500
    ) {

        city.streets.push({
            x: x,
            y: 0,
            width: 80,
            height: world.height
        });
    }
}


function createCars() {

    city.cars = [];

    for (let i = 0; i < 40; i++) {

        city.cars.push({

            x: Math.random() * world.width,
            y: Math.random() * world.height,

            color:
                [
                    "#f44336",
                    "#2196f3",
                    "#ffeb3b",
                    "#212121"
                ][
                    Math.floor(Math.random() * 4)
                ],

            speed:
                1 + Math.random() * 2
        });
    }
}


function createPeople() {

    city.people = [];

    for (let i = 0; i < 80; i++) {

        city.people.push({

            x: Math.random() * world.width,
            y: Math.random() * world.height,

            emoji: "🧍"
        });
    }
}


function updateCars() {

    for (const car of city.cars) {

        car.x += car.speed;

        if (car.x > world.width) {
            car.x = 0;
        }
    }
}


function drawCity() {

    ctx.fillStyle = "#65a765";

    ctx.fillRect(
        0,
        0,
        world.width,
        world.height
    );


    /* RUAS */

    for (const street of city.streets) {

        ctx.fillStyle = "#444";

        ctx.fillRect(
            street.x,
            street.y,
            street.width,
            street.height
        );
    }


    /* CARROS */

    for (const car of city.cars) {

        ctx.fillStyle = car.color;

        ctx.fillRect(
            car.x,
            car.y,
            35,
            18
        );
    }


    /* PESSOAS */

    ctx.font = "25px Arial";

    for (const person of city.people) {

        ctx.fillText(
            person.emoji,
            person.x,
            person.y
        );
    }
}


/* =====================================================
   NPCS
===================================================== */

const npcs = [];


class CuiaNPC {

    constructor() {

        this.x =
            Math.random() * world.width;

        this.y =
            Math.random() * world.height;

        this.radius =
            20 + Math.random() * 40;

        this.speed =
            1 + Math.random() * 2;

        this.score = 0;

        this.target = null;

        this.color = "#795548";
    }


    update() {

        if (
            !this.target ||
            this.target.eaten
        ) {

            const available =
                objects.filter(
                    obj => !obj.eaten
                );

            if (!available.length)
                return;

            this.target =
                available[
                    Math.floor(
                        Math.random() *
                        available.length
                    )
                ];
        }


        const dx =
            this.target.x - this.x;

        const dy =
            this.target.y - this.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);


        if (distance > 0) {

            this.x +=
                dx / distance *
                this.speed;

            this.y +=
                dy / distance *
                this.speed;
        }


        if (
            distance <
            this.radius +
            this.target.radius
        ) {

            if (
                this.radius >=
                this.target.radius
            ) {

                this.target.eaten = true;

                this.score +=
                    this.target.value;

                this.radius += 1;

                this.target = null;
            }
        }
    }


    draw() {

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            this.color;

        ctx.fill();

        ctx.font =
            `${Math.max(20, this.radius)}px Arial`;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "🧉",
            this.x,
            this.y
        );
    }
}


function createNPCs() {

    npcs.length = 0;

    for (let i = 0; i < 8; i++) {
        npcs.push(
            new CuiaNPC()
        );
    }
}


/* =====================================================
   PARTÍCULAS
===================================================== */

const particles = [];


function createParticle(x, y, color) {

    particles.push({

        x,
        y,

        size:
            5 + Math.random() * 8,

        color,

        life: 40
    });
}


function eatEffect(obj) {

    for (let i = 0; i < 15; i++) {

        createParticle(
            obj.x,
            obj.y,
            obj.color
        );
    }
}


function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.y -= 2;
        particle.life--;

        if (particle.life <= 0) {

            particles.splice(i, 1);
        }
    }
}


function drawParticles() {

    for (const particle of particles) {

        ctx.fillStyle =
            particle.color;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


/* =====================================================
   COLISÃO
===================================================== */

function distance(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(
        dx * dx + dy * dy
    );
}


function checkCollisions() {

    for (const obj of objects) {

        if (obj.eaten)
            continue;

        const dist =
            distance(player, obj);

        if (
            dist <
            player.radius +
            obj.radius
        ) {

            tryEat(obj);
        }
    }
}


function tryEat(obj) {

    if (
        player.radius >=
        obj.radius * 1.1
    ) {

        obj.eaten = true;

        growPlayer(obj);

        showEatMessage(
            obj.name
        );
    }
}


/* =====================================================
   CRESCIMENTO
===================================================== */

function growPlayer(obj) {

    eatEffect(obj);

    player.radius += obj.value;
    player.size += obj.value;

    game.xp += obj.value;
    game.score += obj.value;

    game.objectsEaten++;

    updateHUD();

    checkEvolution();

    playSound("eatSound");
}


function checkEvolution() {

    if (
        player.radius > 50 &&
        game.level === 1
    ) {

        game.level = 2;

        showEvolution(
            "Cuia pequena!",
            "Agora você consegue engolir mais objetos."
        );
    }


    if (
        player.radius > 120 &&
        game.level === 2
    ) {

        game.level = 3;

        showEvolution(
            "Cuia média!",
            "A cidade começa a ficar pequena."
        );
    }


    if (
        player.radius > 250 &&
        game.level === 3
    ) {

        game.level = 4;

        showEvolution(
            "Cuia gigante!",
            "Prédios estão ao seu alcance."
        );
    }
}


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    const sizeText =
        document.getElementById("sizeText");

    const xpText =
        document.getElementById("xpText");

    const levelText =
        document.getElementById("levelText");

    const scoreText =
        document.getElementById("scoreText");

    if (sizeText) {
        sizeText.innerHTML =
            Math.floor(player.radius);
    }

    if (xpText) {
        xpText.innerHTML =
            game.xp;
    }

    if (levelText) {
        levelText.innerHTML =
            game.level;
    }

    if (scoreText) {
        scoreText.innerHTML =
            game.score;
    }
}


/* =====================================================
   MENSAGENS
===================================================== */

function showEatMessage(text) {

    const message =
        document.getElementById("message");

    if (!message)
        return;

    message.innerHTML =
        `🧉 Engoliu: ${text}`;

    message.classList.add("fadeIn");

    setTimeout(() => {

        message.innerHTML = "";

        message.classList.remove(
            "fadeIn"
        );

    }, 1000);
}


function showEvolution(title, text) {

    const box =
        document.getElementById(
            "evolutionMessage"
        );

    const titleBox =
        document.getElementById(
            "evolutionTitle"
        );

    const description =
        document.getElementById(
            "evolutionDescription"
        );

    if (!box)
        return;

    if (titleBox)
        titleBox.innerHTML = title;

    if (description)
        description.innerHTML = text;

    box.style.display = "block";

    setTimeout(() => {

        box.style.display = "none";

    }, 3000);
}


function showNotification(text) {

    const container =
        document.getElementById(
            "notificationContainer"
        );

    if (!container)
        return;

    const div =
        document.createElement("div");

    div.className =
        "notification";

    div.innerHTML = text;

    container.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}


/* =====================================================
   FASES
===================================================== */

const levels = {

    1: {
        name: "A Primeira Cuia",
        goal: "Engula água e erva-mate",
        requiredSize: 60
    },

    2: {
        name: "Acessórios do Chimarrão",
        goal: "Colete bomba, térmica e chaleira",
        requiredSize: 150
    },

    3: {
        name: "A Cidade Gaúcha",
        goal: "Domine casas e prédios",
        requiredSize: 350
    },

    4: {
        name: "O Grande Chimarrão",
        goal: "Engula o prédio gigante",
        requiredSize: 900
    }
};


function loadLevel(level) {

    game.level = level;

    game.time = 0;
    game.score = 0;
    game.xp = 0;
    game.objectsEaten = 0;

    player.radius = 25;
    player.size = 1;

    player.x =
        world.width / 2;

    player.y =
        world.height / 2;

    generateLevel(level);

    updateObjective();

    updateHUD();

    showNotification(
        `🧉 Fase ${level} iniciada!`
    );
}


function updateObjective() {

    const element =
        document.getElementById(
            "objectiveText"
        );

    if (!element)
        return;

    element.innerHTML =
        levels[game.level].goal;
}


/* =====================================================
   VITÓRIA
===================================================== */

function checkLevelGoal() {

    const current =
        levels[game.level];

    if (!current)
        return;

    if (
        game.level < 4 &&
        player.radius >=
        current.requiredSize
    ) {

        completeLevel();
    }


    if (game.level === 4) {

        const building =
            objects.find(
                obj =>
                    obj.type ===
                    "megaPredio"
            );

        if (
            building &&
            building.eaten
        ) {

            finishFinalLevel();
        }
    }
}


function completeLevel() {

    game.running = false;

    saveProgress();

    showVictory();
}


function saveProgress() {

    const progress = {

        level:
            Math.min(
                game.level + 1,
                4
            ),

        score:
            game.score
    };

    localStorage.setItem(
        "cuiaProgress",
        JSON.stringify(progress)
    );
}


function showVictory() {

    const screen =
        document.getElementById(
            "victoryScreen"
        );

    if (screen) {
        screen.style.display =
            "flex";
    }

    showFinalStats();
}


function finishFinalLevel() {

    game.running = false;

    const effect =
        document.createElement("div");

    effect.className =
        "levelComplete";

    effect.innerHTML = `
        <div class="finalEmoji">
            🏢 ➡️ 🥄
        </div>

        <h1>
            A cidade virou uma
            bomba de chimarrão!
        </h1>
    `;

    document.body.appendChild(effect);

    setTimeout(() => {

        effect.remove();

        finalVictory();

    }, 4000);
}


/* =====================================================
   ESTATÍSTICAS
===================================================== */

function showFinalStats() {

    const finalSize =
        document.getElementById(
            "finalSize"
        );

    const finalItems =
        document.getElementById(
            "finalItems"
        );

    const finalTime =
        document.getElementById(
            "finalTime"
        );

    if (finalSize) {
        finalSize.innerHTML =
            Math.floor(
                player.radius
            );
    }

    if (finalItems) {
        finalItems.innerHTML =
            game.objectsEaten;
    }

    if (finalTime) {
        finalTime.innerHTML =
            Math.floor(game.time);
    }
}


function finalVictory() {

    game.running = false;

    const final =
        document.getElementById(
            "finalScreen"
        );

    if (final) {
        final.style.display =
            "flex";
    }

    showFinalStats();
}


/* =====================================================
   RANKING
===================================================== */

function updateRanking() {

    const ranking = [

        {
            name: "Você",
            score: game.score
        }

    ];

    for (const npc of npcs) {

        ranking.push({

            name: "Cuia rival",

            score: npc.score
        });
    }

    ranking.sort(
        (a, b) =>
            b.score - a.score
    );

    const list =
        document.getElementById(
            "rankingList"
        );

    if (!list)
        return;

    list.innerHTML = "";

    ranking
        .slice(0, 5)
        .forEach((player, index) => {

            const li =
                document.createElement("li");

            li.innerHTML =
                `${index + 1}º -
                 ${player.name}:
                 ${player.score}`;

            list.appendChild(li);
        });
}


/* =====================================================
   TIMER
===================================================== */

function updateTimer(delta) {

    if (
        !game.running ||
        game.paused
    ) {
        return;
    }

    game.time += delta;

    const timer =
        document.getElementById(
            "timer"
        );

    if (timer) {

        const remaining =
            Math.max(
                0,
                Math.floor(
                    game.maxTime -
                    game.time
                )
            );

        timer.innerHTML =
            remaining;
    }

    if (
        game.time >=
        game.maxTime
    ) {

        game.running = false;

        showNotification(
            "⏰ Tempo esgotado!"
        );
    }
}


/* =====================================================
   SALVAMENTO
===================================================== */

function saveGame() {

    const data = {

        level: game.level,

        xp: game.xp,

        score: game.score,

        size: player.size,

        radius: player.radius
    };

    localStorage.setItem(
        "cuiaSave",
        JSON.stringify(data)
    );
}


function loadGame() {

    const save =
        localStorage.getItem(
            "cuiaSave"
        );

    if (!save)
        return;

    try {

        const data =
            JSON.parse(save);

        game.level =
            data.level || 1;

        game.xp =
            data.xp || 0;

        game.score =
            data.score || 0;

        player.size =
            data.size || 1;

        player.radius =
            data.radius || 25;

    } catch (error) {

        console.warn(
            "Save inválido:",
            error
        );
    }
}


/* =====================================================
   ÁUDIO
===================================================== */

let soundEnabled = true;


function playSound(id) {

    if (!soundEnabled)
        return;

    const audio =
        document.getElementById(id);

    if (!audio)
        return;

    audio.currentTime = 0;

    audio.play()
        .catch(() => {});
}


const soundButton =
    document.getElementById(
        "soundButton"
    );

if (soundButton) {

    soundButton.onclick = () => {

        soundEnabled =
            !soundEnabled;

        soundButton.innerHTML =
            soundEnabled
                ? "🔊"
                : "🔇";
    };
}


/* =====================================================
   PAUSA
===================================================== */

function togglePause() {

    game.paused =
        !game.paused;

    const screen =
        document.getElementById(
            "pauseScreen"
        );

    if (screen) {

        screen.style.display =
            game.paused
                ? "flex"
                : "none";
    }
}


const pauseButton =
    document.getElementById(
        "pauseButton"
    );

if (pauseButton) {
    pauseButton.onclick =
        togglePause;
}


const resumeButton =
    document.getElementById(
        "resumeButton"
    );

if (resumeButton) {
    resumeButton.onclick =
        togglePause;
}


/* =====================================================
   TELA CHEIA
===================================================== */

const fullscreenButton =
    document.getElementById(
        "fullscreenButton"
    );

if (fullscreenButton) {

    fullscreenButton.onclick = () => {

        if (!document.fullscreenElement) {

            document.documentElement
                .requestFullscreen()
                .catch(() => {});

        } else {

            document
                .exitFullscreen()
                .catch(() => {});
        }
    };
}


/* =====================================================
   MENU
===================================================== */

function startGame() {

    loadGame();

    generateLevel(
        game.level
    );

    game.running = true;

    const menu =
        document.getElementById(
            "menu"
        );

    if (menu) {
        menu.style.display =
            "none";
    }

    updateHUD();
    updateObjective();
}


function restartGame() {

    game.level = 1;
    game.xp = 0;
    game.score = 0;
    game.time = 0;
    game.objectsEaten = 0;

    player.radius = 25;
    player.size = 1;

    generateLevel(1);

    game.running = true;

    updateHUD();
    updateObjective();
}


const playButton =
    document.getElementById(
        "playButton"
    );

if (playButton) {
    playButton.onclick =
        startGame;
}


const restartButton =
    document.getElementById(
        "restartButton"
    );

if (restartButton) {
    restartButton.onclick =
        restartGame;
}


/* =====================================================
   BOTÕES DE FASE
===================================================== */

const levelButtons =
    document.querySelectorAll(
        ".levelButton"
    );

levelButtons.forEach(button => {

    button.onclick = () => {

        const level =
            Number(
                button.dataset.level
            );

        loadLevel(level);

        game.running = true;

        const selector =
            document.getElementById(
                "levelSelect"
            );

        if (selector) {
            selector.style.display =
                "none";
        }
    };
});


/* =====================================================
   RANKING
===================================================== */

const rankingButton =
    document.getElementById(
        "rankingButton"
    );

if (rankingButton) {

    rankingButton.onclick = () => {

        updateRanking();

        const screen =
            document.getElementById(
                "rankingScreen"
            );

        if (screen) {
            screen.style.display =
                "flex";
        }
    };
}


const closeRanking =
    document.getElementById(
        "closeRanking"
    );

if (closeRanking) {

    closeRanking.onclick = () => {

        const screen =
            document.getElementById(
                "rankingScreen"
            );

        if (screen) {
            screen.style.display =
                "none";
        }
    };
}


/* =====================================================
   CONQUISTAS
===================================================== */

const achievements = [];


function unlockAchievement(name) {

    if (
        achievements.includes(name)
    ) {
        return;
    }

    achievements.push(name);

    localStorage.setItem(
        "cuiaAchievements",
        JSON.stringify(
            achievements
        )
    );

    showNotification(
        `🏆 Conquista desbloqueada: ${name}`
    );
}


function loadAchievements() {

    const saved =
        localStorage.getItem(
            "cuiaAchievements"
        );

    if (!saved)
        return;

    try {

        achievements.push(
            ...JSON.parse(saved)
        );

    } catch {
        console.warn(
            "Conquistas inválidas."
        );
    }
}


function checkAchievements() {

    if (
        game.objectsEaten >= 1
    ) {

        unlockAchievement(
            "Primeira Gota"
        );
    }

    if (
        game.objectsEaten >= 100
    ) {

        unlockAchievement(
            "Mestre da Erva"
        );
    }

    if (
        player.radius >= 900
    ) {

        unlockAchievement(
            "Cuia Gigante"
        );
    }
}


/* =====================================================
   LIMPEZA
===================================================== */

function cleanObjects() {

    for (
        let i = objects.length - 1;
        i >= 0;
        i--
    ) {

        if (
            objects[i].eaten
        ) {

            objects.splice(i, 1);
        }
    }
}

setInterval(
    cleanObjects,
    10000
);


/* =====================================================
   QUALIDADE GRÁFICA
===================================================== */

let graphics = "high";


function applyGraphics() {

    if (
        graphics === "low"
    ) {

        city.cars.length = 10;
        city.people.length = 20;
    }

    if (
        graphics === "medium"
    ) {

        city.cars.length = 25;
        city.people.length = 50;
    }

    if (
        graphics === "high"
    ) {

        createCars();
        createPeople();
    }
}


const quality =
    document.getElementById(
        "graphicsQuality"
    );

if (quality) {

    quality.onchange = () => {

        graphics =
            quality.value;

        applyGraphics();
    };
}


/* =====================================================
   FPS
===================================================== */

let fps = 0;
let frames = 0;
let lastFPS = performance.now();

function calculateFPS() {

    frames++;

    const now =
        performance.now();

    if (
        now - lastFPS >= 1000
    ) {

        fps = frames;

        frames = 0;

        lastFPS = now;
    }
}


/* =====================================================
   DESENHO PRINCIPAL
===================================================== */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();


    /* ZOOM */

    ctx.scale(
        camera.zoom,
        camera.zoom
    );


    /* CÂMERA */

    ctx.translate(
        -camera.x,
        -camera.y
    );


    /* MUNDO */

    drawCity();


    /* OBJETOS */

    for (const obj of objects) {
        obj.draw();
    }


    /* NPCS */

    for (const npc of npcs) {
        npc.draw();
    }


    /* JOGADOR */

    player.draw();


    /* PARTÍCULAS */

    drawParticles();


    ctx.restore();


    /* FPS */

    if (showFPS) {

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";

        ctx.fillText(
            `FPS: ${fps}`,
            20,
            20
        );
    }
}


let showFPS = false;


/* =====================================================
   UPDATE
===================================================== */

let lastTime = performance.now();


function update(delta) {

    if (
        !game.running ||
        game.paused
    ) {
        return;
    }


    /* JOGADOR */

    player.update();


    /* COLISÕES */

    checkCollisions();


    /* NPCS */

    for (const npc of npcs) {
        npc.update();
    }


    /* CARROS */

    updateCars();


    /* PARTÍCULAS */

    updateParticles();


    /* TEMPO */

    updateTimer(delta);


    /* OBJETIVO */

    checkLevelGoal();


    /* CONQUISTAS */

    checkAchievements();


    /* HUD */

    updateHUD();
}


/* =====================================================
   LOOP
===================================================== */

function gameLoop(time) {

    requestAnimationFrame(
        gameLoop
    );

    const delta =
        Math.min(
            (time - lastTime) / 1000,
            0.05
        );

    lastTime = time;

    update(delta);

    draw();

    calculateFPS();
}


requestAnimationFrame(
    gameLoop
);


/* =====================================================
   AUTOSAVE
===================================================== */

setInterval(() => {

    if (game.running) {
        saveGame();
    }

}, 30000);


window.addEventListener(
    "beforeunload",
    saveGame
);


/* =====================================================
   DISPOSITIVO MÓVEL
===================================================== */

const mobile =
    /Android|iPhone|iPad/i.test(
        navigator.userAgent
    );

if (mobile) {
    player.speed = 4;
}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

function initGame() {

    createCity();
    createCars();
    createPeople();

    createNPCs();

    loadAchievements();

    updateHUD();
    updateObjective();

    console.log(
        "🧉 CUIA.IO iniciado!"
    );
}


initGame();
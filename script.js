/* =========================================================
   🧉 CUIA.IO
   SCRIPT.JS
   VERSÃO COMPLETA E ORGANIZADA
   ========================================================= */


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

"use strict";


const canvas = document.getElementById("gameCanvas");

if (!canvas) {
    throw new Error("Canvas #gameCanvas não encontrado.");
}

const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("Não foi possível obter o contexto 2D.");
}


/* =========================================================
   CANVAS
   ========================================================= */

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    camera.follow(player);

}

window.addEventListener("resize", resizeCanvas);


/* =========================================================
   ESTADO DO JOGO
   ========================================================= */

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


/* =========================================================
   MUNDO
   ========================================================= */

const world = {

    width: 5000,

    height: 5000,

    background: "#65a765"

};


/* =========================================================
   CÂMERA
   ========================================================= */

const camera = {

    x: 0,

    y: 0,

    zoom: 1,

    targetZoom: 1,

    follow(target) {

        const visibleWidth =
            canvas.width / this.zoom;

        const visibleHeight =
            canvas.height / this.zoom;


        this.x =
            target.x -
            visibleWidth / 2;


        this.y =
            target.y -
            visibleHeight / 2;


        const maxX =
            Math.max(
                0,
                world.width - visibleWidth
            );


        const maxY =
            Math.max(
                0,
                world.height - visibleHeight
            );


        this.x =
            Math.max(
                0,
                Math.min(
                    this.x,
                    maxX
                )
            );


        this.y =
            Math.max(
                0,
                Math.min(
                    this.y,
                    maxY
                )
            );

    },


    updateZoom() {

        this.targetZoom =
            1 - player.radius / 1500;


        this.targetZoom =
            Math.max(
                0.45,
                Math.min(
                    1,
                    this.targetZoom
                )
            );


        this.zoom +=
            (
                this.targetZoom -
                this.zoom
            ) * 0.05;

    }

};


/* =========================================================
   CONTROLES
   ========================================================= */

const keys = {

    up: false,

    down: false,

    left: false,

    right: false

};


window.addEventListener("keydown", function (e) {

    switch (e.key) {

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


window.addEventListener("keyup", function (e) {

    switch (e.key) {

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


/* =========================================================
   MOUSE
   ========================================================= */

const mouse = {

    x: 0,

    y: 0,

    active: false

};


canvas.addEventListener("mousemove", function (e) {

    const rect =
        canvas.getBoundingClientRect();


    mouse.x =
        e.clientX - rect.left;


    mouse.y =
        e.clientY - rect.top;


    mouse.active = true;

});


canvas.addEventListener("mouseleave", function () {

    mouse.active = false;

});


/* =========================================================
   JOYSTICK
   ========================================================= */

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
        function (e) {

            e.preventDefault();

            const touch =
                e.touches[0];


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


            const maxDistance = 50;


            const distance =
                Math.sqrt(
                    x * x +
                    y * y
                );


            if (distance > maxDistance) {

                x =
                    x / distance *
                    maxDistance;

                y =
                    y / distance *
                    maxDistance;

            }


            joystick.x =
                x / maxDistance;


            joystick.y =
                y / maxDistance;


            joystick.active = true;


            if (stick) {

                stick.style.transform =
                    `translate(${x}px, ${y}px)`;

            }

        },
        {
            passive: false
        }
    );


    joystickBox.addEventListener(
        "touchend",
        function () {

            joystick.x = 0;

            joystick.y = 0;

            joystick.active = false;


            if (stick) {

                stick.style.transform =
                    "translate(0, 0)";

            }

        }
    );

}


/* =========================================================
   JOGADOR
   ========================================================= */

const player = {

    x: world.width / 2,

    y: world.height / 2,

    radius: 25,

    speed: 5,

    color: "#8d5524",

    size: 25,


    update() {

        let dx = 0;
        let dy = 0;


        /* WASD / SETAS */

        if (keys.up) {

            dy -= 1;

        }

        if (keys.down) {

            dy += 1;

        }

        if (keys.left) {

            dx -= 1;

        }

        if (keys.right) {

            dx += 1;

        }


        /* JOYSTICK */

        if (
            joystick.active ||
            joystick.x !== 0 ||
            joystick.y !== 0
        ) {

            dx = joystick.x;
            dy = joystick.y;

        }


        /* MOUSE */

        if (
            mouse.active &&
            !joystick.active &&
            !keys.up &&
            !keys.down &&
            !keys.left &&
            !keys.right
        ) {

            const centerX =
                canvas.width / 2;


            const centerY =
                canvas.height / 2;


            dx =
                mouse.x - centerX;


            dy =
                mouse.y - centerY;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance > 25) {

                dx /= distance;
                dy /= distance;

            } else {

                dx = 0;
                dy = 0;

            }

        }


        /* NORMALIZAÇÃO */

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance > 1) {

            dx /= distance;
            dy /= distance;

        }


        /* MOVIMENTO */

        this.x +=
            dx *
            this.speed;


        this.y +=
            dy *
            this.speed;


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


        camera.updateZoom();

        camera.follow(this);

    },


    draw() {

        const screenX =
            (this.x - camera.x) *
            camera.zoom;


        const screenY =
            (this.y - camera.y) *
            camera.zoom;


        const radius =
            this.radius *
            camera.zoom;


        ctx.beginPath();


        ctx.arc(
            screenX,
            screenY,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            this.color;


        ctx.fill();


        ctx.strokeStyle =
            "#4e342e";


        ctx.lineWidth =
            Math.max(
                2,
                5 * camera.zoom
            );


        ctx.stroke();


        /* CUIA */

        ctx.font =
            `${Math.max(20, radius * 1.3)}px Arial`;


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "🧉",
            screenX,
            screenY
        );

    }

};


/* =========================================================
   OBJETOS
   ========================================================= */

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

    constructor(
        type,
        x,
        y
    ) {

        const data =
            objectTypes[type];


        this.type =
            type;


        this.name =
            data.name;


        this.x =
            x;


        this.y =
            y;


        this.size =
            data.size;


        this.radius =
            data.size;


        this.color =
            data.color;


        this.emoji =
            data.emoji;


        this.value =
            data.value;


        this.eaten =
            false;

    }


    draw() {

        if (this.eaten) {
            return;
        }


        const screenX =
            (this.x - camera.x) *
            camera.zoom;


        const screenY =
            (this.y - camera.y) *
            camera.zoom;


        const radius =
            this.radius *
            camera.zoom;


        /* CÍRCULO */

        ctx.beginPath();


        ctx.arc(
            screenX,
            screenY,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            this.color;


        ctx.fill();


        /* EMOJI */

        ctx.font =
            `${Math.max(
                12,
                radius
            )}px Arial`;


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            this.emoji,
            screenX,
            screenY
        );

    }

}


/* =========================================================
   CRIAR OBJETO
   ========================================================= */

function createObject(type) {

    if (!objectTypes[type]) {

        console.warn(
            "Tipo de objeto desconhecido:",
            type
        );

        return null;

    }


    const margin = 100;


    const x =
        margin +
        Math.random() *
        (
            world.width -
            margin * 2
        );


    const y =
        margin +
        Math.random() *
        (
            world.height -
            margin * 2
        );


    const object =
        new GameObject(
            type,
            x,
            y
        );


    objects.push(object);


    return object;

}


/* =========================================================
   GERAR FASE
   ========================================================= */

function generateLevel(level) {

    objects.length = 0;


    switch (level) {

        case 1:

            for (let i = 0; i < 100; i++) {
                createObject("agua");
            }

            for (let i = 0; i < 70; i++) {
                createObject("erva");
            }

            for (let i = 0; i < 30; i++) {
                createObject("bomba");
            }

            break;


        case 2:

            for (let i = 0; i < 50; i++) {
                createObject("termica");
            }

            for (let i = 0; i < 30; i++) {
                createObject("chaleira");
            }

            for (let i = 0; i < 30; i++) {
                createObject("casa");
            }

            break;


        case 3:

            for (let i = 0; i < 40; i++) {
                createObject("arvore");
            }

            for (let i = 0; i < 40; i++) {
                createObject("casa");
            }

            for (let i = 0; i < 20; i++) {
                createObject("predio");
            }

            break;


        case 4:

            for (let i = 0; i < 5; i++) {
                createObject("gaucho");
            }

            for (let i = 0; i < 5; i++) {
                createObject("horse");
            }

            createObject("gauchoHorse");

            createObject("megaPredio");

            break;

    }

}


/* =========================================================
   CIDADE
   ========================================================= */

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

            x:
                Math.random() *
                world.width,

            y:
                Math.random() *
                world.height,

            color:
                [
                    "#f44336",
                    "#2196f3",
                    "#ffeb3b",
                    "#212121"
                ][
                    Math.floor(
                        Math.random() * 4
                    )
                ],

            speed:
                1 +
                Math.random() * 2

        });

    }

}


function createPeople() {

    city.people = [];


    for (let i = 0; i < 80; i++) {

        city.people.push({

            x:
                Math.random() *
                world.width,

            y:
                Math.random() *
                world.height,

            emoji: "🧍",

            size: 20

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

    ctx.save();


    ctx.translate(
        -camera.x * camera.zoom,
        -camera.y * camera.zoom
    );


    ctx.scale(
        camera.zoom,
        camera.zoom
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


    /* LINHAS DAS RUAS */

    ctx.strokeStyle =
        "rgba(255,255,255,.3)";

    ctx.lineWidth = 3;

    ctx.setLineDash([20, 20]);


    for (const street of city.streets) {

        if (street.width > street.height) {

            ctx.beginPath();

            ctx.moveTo(
                street.x,
                street.y + street.height / 2
            );

            ctx.lineTo(
                street.x + street.width,
                street.y + street.height / 2
            );

            ctx.stroke();

        }

    }


    ctx.setLineDash([]);


    /* CARROS */

    for (const car of city.cars) {

        ctx.fillStyle =
            car.color;


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


    ctx.restore();

}


/* =========================================================
   NPCs
   ========================================================= */

const npcs = [];


class CuiaNPC {

    constructor() {

        this.x =
            Math.random() *
            world.width;


        this.y =
            Math.random() *
            world.height;


        this.radius =
            20 +
            Math.random() * 40;


        this.speed =
            1 +
            Math.random() * 2;


        this.color =
            [
                "#795548",
                "#33691e",
                "#6d4c41",
                "#8d6e63"
            ][
                Math.floor(
                    Math.random() * 4
                )
            ];


        this.target = null;


        this.score = 0;

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


            if (available.length === 0) {

                this.target = null;

                return;

            }


            this.target =
                available[
                    Math.floor(
                        Math.random() *
                        available.length
                    )
                ];

        }


        const dx =
            this.target.x -
            this.x;


        const dy =
            this.target.y -
            this.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


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
                this.target.radius * 1.1
            ) {

                this.target.eaten =
                    true;


                this.score +=
                    this.target.value;


                this.radius +=
                    this.target.value * 0.3;


                this.target = null;

            }

        }

    }


    draw() {

        const screenX =
            (this.x - camera.x) *
            camera.zoom;


        const screenY =
            (this.y - camera.y) *
            camera.zoom;


        const radius =
            this.radius *
            camera.zoom;


        ctx.beginPath();


        ctx.arc(
            screenX,
            screenY,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            this.color;


        ctx.fill();


        ctx.font =
            `${Math.max(
                18,
                radius
            )}px Arial`;


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "🧉",
            screenX,
            screenY
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


/* =========================================================
   PARTÍCULAS
   ========================================================= */

const particles = [];


function createParticle(
    x,
    y,
    color
) {

    particles.push({

        x: x,

        y: y,

        size:
            5 +
            Math.random() * 8,

        color: color,

        life: 50

    });

}


function createEatEffect(obj) {

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

        const p =
            particles[i];


        p.y -= 2;

        p.life--;


        if (p.life <= 0) {

            particles.splice(
                i,
                1
            );

        }

    }

}


function drawParticles() {

    for (const p of particles) {

        const x =
            (p.x - camera.x) *
            camera.zoom;


        const y =
            (p.y - camera.y) *
            camera.zoom;


        const size =
            p.size *
            camera.zoom;


        ctx.fillStyle =
            p.color;


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            size,
            0,
            Math.PI * 2
        );


        ctx.fill();

    }

}


/* =========================================================
   COLISÃO
   ========================================================= */

function distance(a, b) {

    const dx =
        a.x - b.x;


    const dy =
        a.y - b.y;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


function checkCollisions() {

    for (const obj of objects) {

        if (obj.eaten) {
            continue;
        }


        const dist =
            distance(
                player,
                obj
            );


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

    if (obj.eaten) {
        return;
    }


    if (
        player.radius >=
        obj.radius * 1.1
    ) {

        obj.eaten =
            true;


        growPlayer(obj);

        createEatEffect(obj);

        showEatMessage(
            obj.name
        );

        playSound("eatSound");

    }

}


/* =========================================================
   CRESCIMENTO
   ========================================================= */

function growPlayer(obj) {

    player.radius +=
        obj.value;


    player.size =
        player.radius;


    game.xp +=
        obj.value;


    game.score +=
        obj.value;


    game.objectsEaten++;


    updateHUD();


    checkEvolution();


    checkAchievements();

}


/* =========================================================
   EVOLUÇÃO
   ========================================================= */

function checkEvolution() {

    if (
        player.radius > 50 &&
        game.level === 1
    ) {

        showEvolution(
            "Cuia pequena!",
            "Agora você consegue engolir mais objetos."
        );

    }


    if (
        player.radius > 120 &&
        game.level === 2
    ) {

        showEvolution(
            "Cuia média!",
            "A cidade começa a ficar pequena."
        );

    }


    if (
        player.radius > 250 &&
        game.level === 3
    ) {

        showEvolution(
            "Cuia gigante!",
            "Prédios estão ao seu alcance!"
        );

    }

}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    const sizeText =
        document.getElementById(
            "sizeText"
        );


    const xpText =
        document.getElementById(
            "xpText"
        );


    const levelText =
        document.getElementById(
            "levelText"
        );


    const scoreText =
        document.getElementById(
            "scoreText"
        );


    const timer =
        document.getElementById(
            "timer"
        );


    if (sizeText) {

        sizeText.innerHTML =
            Math.floor(
                player.radius
            );

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


    if (timer) {

        timer.innerHTML =
            Math.max(
                0,
                Math.floor(
                    game.maxTime -
                    game.time
                )
            );

    }

}


/* =========================================================
   MENSAGENS
   ========================================================= */

function showEatMessage(text) {

    const message =
        document.getElementById(
            "message"
        );


    if (!message) {
        return;
    }


    message.innerHTML =
        "🧉 Engoliu: " +
        text;


    message.classList.add(
        "fadeIn"
    );


    setTimeout(
        function () {

            message.innerHTML =
                "";

            message.classList.remove(
                "fadeIn"
            );

        },
        1000
    );

}


function showEvolution(
    title,
    description
) {

    const box =
        document.getElementById(
            "evolutionMessage"
        );


    const titleBox =
        document.getElementById(
            "evolutionTitle"
        );


    const desc =
        document.getElementById(
            "evolutionDescription"
        );


    if (!box) {
        return;
    }


    if (titleBox) {

        titleBox.innerHTML =
            title;

    }


    if (desc) {

        desc.innerHTML =
            description;

    }


    box.style.display =
        "block";


    setTimeout(
        function () {

            box.style.display =
                "none";

        },
        3000
    );

}


function showNotification(text) {

    const container =
        document.getElementById(
            "notificationContainer"
        );


    if (!container) {
        return;
    }


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "notification";


    div.innerHTML =
        text;


    container.appendChild(div);


    setTimeout(
        function () {

            div.remove();

        },
        3000
    );

}


/* =========================================================
   OBJETIVOS
   ========================================================= */

const levels = {

    1: {

        name:
            "A Primeira Cuia",

        goal:
            "Engula água e erva-mate",

        requiredSize:
            60

    },


    2: {

        name:
            "Acessórios do Chimarrão",

        goal:
            "Colete bomba, térmica e chaleira",

        requiredSize:
            150

    },


    3: {

        name:
            "A Cidade Gaúcha",

        goal:
            "Domine casas e prédios",

        requiredSize:
            350

    },


    4: {

        name:
            "O Grande Chimarrão",

        goal:
            "Engula o prédio gigante",

        requiredSize:
            900

    }

};


function updateObjective() {

    const element =
        document.getElementById(
            "objectiveText"
        );


    if (element) {

        element.innerHTML =
            levels[
                game.level
            ].goal;

    }

}


/* =========================================================
   FASE
   ========================================================= */

function loadLevel(level) {

    if (
        level < 1 ||
        level > 4
    ) {

        level = 1;

    }


    game.level =
        level;


    game.time =
        0;


    game.score =
        0;


    game.objectsEaten =
        0;


    player.x =
        world.width / 2;


    player.y =
        world.height / 2;


    player.radius =
        25;


    player.size =
        25;


    generateLevel(
        level
    );


    createNPCs();


    updateObjective();

    updateHUD();


    showNotification(
        "🧉 Fase " +
        level +
        " iniciada!"
    );

}


/* =========================================================
   VERIFICAÇÃO DA FASE
   ========================================================= */

function checkLevelGoal() {

    const current =
        levels[
            game.level
        ];


    if (!current) {
        return;
    }


    if (
        player.radius >=
        current.requiredSize
    ) {

        if (
            game.level < 4
        ) {

            completeLevel();

        } else {

            checkFinalBuilding();

        }

    }

}


function completeLevel() {

    if (!game.running) {
        return;
    }


    game.running =
        false;


    saveProgress();


    showVictory();

}


function checkFinalBuilding() {

    const building =
        objects.find(
            obj =>
                obj.type ===
                "megaPredio" &&
                !obj.eaten
        );


    if (!building) {

        finishFinalLevel();

    }

}


function finishFinalLevel() {

    if (!game.running) {
        return;
    }


    game.running =
        false;


    const effect =
        document.createElement(
            "div"
        );


    effect.className =
        "levelComplete";


    effect.innerHTML = `

        🏢 ➡️ 🥄

        <h1>
            A cidade virou uma bomba
            de chimarrão!
        </h1>

    `;


    document.body.appendChild(
        effect
    );


    setTimeout(
        function () {

            effect.remove();

            completeFinalGame();

        },
        3000
    );

}


function completeFinalGame() {

    showFinalScreen();

}


/* =========================================================
   VITÓRIA
   ========================================================= */

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


function showFinalScreen() {

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


/* =========================================================
   ESTATÍSTICAS
   ========================================================= */

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
            Math.floor(
                game.time
            );

    }

}


/* =========================================================
   TEMPORIZADOR
   ========================================================= */

function updateTimer(delta) {

    if (
        !game.running ||
        game.paused
    ) {

        return;

    }


    game.time +=
        delta;


    if (
        game.time >=
        game.maxTime
    ) {

        game.running =
            false;


        showNotification(
            "⏰ Tempo esgotado!"
        );

    }


    updateHUD();

}


/* =========================================================
   RANKING
   ========================================================= */

function updateRanking() {

    const ranking = [];


    ranking.push({

        name: "Você",

        score: game.score

    });


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


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    ranking
        .slice(0, 5)
        .forEach(
            function (playerData, index) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.innerHTML =
                    `${index + 1}º -
                     ${playerData.name} :
                     ${playerData.score}`;


                list.appendChild(li);

            }
        );

}


/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveGame() {

    const data = {

        level:
            game.level,

        xp:
            game.xp,

        score:
            game.score,

        size:
            player.radius

    };


    localStorage.setItem(
        "cuiaSave",
        JSON.stringify(data)
    );

}


function loadGame() {

    try {

        const save =
            localStorage.getItem(
                "cuiaSave"
            );


        if (!save) {
            return;
        }


        const data =
            JSON.parse(save);


        game.level =
            data.level || 1;


        game.xp =
            data.xp || 0;


        game.score =
            data.score || 0;


        player.radius =
            data.size || 25;


        player.size =
            player.radius;


    } catch (error) {

        console.warn(
            "Erro ao carregar save:",
            error
        );

    }

}


function saveProgress() {

    const progress = {

        level:
            Math.min(
                game.level + 1,
                4
            ),

        score:
            game.score,

        unlocked:
            Math.min(
                game.level + 1,
                4
            )

    };


    localStorage.setItem(
        "cuiaProgress",
        JSON.stringify(progress)
    );


    saveGame();

}


/* =========================================================
   CONQUISTAS
   ========================================================= */

const achievements = [];


function loadAchievements() {

    try {

        const saved =
            localStorage.getItem(
                "cuiaAchievements"
            );


        if (!saved) {
            return;
        }


        const data =
            JSON.parse(saved);


        if (Array.isArray(data)) {

            achievements.push(
                ...data
            );

        }

    } catch (error) {

        console.warn(
            "Erro ao carregar conquistas:",
            error
        );

    }

}


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
        "🏆 Conquista desbloqueada: " +
        name
    );

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


/* =========================================================
   PAUSA
   ========================================================= */

function togglePause() {

    if (!game.running) {
        return;
    }


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


/* =========================================================
   SOM
   ========================================================= */

let soundEnabled = true;


const soundButton =
    document.getElementById(
        "soundButton"
    );


if (soundButton) {

    soundButton.onclick =
        function () {

            soundEnabled =
                !soundEnabled;


            soundButton.innerHTML =
                soundEnabled
                    ? "🔊"
                    : "🔇";

        };

}


function playSound(id) {

    if (!soundEnabled) {
        return;
    }


    const audio =
        document.getElementById(id);


    if (!audio) {
        return;
    }


    audio.currentTime =
        0;


    audio.play()
        .catch(
            function () {}
        );

}


/* =========================================================
   TELA CHEIA
   ========================================================= */

const fullscreenButton =
    document.getElementById(
        "fullscreenButton"
    );


if (fullscreenButton) {

    fullscreenButton.onclick =
        async function () {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document
                        .documentElement
                        .requestFullscreen();

                } else {

                    await document
                        .exitFullscreen();

                }

            } catch (error) {

                console.warn(
                    "Fullscreen não disponível:",
                    error
                );

            }

        };

}


/* =========================================================
   BOTÃO JOGAR
   ========================================================= */

const playButton =
    document.getElementById(
        "playButton"
    );


if (playButton) {

    playButton.onclick =
        function () {

            loadGame();

            loadLevel(
                game.level
            );


            game.running =
                true;


            game.paused =
                false;


            const menu =
                document.getElementById(
                    "menu"
                );


            if (menu) {

                menu.style.display =
                    "none";

            }

        };

}


/* =========================================================
   REINICIAR
   ========================================================= */

const restartButton =
    document.getElementById(
        "restartButton"
    );


if (restartButton) {

    restartButton.onclick =
        function () {

            game.level =
                1;

            game.xp =
                0;

            game.score =
                0;

            game.time =
                0;

            game.objectsEaten =
                0;


            player.radius =
                25;

            player.size =
                25;


            game.paused =
                false;


            loadLevel(1);


            game.running =
                true;


            const pauseScreen =
                document.getElementById(
                    "pauseScreen"
                );


            if (pauseScreen) {

                pauseScreen.style.display =
                    "none";

            }

        };

}


/* =========================================================
   SELEÇÃO DE FASE
   ========================================================= */

const levelButtons =
    document.querySelectorAll(
        ".levelButton"
    );


levelButtons.forEach(
    function (button) {

        button.onclick =
            function () {

                const level =
                    Number(
                        button.dataset.level
                    );


                loadLevel(
                    level
                );


                game.running =
                    true;


                const levelSelect =
                    document.getElementById(
                        "levelSelect"
                    );


                if (levelSelect) {

                    levelSelect.style.display =
                        "none";

                }

            };

    }
);


/* =========================================================
   SELEÇÃO DE FASE
   ========================================================= */

const selectLevelButton =
    document.getElementById(
        "selectLevelButton"
    );


if (selectLevelButton) {

    selectLevelButton.onclick =
        function () {

            const menu =
                document.getElementById(
                    "menu"
                );


            const levelSelect =
                document.getElementById(
                    "levelSelect"
                );


            if (menu) {

                menu.style.display =
                    "none";

            }


            if (levelSelect) {

                levelSelect.style.display =
                    "flex";

            }

        };

}


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const settingsButton =
    document.getElementById(
        "settingsButton"
    );


if (settingsButton) {

    settingsButton.onclick =
        function () {

            const screen =
                document.getElementById(
                    "settingsScreen"
                );


            if (screen) {

                screen.style.display =
                    "flex";

            }

        };

}


const closeSettings =
    document.getElementById(
        "closeSettings"
    );


if (closeSettings) {

    closeSettings.onclick =
        function () {

            const screen =
                document.getElementById(
                    "settingsScreen"
                );


            if (screen) {

                screen.style.display =
                    "none";

            }

        };

}


/* =========================================================
   CRÉDITOS
   ========================================================= */

const creditsButton =
    document.getElementById(
        "creditsButton"
    );


if (creditsButton) {

    creditsButton.onclick =
        function () {

            const screen =
                document.getElementById(
                    "creditsScreen"
                );


            if (screen) {

                screen.style.display =
                    "flex";

            }

        };

}


const closeCredits =
    document.getElementById(
        "closeCredits"
    );


if (closeCredits) {

    closeCredits.onclick =
        function () {

            const screen =
                document.getElementById(
                    "creditsScreen"
                );


            if (screen) {

                screen.style.display =
                    "none";

            }

        };

}


/* =========================================================
   RANKING
   ========================================================= */

const rankingButton =
    document.getElementById(
        "rankingButton"
    );


if (rankingButton) {

    rankingButton.onclick =
        function () {

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

    closeRanking.onclick =
        function () {

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


/* =========================================================
   PRÓXIMA FASE
   ========================================================= */

const nextButton =
    document.getElementById(
        "nextButton"
    );


if (nextButton) {

    nextButton.onclick =
        function () {

            const nextLevel =
                game.level + 1;


            const victoryScreen =
                document.getElementById(
                    "victoryScreen"
                );


            if (
                nextLevel <= 4
            ) {

                loadLevel(
                    nextLevel
                );


                game.running =
                    true;


                if (victoryScreen) {

                    victoryScreen.style.display =
                        "none";

                }

            }

        };

}


/* =========================================================
   JOGAR NOVAMENTE
   ========================================================= */

const playAgain =
    document.getElementById(
        "playAgain"
    );


if (playAgain) {

    playAgain.onclick =
        function () {

            loadLevel(1);


            game.running =
                true;


            const victoryScreen =
                document.getElementById(
                    "victoryScreen"
                );


            if (victoryScreen) {

                victoryScreen.style.display =
                    "none";

            }

        };

}


/* =========================================================
   QUALIDADE GRÁFICA
   ========================================================= */

const quality =
    document.getElementById(
        "graphicsQuality"
    );


function applyGraphics() {

    if (!quality) {
        return;
    }


    const value =
        quality.value;


    if (value === "low") {

        createCarsCount(10);

        createPeopleCount(20);

    }


    if (value === "medium") {

        createCarsCount(25);

        createPeopleCount(50);

    }


    if (value === "high") {

        createCarsCount(40);

        createPeopleCount(80);

    }

}


function createCarsCount(count) {

    city.cars = [];


    for (let i = 0; i < count; i++) {

        city.cars.push({

            x:
                Math.random() *
                world.width,

            y:
                Math.random() *
                world.height,

            color:
                [
                    "#f44336",
                    "#2196f3",
                    "#ffeb3b",
                    "#212121"
                ][
                    Math.floor(
                        Math.random() * 4
                    )
                ],

            speed:
                1 +
                Math.random() * 2

        });

    }

}


function createPeopleCount(count) {

    city.people = [];


    for (let i = 0; i < count; i++) {

        city.people.push({

            x:
                Math.random() *
                world.width,

            y:
                Math.random() *
                world.height,

            emoji:
                "🧍",

            size:
                20

        });

    }

}


if (quality) {

    quality.onchange =
        applyGraphics;

}


/* =========================================================
   LIMPEZA
   ========================================================= */

function cleanObjects() {

    for (
        let i = objects.length - 1;
        i >= 0;
        i--
    ) {

        if (
            objects[i].eaten
        ) {

            objects.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   LOADING
   ========================================================= */

function loadingGame() {

    const loader =
        document.getElementById(
            "gameLoader"
        );


    const bar =
        document.getElementById(
            "loadingProgress"
        );


    const text =
        document.getElementById(
            "loadingText"
        );


    if (!loader) {

        console.warn(
            "#gameLoader não encontrado."
        );

        startGameSystems();

        return;

    }


    let progress = 0;


    const interval =
        setInterval(
            function () {

                progress += 5;


                if (
                    progress > 100
                ) {

                    progress =
                        100;

                }


                if (bar) {

                    bar.style.width =
                        progress +
                        "%";

                }


                if (text) {

                    if (
                        progress < 40
                    ) {

                        text.innerHTML =
                            "Carregando cidade...";

                    } else if (
                        progress < 70
                    ) {

                        text.innerHTML =
                            "Preparando cuias...";

                    } else if (
                        progress < 100
                    ) {

                        text.innerHTML =
                            "Misturando a erva...";

                    } else {

                        text.innerHTML =
                            "Pronto!";

                    }

                }


                if (
                    progress >= 100
                ) {

                    clearInterval(
                        interval
                    );


                    setTimeout(
                        function () {

                            loader.style.display =
                                "none";


                            startGameSystems();

                        },
                        500
                    );

                }

            },
            100
        );

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

let systemsStarted = false;


function startGameSystems() {

    if (systemsStarted) {
        return;
    }


    systemsStarted =
        true;


    createCity();

    createCars();

    createPeople();

    createNPCs();

    loadAchievements();

    updateHUD();

    updateObjective();


    console.log(
        "🧉 CUIA.IO carregado com sucesso!"
    );

}


/* =========================================================
   LOOP PRINCIPAL
   ========================================================= */

let lastTime =
    performance.now();


function gameLoop(currentTime) {

    requestAnimationFrame(
        gameLoop
    );


    const delta =
        Math.min(
            0.05,
            (
                currentTime -
                lastTime
            ) / 1000
        );


    lastTime =
        currentTime;


    if (
        !game.running ||
        game.paused
    ) {

        return;

    }


    update(delta);

    draw();

}


/* =========================================================
   UPDATE
   ========================================================= */

function update(delta) {

    player.update();


    checkCollisions();


    updateCars();


    updateParticles();


    updateNPCs();


    updateTimer(delta);


    checkLevelGoal();


    checkAchievements();


    cleanObjects();


    updateHUD();


    updateRanking();

}


/* =========================================================
   UPDATE NPCs
   ========================================================= */

function updateNPCs() {

    for (const npc of npcs) {

        npc.update();

    }

}


/* =========================================================
   DRAW
   ========================================================= */

function draw() {

    /* FUNDO */

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        world.background;


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* CIDADE */

    drawCity();


    /* OBJETOS */

    for (const obj of objects) {

        obj.draw();

    }


    /* NPCs */

    for (const npc of npcs) {

        npc.draw();

    }


    /* PARTÍCULAS */

    drawParticles();


    /* JOGADOR */

    player.draw();

}


/* =========================================================
   FPS
   ========================================================= */

let fps = 0;

let frames = 0;

let lastFPS =
    performance.now();


function calculateFPS(now) {

    frames++;


    if (
        now - lastFPS >= 1000
    ) {

        fps =
            frames;


        frames =
            0;


        lastFPS =
            now;

    }

}


let showFPS = false;


function debugFPS() {

    if (!showFPS) {
        return;
    }


    ctx.fillStyle =
        "white";


    ctx.font =
        "16px Arial";


    ctx.fillText(
        "FPS: " + fps,
        20,
        20
    );

}


/* =========================================================
   LOOP COM FPS
   ========================================================= */

function startMainLoop() {

    function loop(time) {

        calculateFPS(
            time
        );


        gameLoop(
            time
        );


        requestAnimationFrame(
            loop
        );

    }


    requestAnimationFrame(
        loop
    );

}


/* =========================================================
   AUTO SAVE
   ========================================================= */

setInterval(
    function () {

        if (game.running) {

            saveGame();

        }

    },
    30000
);


window.addEventListener(
    "beforeunload",
    function () {

        saveGame();

    }
);


/* =========================================================
   LIMPEZA AUTOMÁTICA
   ========================================================= */

setInterval(
    function () {

        cleanObjects();

    },
    10000
);


/* =========================================================
   DETECÇÃO MOBILE
   ========================================================= */

const mobile =
    /Android|iPhone|iPad|iPod/i
        .test(
            navigator.userAgent
        );


if (mobile) {

    player.speed =
        4;

}


/* =========================================================
   MÚSICA
   ========================================================= */

function startMusic() {

    if (!soundEnabled) {
        return;
    }


    const music =
        document.getElementById(
            "music"
        );


    if (!music) {
        return;
    }


    music.volume =
        0.3;


    music.play()
        .catch(
            function () {}
        );

}


/* =========================================================
   INICIAR
   ========================================================= */

resizeCanvas();


loadGame();


startMainLoop();


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        loadingGame
    );

} else {

    loadingGame();

}


/* =========================================================
   LOG
   ========================================================= */

console.log(`

🧉 CUIA.IO

Controles:
WASD / Setas = mover
Mouse = direcionar
Celular = joystick

Objetivo:
Crescer a cuia até conseguir
engolir o prédio gigante.

Boa partida!

`);
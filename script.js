/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 1

    Motor inicial do jogo
====================================================*/


//=========================================
// CANVAS
//=========================================


const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");



function resizeCanvas(){

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();




//=========================================
// ESTADO DO JOGO
//=========================================


const game = {


    running:false,

    paused:false,

    level:1,

    score:0,

    xp:0,

    time:0,


    objectsEaten:0,


};





//=========================================
// MUNDO
//=========================================


const world = {


    width:5000,

    height:5000,


    background:"#65a765"



};





//=========================================
// CÂMERA
//=========================================


const camera = {


    x:0,

    y:0,


    zoom:1,



    follow(target){


        this.x =
        target.x -
        canvas.width / 2;



        this.y =
        target.y -
        canvas.height / 2;



        // limites


        if(this.x < 0)

            this.x = 0;



        if(this.y < 0)

            this.y = 0;




        if(
            this.x >
            world.width -
            canvas.width
        )

            this.x =
            world.width -
            canvas.width;




        if(
            this.y >
            world.height -
            canvas.height
        )

            this.y =
            world.height -
            canvas.height;


    }



};







//=========================================
// CONTROLE DO JOGADOR
//=========================================


const keys = {


    up:false,

    down:false,

    left:false,

    right:false



};






window.addEventListener(
"keydown",
(e)=>{


    switch(e.key){


        case "ArrowUp":

        case "w":

        case "W":

            keys.up=true;

        break;



        case "ArrowDown":

        case "s":

        case "S":

            keys.down=true;

        break;



        case "ArrowLeft":

        case "a":

        case "A":

            keys.left=true;

        break;



        case "ArrowRight":

        case "d":

        case "D":

            keys.right=true;

        break;


    }


});





window.addEventListener(
"keyup",
(e)=>{


    switch(e.key){


        case "ArrowUp":

        case "w":

        case "W":

            keys.up=false;

        break;



        case "ArrowDown":

        case "s":

        case "S":

            keys.down=false;

        break;



        case "ArrowLeft":

        case "a":

        case "A":

            keys.left=false;

        break;



        case "ArrowRight":

        case "d":

        case "D":

            keys.right=false;

        break;


    }



});








//=========================================
// MOUSE
//=========================================


const mouse = {


    x:canvas.width/2,

    y:canvas.height/2



};



canvas.addEventListener(
"mousemove",
(e)=>{


    mouse.x=e.clientX;

    mouse.y=e.clientY;



});









//=========================================
// CUIA DO JOGADOR
//=========================================


const player = {


    x:world.width/2,

    y:world.height/2,


    radius:25,


    speed:5,


    color:"#8d5524",



    size:1,



    maxSize:100,




    update(){



        let dx=0;

        let dy=0;



        if(keys.up)

            dy-=1;


        if(keys.down)

            dy+=1;


        if(keys.left)

            dx-=1;


        if(keys.right)

            dx+=1;





        // normalização


        if(dx!==0 || dy!==0){


            let distance =
            Math.sqrt(
                dx*dx+
                dy*dy
            );



            dx/=distance;

            dy/=distance;



        }





        this.x +=
        dx *
        this.speed;



        this.y +=
        dy *
        this.speed;





        // limites do mapa


        if(this.x < 0)

            this.x=0;



        if(this.y < 0)

            this.y=0;



        if(this.x > world.width)

            this.x=world.width;



        if(this.y > world.height)

            this.y=world.height;




        camera.follow(this);



    },







    draw(){



        ctx.beginPath();



        ctx.arc(

            this.x-camera.x,

            this.y-camera.y,

            this.radius,

            0,

            Math.PI*2

        );



        ctx.fillStyle=this.color;



        ctx.fill();





        // borda


        ctx.strokeStyle="#4e342e";


        ctx.lineWidth=5;


        ctx.stroke();




    }




};









//=========================================
// LOOP PRINCIPAL
//=========================================


function gameLoop(){



    requestAnimationFrame(
        gameLoop
    );



    if(!game.running)

        return;



    if(game.paused)

        return;




    update();


    draw();



}






function update(){


    player.update();


    game.time +=0.016;



}





function draw(){



    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );




    // fundo


    ctx.fillStyle=
    world.background;



    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );





    player.draw();



}






// iniciar loop

gameLoop();
/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 2

    Mundo e objetos
====================================================*/



//=========================================
// LISTA DE OBJETOS DO MAPA
//=========================================


const objects = [];





//=========================================
// CLASSE DOS OBJETOS
//=========================================


class GameObject{


    constructor(
        name,
        x,
        y,
        size,
        color,
        emoji,
        value
    ){


        this.name=name;


        this.x=x;

        this.y=y;


        this.size=size;


        this.color=color;


        this.emoji=emoji;


        this.value=value;


        this.radius=size;



        this.eaten=false;



    }





    draw(){


        if(this.eaten)

            return;



        ctx.beginPath();



        ctx.arc(

            this.x-camera.x,

            this.y-camera.y,

            this.radius,

            0,

            Math.PI*2

        );



        ctx.fillStyle=this.color;


        ctx.fill();




        ctx.font=
        `${this.radius}px Arial`;



        ctx.textAlign="center";


        ctx.textBaseline="middle";



        ctx.fillText(

            this.emoji,

            this.x-camera.x,

            this.y-camera.y

        );




    }



}









//=========================================
// CRIAR OBJETO ALEATÓRIO
//=========================================


function createObject(type){



    let data;




    switch(type){



        case "agua":

            data={

                name:"Gota de água",

                size:8,

                color:"#2196f3",

                emoji:"💧",

                value:1

            };

        break;



        case "erva":


            data={

                name:"Erva-mate",

                size:15,

                color:"#558b2f",

                emoji:"🌿",

                value:2

            };

        break;




        case "bomba":


            data={

                name:"Bomba de chimarrão",

                size:35,

                color:"#444",

                emoji:"🥄",

                value:5

            };


        break;




        case "termica":


            data={

                name:"Garrafa térmica",

                size:55,

                color:"#e53935",

                emoji:"🍼",

                value:8

            };


        break;




        case "chaleira":


            data={

                name:"Chaleira",

                size:75,

                color:"#795548",

                emoji:"♨️",

                value:12

            };


        break;





        case "arvore":


            data={

                name:"Árvore",

                size:100,

                color:"#2e7d32",

                emoji:"🌳",

                value:20

            };


        break;





        case "casa":


            data={

                name:"Casa",

                size:160,

                color:"#ff9800",

                emoji:"🏠",

                value:35

            };


        break;





        case "predio":


            data={

                name:"Prédio",

                size:260,

                color:"#757575",

                emoji:"🏢",

                value:60

            };


        break;



    }





    let obj=new GameObject(

        data.name,

        Math.random()*world.width,

        Math.random()*world.height,

        data.size,

        data.color,

        data.emoji,

        data.value

    );



    objects.push(obj);



}









//=========================================
// GERAR CIDADE
//=========================================


function generateWorld(){



    objects.length=0;




    // pequenas gotas de água


    for(let i=0;i<80;i++)

        createObject("agua");





    // erva


    for(let i=0;i<60;i++)

        createObject("erva");





    // bombas


    for(let i=0;i<25;i++)

        createObject("bomba");





    // térmicas


    for(let i=0;i<20;i++)

        createObject("termica");





    // chaleiras


    for(let i=0;i<15;i++)

        createObject("chaleira");





    // árvores


    for(let i=0;i<40;i++)

        createObject("arvore");





    // casas


    for(let i=0;i<25;i++)

        createObject("casa");





    // prédios grandes


    for(let i=0;i<10;i++)

        createObject("predio");



}







//=========================================
// DESENHAR OBJETOS
//=========================================


function drawObjects(){



    for(
        let obj of objects
    ){


        obj.draw();


    }



}






//=========================================
// ADICIONAR AO LOOP DE DESENHO
//=========================================


const oldDraw = draw;



draw=function(){



    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );



    ctx.save();



    drawObjects();



    player.draw();



    ctx.restore();



};






//=========================================
// INICIAR MAPA
//=========================================


generateWorld();
/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 3

    Colisão e crescimento
====================================================*/



//=========================================
// DISTÂNCIA ENTRE OBJETOS
//=========================================


function distance(a,b){


    let dx =
    a.x-b.x;


    let dy =
    a.y-b.y;



    return Math.sqrt(
        dx*dx+
        dy*dy
    );


}







//=========================================
// VERIFICAR COLISÕES
//=========================================


function checkCollisions(){



    for(
        let obj of objects
    ){



        if(obj.eaten)

            continue;





        let dist =
        distance(
            player,
            obj
        );






        if(
            dist <
            player.radius + obj.radius
        ){


            tryEat(obj);



        }




    }



}







//=========================================
// TENTAR ENGOLIR
//=========================================


function tryEat(obj){



    // somente come objetos menores


    if(
        player.radius >=
        obj.radius * 1.1
    ){



        obj.eaten=true;



        growPlayer(
            obj
        );



        showEatMessage(
            obj.name
        );



    }



}








//=========================================
// CRESCER A CUIA
//=========================================


function growPlayer(obj){



    player.radius +=
    obj.value;



    player.size +=
    obj.value;




    game.xp +=
    obj.value;



    game.score +=
    obj.value;



    game.objectsEaten++;





    updateHUD();





    createGrowthEffect();





    checkEvolution();



}








//=========================================
// ATUALIZAR HUD
//=========================================


function updateHUD(){



    let sizeText =
    document.getElementById(
        "sizeText"
    );


    let xpText =
    document.getElementById(
        "xpText"
    );



    let levelText =
    document.getElementById(
        "levelText"
    );





    if(sizeText)

        sizeText.innerHTML =
        Math.floor(
            player.size
        );




    if(xpText)

        xpText.innerHTML =
        game.xp;





    if(levelText)

        levelText.innerHTML =
        game.level;



}







//=========================================
// MENSAGEM AO COMER
//=========================================


function showEatMessage(text){



    let message =
    document.getElementById(
        "message"
    );



    if(!message)

        return;





    message.innerHTML =
    "🧉 Engoliu: "
    +
    text;




    message.classList.add(
        "fadeIn"
    );





    setTimeout(()=>{


        message.innerHTML="";


        message.classList.remove(
            "fadeIn"
        );


    },1000);



}







//=========================================
// EFEITO DE CRESCIMENTO
//=========================================


function createGrowthEffect(){



    player.radius *=1.05;



    setTimeout(()=>{


        player.radius /=1.05;


    },200);



}








//=========================================
// SISTEMA DE EVOLUÇÃO
//=========================================


function checkEvolution(){



    if(
        player.radius > 50
        &&
        game.level===1
    ){


        game.level=2;


        showEvolution(
            "Cuia pequena!",
            "Agora você consegue engolir mais objetos."
        );


    }





    if(
        player.radius > 120
        &&
        game.level===2
    ){


        game.level=3;


        showEvolution(
            "Cuia média!",
            "A cidade começa a ficar pequena."
        );


    }







    if(
        player.radius > 250
        &&
        game.level===3
    ){


        game.level=4;


        showEvolution(
            "Cuia gigante!",
            "Prédios estão ao seu alcance!"
        );


    }



}







//=========================================
// MENSAGEM DE EVOLUÇÃO
//=========================================


function showEvolution(
    title,
    text
){



    let box =
    document.getElementById(
        "evolutionMessage"
    );



    let titleBox =
    document.getElementById(
        "evolutionTitle"
    );



    let desc =
    document.getElementById(
        "evolutionDescription"
    );




    if(!box)

        return;





    titleBox.innerHTML =
    title;



    desc.innerHTML =
    text;




    box.style.display =
    "block";





    setTimeout(()=>{


        box.style.display =
        "none";


    },3000);



}








//=========================================
// ADICIONAR AO UPDATE ORIGINAL
//=========================================


const oldUpdate =
update;



update=function(){



    oldUpdate();



    checkCollisions();



};
/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 4

    Progressão, gaúcho, cavalo e fases
====================================================*/



//=========================================
// NOVOS OBJETOS GRANDES
//=========================================


function createLargeObjects(){


    createObject("gaucho");


    createObject("horse");


    createObject("gauchoHorse");


    createObject("megaPredio");


}






//=========================================
// ADICIONAR NOVOS TIPOS
//=========================================


const oldCreateObject =
createObject;



createObject=function(type){



    let data;



    switch(type){



        case "gaucho":


            data={

                name:"Gaúcho",

                size:220,

                color:"#795548",

                emoji:"🤠",

                value:50

            };

        break;





        case "horse":


            data={

                name:"Cavalo",

                size:350,

                color:"#4e342e",

                emoji:"🐴",

                value:80

            };


        break;





        case "gauchoHorse":


            data={

                name:"Cavalo com Gaúcho Cuiudo",

                size:500,

                color:"#3e2723",

                emoji:"🐴🤠",

                value:120

            };


        break;






        case "megaPredio":


            data={

                name:"Prédio Gigante",

                size:800,

                color:"#37474f",

                emoji:"🏢",

                value:200

            };


        break;





        default:


            return oldCreateObject(type);



    }





    let obj =
    new GameObject(

        data.name,

        Math.random()*world.width,

        Math.random()*world.height,

        data.size,

        data.color,

        data.emoji,

        data.value

    );



    objects.push(obj);



};









//=========================================
// GERAR FASE COMPLETA
//=========================================


function generateLevel(level){



    objects.length=0;





    // FASE 1
    // Pequenos objetos


    if(level===1){


        for(let i=0;i<100;i++)

            createObject("agua");



        for(let i=0;i<70;i++)

            createObject("erva");



        for(let i=0;i<30;i++)

            createObject("bomba");



    }






    // FASE 2
    // Equipamentos


    if(level===2){



        for(let i=0;i<50;i++)

            createObject("termica");



        for(let i=0;i<30;i++)

            createObject("chaleira");



        for(let i=0;i<30;i++)

            createObject("casa");



    }







    // FASE 3
    // Cidade


    if(level===3){


        for(let i=0;i<40;i++)

            createObject("arvore");



        for(let i=0;i<40;i++)

            createObject("casa");



        for(let i=0;i<20;i++)

            createObject("predio");



    }








    // FASE FINAL


    if(level===4){



        for(let i=0;i<5;i++)

            createObject("gaucho");



        for(let i=0;i<5;i++)

            createObject("horse");



        createLargeObjects();



    }



}









//=========================================
// OBJETIVO DA FASE
//=========================================


const levelGoals={


    1:"Engolir água e erva-mate",


    2:"Engolir equipamentos do chimarrão",


    3:"Dominar a cidade",


    4:"Engolir o prédio gigante"



};







function updateObjective(){



    let element =
    document.getElementById(
        "objectiveText"
    );



    if(element)


        element.innerHTML =
        levelGoals[
            game.level
        ];



}









//=========================================
// VERIFICAR VITÓRIA
//=========================================


function checkVictory(){



    let mega =
    objects.find(
        obj =>
        obj.name===
        "Prédio Gigante"
    );





    if(
        game.level===4
        &&
        !mega
    ){


        finishLevel();



    }



}








//=========================================
// FINAL DA FASE
//=========================================


function finishLevel(){



    game.running=false;




    let screen =
    document.getElementById(
        "victoryScreen"
    );



    if(screen)

        screen.style.display=
        "flex";





    transformBuilding();



}







//=========================================
// TRANSFORMAR PRÉDIO EM BOMBA
//=========================================


function transformBuilding(){



    let message =
    document.getElementById(
        "message"
    );



    if(message){


        message.innerHTML=

        "🏢➡️🥄 O prédio virou uma Bomba gigante!";


    }





}









//=========================================
// ADICIONAR AO LOOP
//=========================================


const oldUpdate2 =
update;



update=function(){



    oldUpdate2();


    checkVictory();


    updateObjective();



};






/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 5

    Controles, áudio e sistema do jogo
====================================================*/



//=========================================
// CONTROLE POR MOUSE
//=========================================


let mouseControl = true;



canvas.addEventListener(
"mousemove",
(e)=>{


    if(!mouseControl)
        return;



    let rect =
    canvas.getBoundingClientRect();



    let mouseX =
    e.clientX - rect.left;


    let mouseY =
    e.clientY - rect.top;




    let dx =
    mouseX -
    canvas.width/2;



    let dy =
    mouseY -
    canvas.height/2;



    let dist =
    Math.sqrt(
        dx*dx+
        dy*dy
    );



    if(dist>20){


        dx/=dist;

        dy/=dist;



        player.x +=
        dx*
        player.speed;



        player.y +=
        dy*
        player.speed;



    }



});









//=========================================
// JOYSTICK MOBILE
//=========================================


let joystick = {


    active:false,


    x:0,


    y:0


};





const stick =
document.getElementById(
    "stick"
);





const joystickBox =
document.getElementById(
    "joystick"
);






if(joystickBox){



joystickBox.addEventListener(
"touchmove",
(e)=>{


    e.preventDefault();



    let touch =
    e.touches[0];



    let rect =
    joystickBox.getBoundingClientRect();



    let x =
    touch.clientX -
    rect.left -
    75;



    let y =
    touch.clientY -
    rect.top -
    75;




    joystick.x=x/50;

    joystick.y=y/50;




    if(stick){


        stick.style.transform=

        `translate(${x}px,${y}px)`;

    }




},



{
passive:false

});







joystickBox.addEventListener(
"touchend",
()=>{


    joystick.x=0;

    joystick.y=0;



    if(stick)

        stick.style.transform=
        "translate(0,0)";



});


}








// adicionar movimento joystick


const oldPlayerUpdate =
player.update;



player.update=function(){



    oldPlayerUpdate();



    if(
        joystick.x ||
        joystick.y
    ){



        player.x +=
        joystick.x*
        player.speed;



        player.y +=
        joystick.y*
        player.speed;



    }




};









//=========================================
// PAUSA
//=========================================


function togglePause(){



    game.paused =
    !game.paused;




    let screen =
    document.getElementById(
        "pauseScreen"
    );



    if(screen){


        screen.style.display =

        game.paused ?

        "flex"

        :

        "none";


    }



}





const pauseButton =
document.getElementById(
"pauseButton"
);



if(pauseButton){


pauseButton.onclick =
togglePause;


}







const resumeButton =
document.getElementById(
"resumeButton"
);



if(resumeButton){


resumeButton.onclick =
togglePause;


}







//=========================================
// ÁUDIO
//=========================================


let soundEnabled=true;



const soundButton =
document.getElementById(
"soundButton"
);




if(soundButton){



soundButton.onclick=()=>{


    soundEnabled =
    !soundEnabled;



    soundButton.innerHTML =

    soundEnabled ?

    "🔊"

    :

    "🔇";



};



}







function playSound(id){



    if(!soundEnabled)

        return;




    let audio =
    document.getElementById(id);



    if(audio){


        audio.currentTime=0;


        audio.play()
        .catch(()=>{});


    }



}








//=========================================
// TELA CHEIA
//=========================================


const fullscreenButton =
document.getElementById(
"fullscreenButton"
);



if(fullscreenButton){



fullscreenButton.onclick=()=>{


    if(
        !document.fullscreenElement
    ){


        document.documentElement
        .requestFullscreen();


    }

    else{


        document.exitFullscreen();


    }


};



}








//=========================================
// SALVAR JOGO
//=========================================


function saveGame(){



    let data={



        level:
        game.level,


        xp:
        game.xp,


        score:
        game.score,


        size:
        player.size



    };





    localStorage.setItem(

        "cuiaSave",

        JSON.stringify(data)

    );





    showSaveMessage();



}








function loadGame(){



    let save =
    localStorage.getItem(
        "cuiaSave"
    );



    if(!save)

        return;




    let data =
    JSON.parse(save);




    game.level =
    data.level || 1;



    game.xp =
    data.xp || 0;



    game.score =
    data.score || 0;



    player.size =
    data.size || 1;




}









function showSaveMessage(){



    let msg =
    document.getElementById(
        "saveMessage"
    );



    if(!msg)

        return;



    msg.style.display="block";



    setTimeout(()=>{


        msg.style.display="none";


    },2000);



}









//=========================================
// INICIAR JOGO
//=========================================


function startGame(){



    loadGame();



    generateLevel(
        game.level
    );



    game.running=true;



    let menu =
    document.getElementById(
        "menu"
    );



    if(menu)

        menu.style.display="none";



}







const playButton =
document.getElementById(
"playButton"
);



if(playButton){


playButton.onclick =
startGame;


}









//=========================================
// REINICIAR
//=========================================


function restartGame(){



    game.level=1;

    game.xp=0;

    game.score=0;


    player.radius=25;


    player.size=1;



    generateLevel(1);



    game.running=true;



}








const restartButton =
document.getElementById(
"restartButton"
);



if(restartButton){


restartButton.onclick =
restartGame;


}






// salvar automaticamente


setInterval(()=>{


    if(game.running)

        saveGame();


},30000);
/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 6

    Câmera avançada, cidade e efeitos
====================================================*/



//=========================================
// CÂMERA COM ZOOM DINÂMICO
//=========================================


camera.targetZoom = 1;



camera.updateZoom=function(){



    let zoom =
    1 -
    (player.radius/1500);



    if(zoom < 0.45)

        zoom=0.45;



    this.zoom +=
    (zoom-this.zoom)
    *0.05;



};






const oldCameraFollow =
camera.follow;



camera.follow=function(target){



    oldCameraFollow.call(
        this,
        target
    );


    this.updateZoom();



};







//=========================================
// CIDADE
//=========================================


const city={


    streets:[],


    cars:[],


    people:[]


};








//=========================================
// CRIAR RUAS
//=========================================


function createCity(){



    city.streets=[];



    // ruas horizontais


    for(
        let y=300;
        y<world.height;
        y+=500
    ){


        city.streets.push({

            x:0,

            y:y,

            width:world.width,

            height:80


        });


    }






    // ruas verticais


    for(
        let x=300;
        x<world.width;
        x+=500
    ){


        city.streets.push({


            x:x,

            y:0,

            width:80,

            height:world.height



        });


    }



}









//=========================================
// CARROS
//=========================================


function createCars(){



    city.cars=[];



    for(
        let i=0;
        i<40;
        i++
    ){



        city.cars.push({


            x:
            Math.random()
            *
            world.width,


            y:
            Math.random()
            *
            world.height,


            color:

            [
            "#f44336",
            "#2196f3",
            "#ffeb3b",
            "#212121"
            ]
            [
            Math.floor(
            Math.random()*4
            )
            ],



            speed:
            1+
            Math.random()*2


        });



    }



}








//=========================================
// PESSOAS
//=========================================


function createPeople(){



    city.people=[];



    for(
        let i=0;
        i<80;
        i++
    ){


        city.people.push({


            x:
            Math.random()
            *
            world.width,


            y:
            Math.random()
            *
            world.height,


            emoji:
            "🧍",



            size:20



        });



    }



}








//=========================================
// DESENHAR CIDADE
//=========================================


function drawCity(){



    ctx.save();



    ctx.translate(
        -camera.x,
        -camera.y
    );





    // ruas


    for(
        let street of city.streets
    ){


        ctx.fillStyle="#444";


        ctx.fillRect(

            street.x,

            street.y,

            street.width,

            street.height

        );



    }






    // carros


    for(
        let car of city.cars
    ){



        ctx.fillStyle=
        car.color;



        ctx.fillRect(

            car.x,

            car.y,

            35,

            18

        );



    }






    // pessoas


    ctx.font="25px Arial";



    for(
        let p of city.people
    ){



        ctx.fillText(

            p.emoji,

            p.x,

            p.y

        );



    }







    ctx.restore();



}








//=========================================
// MOVIMENTO DOS CARROS
//=========================================


function updateCars(){



    for(
        let car of city.cars
    ){



        car.x +=
        car.speed;



        if(
            car.x >
            world.width
        )

            car.x=0;



    }




}









//=========================================
// PARTÍCULAS
//=========================================


const particles=[];



function createParticle(
x,
y,
color
){



    particles.push({



        x:x,

        y:y,

        size:
        5+
        Math.random()*8,


        color:color,


        life:50


    });



}







function updateParticles(){



    for(
        let i=
        particles.length-1;
        i>=0;
        i--
    ){



        let p =
        particles[i];



        p.y-=2;


        p.life--;



        if(
            p.life<=0
        ){


            particles.splice(
                i,
                1
            );


        }



    }




}








function drawParticles(){



    for(
        let p of particles
    ){



        ctx.fillStyle=
        p.color;



        ctx.beginPath();



        ctx.arc(

            p.x-camera.x,

            p.y-camera.y,

            p.size,

            0,

            Math.PI*2

        );



        ctx.fill();



    }



}








//=========================================
// EFEITO DE ENGOLIR
//=========================================


function eatEffect(obj){



    for(
        let i=0;
        i<15;
        i++
    ){



        createParticle(

            obj.x,

            obj.y,

            obj.color

        );


    }




}









// substituir comer


const oldGrow =
growPlayer;



growPlayer=function(obj){



    eatEffect(obj);



    oldGrow(obj);



    player.radius+=2;



};









//=========================================
// ATUALIZAR LOOP
//=========================================


const oldUpdate3 =
update;



update=function(){



    oldUpdate3();



    updateCars();


    updateParticles();



};









const oldDraw3 =
draw;



draw=function(){



    ctx.save();



    ctx.scale(

        camera.zoom,

        camera.zoom

    );



    drawCity();



    oldDraw3();



    drawParticles();



    ctx.restore();



};








// iniciar cidade


createCity();

createCars();

createPeople();
/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 7

    NPCs, ranking e sistema de pontuação
====================================================*/



//=========================================
// OUTRAS CUIAS (NPC)
//=========================================


const npcs=[];



class CuiaNPC{


    constructor(){


        this.x=
        Math.random()
        *
        world.width;


        this.y=
        Math.random()
        *
        world.height;



        this.radius=
        20+
        Math.random()*40;



        this.speed=
        1+
        Math.random()*2;



        this.color=

        [
        "#795548",
        "#33691e",
        "#6d4c41",
        "#8d6e63"

        ]
        [
        Math.floor(
        Math.random()*4
        )
        ];



        this.target=null;


        this.score=0;



    }





    update(){


        if(!this.target){


            this.target =
            objects[
            Math.floor(
            Math.random()
            *
            objects.length
            )
            ];



        }




        if(this.target){



            let dx =
            this.target.x -
            this.x;



            let dy =
            this.target.y -
            this.y;




            let d =
            Math.sqrt(
            dx*dx+
            dy*dy
            );



            if(d>0){


                this.x +=
                dx/d*
                this.speed;



                this.y +=
                dy/d*
                this.speed;



            }





            if(
            d <
            this.radius+
            this.target.radius
            ){


                if(
                this.radius >=
                this.target.radius
                ){


                    this.target.eaten=true;



                    this.score +=
                    this.target.value;



                    this.radius+=1;



                }


            }



        }


    }







    draw(){


        ctx.beginPath();



        ctx.arc(

            this.x-camera.x,

            this.y-camera.y,

            this.radius,

            0,

            Math.PI*2

        );



        ctx.fillStyle=
        this.color;



        ctx.fill();



        ctx.font="25px Arial";


        ctx.fillText(

            "🧉",

            this.x-camera.x,

            this.y-camera.y

        );



    }




}









//=========================================
// GERAR NPCS
//=========================================


function createNPCs(){



    npcs.length=0;



    for(
        let i=0;
        i<8;
        i++
    ){


        npcs.push(
            new CuiaNPC()
        );


    }


}








//=========================================
// ATUALIZAR NPCS
//=========================================


function updateNPCs(){



    for(
        let npc of npcs
    ){


        npc.update();


    }



}








//=========================================
// DESENHAR NPCS
//=========================================


function drawNPCs(){



    for(
        let npc of npcs
    ){


        npc.draw();



    }


}









//=========================================
// CRONÔMETRO
//=========================================


game.maxTime=180;



function updateTimer(){



    if(
        !game.running
        ||
        game.paused
    )

        return;




    game.time+=0.016;



    let timer =
    document.getElementById(
        "timer"
    );



    if(timer){



        let remaining =
        Math.floor(
        game.maxTime -
        game.time
        );



        timer.innerHTML=
        remaining;



    }




    if(
    game.time>=
    game.maxTime
    ){


        finishLevel();



    }




}







//=========================================
// SISTEMA DE PONTUAÇÃO
//=========================================


function updateScore(){



    let score =
    document.getElementById(
    "scoreText"
    );



    if(score){


        score.innerHTML=
        game.score;



    }



}








//=========================================
// RANKING
//=========================================


function updateRanking(){



    let ranking=[];




    ranking.push({


        name:"Você",


        score:
        game.score



    });





    for(
        let npc of npcs
    ){



        ranking.push({


            name:
            "Cuia rival",


            score:
            npc.score



        });



    }







    ranking.sort(
        (a,b)=>
        b.score-a.score
    );






    let list =
    document.getElementById(
    "rankingList"
    );



    if(!list)

        return;



    list.innerHTML="";




    ranking
    .slice(0,5)
    .forEach(
    (player,i)=>{


        let li =
        document.createElement(
            "li"
        );



        li.innerHTML=

        `${i+1}º -
        ${player.name}
        :
        ${player.score}`;



        list.appendChild(li);



    });




}








//=========================================
// ESTATÍSTICAS FINAIS
//=========================================


function showFinalStats(){



    let finalSize =
    document.getElementById(
    "finalSize"
    );


    let finalItems =
    document.getElementById(
    "finalItems"
    );


    let finalTime =
    document.getElementById(
    "finalTime"
    );





    if(finalSize)

        finalSize.innerHTML=
        Math.floor(
        player.radius
        );



    if(finalItems)

        finalItems.innerHTML=
        game.objectsEaten;



    if(finalTime)

        finalTime.innerHTML=
        Math.floor(
        game.time
        );




}









//=========================================
// LIGAR AO LOOP
//=========================================


const oldUpdate4=
update;



update=function(){


    oldUpdate4();


    updateNPCs();


    updateTimer();


    updateScore();


    updateRanking();



};






const oldDraw4=
draw;



draw=function(){



    oldDraw4();



    drawNPCs();



};








// criar rivais


createNPCs();
/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 8

    Sistema de fases e vitória final
====================================================*/



//=========================================
// CONFIGURAÇÃO DAS FASES
//=========================================


const levels = {


    1:{


        name:
        "A Primeira Cuia",


        goal:
        "Engula água e erva-mate",


        requiredSize:
        60


    },



    2:{


        name:
        "Acessórios do Chimarrão",


        goal:
        "Colete bomba, térmica e chaleira",


        requiredSize:
        150


    },



    3:{


        name:
        "A Cidade Gaúcha",


        goal:
        "Domine casas e prédios",


        requiredSize:
        350


    },



    4:{


        name:
        "O Grande Chimarrão",


        goal:
        "Engula o prédio gigante",


        requiredSize:
        900


    }



};







//=========================================
// CARREGAR FASE
//=========================================


function loadLevel(number){



    game.level =
    number;



    game.time=0;


    game.score=0;


    game.objectsEaten=0;



    player.radius=25;


    player.size=1;



    generateLevel(number);



    updateObjective();



    showNotification(

        "🧉 Fase "
        +
        number
        +
        " iniciada!"

    );



}








//=========================================
// COMPLETAR FASE
//=========================================


function completeLevel(){



    game.running=false;



    saveProgress();



    showVictory();



}








//=========================================
// SALVAR PROGRESSO
//=========================================


function saveProgress(){



    let progress={


        level:
        game.level+1,


        score:
        game.score,


        unlocked:
        game.level+1



    };



    localStorage.setItem(

        "cuiaProgress",

        JSON.stringify(progress)

    );



}









//=========================================
// TELA DE VITÓRIA
//=========================================


function showVictory(){



    let screen =
    document.getElementById(
        "victoryScreen"
    );



    if(screen){


        screen.style.display=
        "flex";


    }




    showFinalStats();



}








//=========================================
// NOTIFICAÇÃO
//=========================================


function showNotification(text){



    let container =
    document.getElementById(
        "notificationContainer"
    );



    if(!container)

        return;




    let div =
    document.createElement(
        "div"
    );



    div.className=
    "notification";



    div.innerHTML=
    text;



    container.appendChild(div);




    setTimeout(()=>{


        div.remove();



    },3000);



}









//=========================================
// PRÉDIO FINAL
//=========================================


function checkFinalBuilding(){



    if(
    game.level!==4
    )

        return;





    let building =
    objects.find(

    obj=>

    obj.name===

    "Prédio Gigante"

    );





    if(!building){


        finishFinalLevel();



    }



}









//=========================================
// TRANSFORMAÇÃO FINAL
//=========================================


function finishFinalLevel(){



    let effect =
    document.createElement(
        "div"
    );



    effect.className=
    "levelComplete";



    effect.innerHTML=

    `

    🏢

    ➡️

    🥄


    <h1>

    A cidade virou uma bomba de chimarrão!

    </h1>

    `;



    document.body.appendChild(
        effect
    );





    setTimeout(()=>{


        effect.remove();


        completeLevel();



    },4000);



}









//=========================================
// BOTÕES
//=========================================


const nextButton =
document.getElementById(
"nextButton"
);



if(nextButton){


nextButton.onclick=()=>{


    let next =
    game.level+1;



    if(
    next<=4
    ){



        loadLevel(next);



        game.running=true;



        document.getElementById(
        "victoryScreen"
        ).style.display="none";



    }



};



}









const playAgain =
document.getElementById(
"playAgain"
);



if(playAgain){



playAgain.onclick=()=>{


    loadLevel(1);


    game.running=true;


};



}








//=========================================
// VERIFICAR OBJETIVO
//=========================================


function checkLevelGoal(){



    let current =
    levels[
    game.level
    ];



    if(
    player.radius >=
    current.requiredSize
    ){



        if(
        game.level<4
        ){


            completeLevel();



        }

        else{


            checkFinalBuilding();



        }


    }



}








//=========================================
// LOOP FINAL
//=========================================


const oldUpdate5=
update;



update=function(){


    oldUpdate5();



    checkLevelGoal();



};
/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 9

    Menus, telas e integração final
====================================================*/



//=========================================
// CARREGAMENTO DO JOGO
//=========================================


function loadingGame(){



    let loader =
    document.getElementById(
        "gameLoader"
    );



    let bar =
    document.getElementById(
        "loadingProgress"
    );



    let text =
    document.getElementById(
        "loadingText"
    );



    let progress=0;



    let interval =
    setInterval(()=>{



        progress+=5;



        if(bar)

            bar.style.width=
            progress+"%";




        if(text){


            if(progress<40)

                text.innerHTML=
                "Carregando cidade...";


            else if(progress<70)

                text.innerHTML=
                "Preparando cuias...";


            else if(progress<100)

                text.innerHTML=
                "Misturando a erva...";


            else

                text.innerHTML=
                "Pronto!";



        }




        if(progress>=100){



            clearInterval(interval);



            setTimeout(()=>{


                if(loader)

                    loader.style.display=
                    "none";



            },1000);



        }



    },100);




}







window.addEventListener(
"load",
loadingGame
);









//=========================================
// MENU PRINCIPAL
//=========================================



function openMenu(){



    let menu =
    document.getElementById(
        "menu"
    );



    if(menu)

        menu.style.display=
        "flex";



}









//=========================================
// SELEÇÃO DE FASE
//=========================================


const levelButtons =
document.querySelectorAll(
".levelButton"
);



levelButtons.forEach(
button=>{


    button.onclick=()=>{


        let level =
        Number(
        button.dataset.level
        );



        loadLevel(level);



        game.running=true;



        document.getElementById(
        "levelSelect"
        ).style.display=
        "none";



    };


});









//=========================================
// ABRIR SELEÇÃO
//=========================================


const selectLevelButton =
document.getElementById(
"selectLevelButton"
);



if(selectLevelButton){



selectLevelButton.onclick=()=>{


    document.getElementById(
    "menu"
    ).style.display=
    "none";



    document.getElementById(
    "levelSelect"
    ).style.display=
    "flex";



};


}








//=========================================
// CONFIGURAÇÕES
//=========================================


const settingsButton =
document.getElementById(
"settingsButton"
);



if(settingsButton){


settingsButton.onclick=()=>{


    document.getElementById(
    "settingsScreen"
    ).style.display=
    "flex";


};



}








const closeSettings =
document.getElementById(
"closeSettings"
);



if(closeSettings){


closeSettings.onclick=()=>{


    document.getElementById(
    "settingsScreen"
    ).style.display=
    "none";


};


}








//=========================================
// CRÉDITOS
//=========================================


const creditsButton =
document.getElementById(
"creditsButton"
);



if(creditsButton){



creditsButton.onclick=()=>{


    document.getElementById(
    "creditsScreen"
    ).style.display=
    "flex";



};



}







const closeCredits =
document.getElementById(
"closeCredits"
);



if(closeCredits){



closeCredits.onclick=()=>{


    document.getElementById(
    "creditsScreen"
    ).style.display=
    "none";



};



}








//=========================================
// CONQUISTAS
//=========================================


const achievements=[];



function unlockAchievement(name){



    if(
    achievements.includes(name)
    )

        return;




    achievements.push(name);



    localStorage.setItem(

        "cuiaAchievements",

        JSON.stringify(
        achievements
        )

    );




    showNotification(

    "🏆 Conquista desbloqueada: "

    +

    name

    );



}








function loadAchievements(){



    let saved =
    localStorage.getItem(
    "cuiaAchievements"
    );



    if(saved){


        achievements.push(
        ...JSON.parse(saved)
        );


    }



}









//=========================================
// VERIFICAR CONQUISTAS
//=========================================


function checkAchievements(){



    if(
    game.objectsEaten>=1
    )


        unlockAchievement(
        "Primeira Gota"
        );





    if(
    game.objectsEaten>=100
    )


        unlockAchievement(
        "Mestre da Erva"
        );





    if(
    player.radius>=900
    )


        unlockAchievement(
        "Cuia Gigante"
        );



}









//=========================================
// BOTÃO DE RANKING
//=========================================


const rankingButton =
document.getElementById(
"rankingButton"
);



if(rankingButton){



rankingButton.onclick=()=>{


    updateRanking();



    document.getElementById(
    "rankingScreen"
    ).style.display=
    "flex";



};



}









const closeRanking =
document.getElementById(
"closeRanking"
);



if(closeRanking){



closeRanking.onclick=()=>{


    document.getElementById(
    "rankingScreen"
    ).style.display=
    "none";



};



}








//=========================================
// LOOP DE CONQUISTAS
//=========================================


const oldUpdate6 =
update;



update=function(){



    oldUpdate6();



    checkAchievements();



};







// carregar conquistas


loadAchievements();


/*====================================================
    CUIA.IO
    SCRIPT.JS
    PARTE 10 - FINAL

    Otimização e acabamento
====================================================*/



//=========================================
// CONTROLE DE FPS
//=========================================


let fps=0;

let frames=0;

let lastFPS=Date.now();





function calculateFPS(){



    frames++;



    if(
    Date.now()-lastFPS>=1000
    ){



        fps=frames;



        frames=0;



        lastFPS=
        Date.now();



    }



}





//=========================================
// QUALIDADE GRÁFICA
//=========================================


let graphics="high";



const quality =
document.getElementById(
"graphicsQuality"
);



if(quality){



quality.onchange=()=>{


    graphics =
    quality.value;



    applyGraphics();



};



}








function applyGraphics(){



    if(
    graphics==="low"
    ){



        city.cars.length=10;

        city.people.length=20;



    }





    if(
    graphics==="medium"
    ){



        city.cars.length=25;

        city.people.length=50;



    }







    if(
    graphics==="high"
    ){



        createCars();

        createPeople();



    }



}









//=========================================
// LIMPEZA DE OBJETOS
//=========================================


function cleanObjects(){



    for(
        let i=
        objects.length-1;

        i>=0;

        i--
    ){



        if(
        objects[i].eaten
        ){


            objects.splice(
            i,
            1
            );


        }



    }



}








//=========================================
// OTIMIZAÇÃO AUTOMÁTICA
//=========================================


setInterval(()=>{


    cleanObjects();



},10000);









//=========================================
// DETECÇÃO DE DISPOSITIVO
//=========================================


const mobile =
/Android|iPhone|iPad/i
.test(
navigator.userAgent
);



if(mobile){



    player.speed=4;



}







//=========================================
// SISTEMA DE SOM AMBIENTE
//=========================================


function startMusic(){



    if(!soundEnabled)

        return;



    let music =
    document.getElementById(
    "music"
    );



    if(music){


        music.volume=.3;


        music.play()
        .catch(()=>{});



    }



}









//=========================================
// SALVAMENTO FINAL
//=========================================


window.addEventListener(
"beforeunload",
()=>{


    saveGame();



});








//=========================================
// TELA FINAL
//=========================================


function finalVictory(){



    game.running=false;



    let final =
    document.getElementById(
    "finalScreen"
    );



    if(final){



        final.style.display=
        "flex";



    }



    showFinalStats();



}









//=========================================
// ATUALIZAÇÃO FINAL
//=========================================


const finalUpdate =
update;



update=function(){



    finalUpdate();



    calculateFPS();



};









//=========================================
// MOSTRAR FPS (DEBUG)
//=========================================


let showFPS=false;



function debugFPS(){



    if(!showFPS)

        return;



    ctx.fillStyle="white";

    ctx.font="16px Arial";


    ctx.fillText(

    "FPS: "+fps,

    20,

    20

    );



}









const finalDraw =
draw;



draw=function(){



    finalDraw();



    debugFPS();



};









//=========================================
// INICIALIZAÇÃO FINAL
//=========================================


function initGame(){



    createCity();


    createCars();


    createPeople();



    loadAchievements();


    updateHUD();



}





initGame();





console.log(

`
🧉 CUIA.IO iniciado!

Controles:
WASD / Setas = mover
Mouse = direcionar
Celular = joystick

Objetivo:
Crescer a cuia até engolir
o prédio gigante e transformá-lo
na bomba final do chimarrão.

Boa partida!
`

);
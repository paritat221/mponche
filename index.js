// ==UserScript==
// @name         MpOnche
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://onche.org/*
// @require      https://cdn.socket.io/socket.io-3.0.1.min.js
// @require      file:///C:\Users\tera\Documents\mponche\index.js
// @icon         https://onche.org/icons/ms-icon-144x144.png
// @grant        GM_addStyle
// ==/UserScript==

let messages = [];
let pseudo;
(async function (){
    let msg = c = await fetch(`http://localhost/getmsg`, {method: 'POST', headers: {'Content-Type': 'application/json',}, body:JSON.stringify({ftc:await get_user()})},);
    let msgs = await msg.text();
    messages = JSON.parse(msgs);

    let j = await fetch(`http://localhost/getpseudo`, {method: 'POST', headers: {'Content-Type': 'application/json',}, body:JSON.stringify({ftc:await get_user()})},);
    g = await j.text();
    pseudo = JSON.parse(await g);
})();

var socket = io('http://localhost');

async function send_message(rec, content){
    fetch(`http://localhost/sendmsg?dest=${rec}&content=${content}`, {method: 'POST', headers: {'Content-Type': 'application/json',}, body:JSON.stringify({ftc:await get_user()})},);
    socket.emit('sent', pseudo, content, rec);
}

async function get_user(){
    let f = await fetch("https://onche.org/topic/14714/glados-viens-la");
    let g = await f.text();
	return await g;
}

async function get_users(){
    let f = await fetch("http://localhost/getusr?", {method: 'POST', headers: {'Content-Type': 'application/json',}, body:JSON.stringify({ftc:await get_user()})},);
    let g = await f.text();
    return JSON.parse(g);
}

async function get_avatar(pseudo){
    let f = await fetch("https://onche.org/profil/" + pseudo);
    let g = await f.text();
    let r = new RegExp(`<img src="(.*?)" alt="${pseudo}">`, "g");
    let l = g.match(r);

    return l[0].split("\"")[1];
}

function truncate(str, n=20){
    return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
};

async function tooltip_load(pseudal){
    let msg = c = await fetch(`http://localhost/getmsg`, {method: 'POST', headers: {'Content-Type': 'application/json',}, body:JSON.stringify({ftc:await get_user()})},);
    let msgs = await msg.text();
    messages = JSON.parse(msgs);
    wind = pseudal;
    let tooltip = document.querySelector("#tooltip");
    tooltip.setAttribute("style", `display: flex; width: 380px; left: 0px; top: 54.8px; height: 230px; padding-bottom: 30px;`);
    tooltip.innerHTML = "";    
    tooltip.innerHTML += `<div class="content" id="mp"><div class="list big"></div></div>`;
    let listbig = document.querySelector(".list");
    const user = pseudo;
    const userav = await get_avatar(user);
    const destav = await get_avatar(pseudal);
    for (message of messages){
        const author = message.id.split("{{}}")[0];
        const rec = message.id.split("{{}}")[1];
        const content = message.message;

        if(user == rec || user == author){
            const avatar = user == author ? userav : destav;
            if(author == pseudal || rec == pseudal)
                document.querySelector(".list").insertAdjacentHTML('beforeend',`<div class="item clickable"><img class="avatar" src="${avatar}"><span><div>${content}</div></span></div></div>`);            
        }
    }
    tooltip.innerHTML += `<input class="input" id="mpmsg" type="text" name="title" maxlength="128" placeholder="Écrire à ${pseudo}..." autocomplete="off">`;
    GM_addStyle("#mpmsg{ position: absolute;bottom: 0px; border-bottom-left-radius : 0; border-radius: 0}");
    scrollDown();
    let mpmsg = document.getElementById("mpmsg");
    mpmsg.addEventListener("keyup", async function(event) {
        if (event.key == 'Enter') {
            if(mpmsg.value.length < 1) return;
            send_message(pseudal, mpmsg.value)
            const avatar = userav;
            document.querySelector(".list").insertAdjacentHTML('beforeend',`<div class="item clickable">
                    <img class="avatar" src="${avatar}">
                    <span><div>${mpmsg.value}</div>
                    </span>
                    </div></div>`);
            mpmsg.value = "";
            scrollDown();
        }
    });
}

let wind = 0;

function scrollDown(){
    c = document.getElementById("tooltip").children[0];
    c.scrollTo(0, c.scrollHeight);
}

async function init_tooltip(){
    let tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = "";
    tooltip.innerHTML += `<div class="content" id="mp"><div class="list big"></div></div><input class="input" id="mpusr" type="text" name="title" maxlength="128" placeholder="Pseudal" autocomplete="off">`;
    GM_addStyle("#mpusr{ position: absolute;bottom: 0px; border-bottom-left-radius : 0; border-radius: 0}")

    let listbig = document.querySelector(".list");
    let users = await get_users();
    for (user of users){
        const avatar = await get_avatar(user);
        listbig.insertAdjacentHTML('beforeend',`<div class="item clickable mp"><img class="avatar" src="${avatar}"><span><div><b>${user}</b></div></span></div></div>`);
    }
    scrollDown();
    let mpusr = document.getElementById("mpusr");

    mpusr.addEventListener("keyup", async function(event) {
        if (event.key == 'Enter') {
            const avatar = await get_avatar(mpusr.value);
            if(avatar.length > 1){
                tooltip_load(mpusr.value);
            }
        }
    });

    document.querySelectorAll('.mp').forEach(mp => {
        mp.addEventListener('click', e => {
            element = e.currentTarget;
            const pseudo = element.innerHTML.match(/<b>(.*)<\/b>/g)[0].split(/<\/b>/)[0].slice(3);
            tooltip_load(pseudo);
        })
    });
}

async function handle_click(){
    let tooltip = document.querySelector("#tooltip");
    let arrow = document.querySelector("#arrow");
    if(tooltip.style.display == "flex"){
        tooltip.setAttribute("style", `display: none; width: 420px; left: 0px; top: 54.8px; height: 200px;`);
        arrow.setAttribute("style",`left: 135.6px; top: 48.3px; display: none;`)
        tooltip.innerHTML = "";
        wind = 0;
    }
    else{
        tooltip.setAttribute("style", `display: flex; width: 420px; left: 0px; top: 54.8px; height: 200px;`);
        arrow.setAttribute("style",`left: 135.6px; top: 48.3px; display: block;`);
        fetch(`http://localhost/disnotify`, {method: 'POST', headers: {'Content-Type': 'application/json',}, body:JSON.stringify({ftc:await get_user()})},);
        document.getElementById("messages-button").setAttribute("class", "item");
        init_tooltip();
    }
    return;
}


socket.on("received", async (data)=>{
    const author = data.user;
    const content = data.content;
    const to = data.to;
    
    if(data.to==pseudo){
        if(wind == author){
            const avatar = await get_avatar(author);
            document.querySelector(".list").insertAdjacentHTML('beforeend',`<div class="item clickable">
                        <img class="avatar" src="${avatar}">
                        <span><div>${content}</div>
                        </span>
                        </div></div>`);
            scrollDown();
        }else{
            document.getElementById("messages-button").setAttribute("class", "item new");
            fetch(`http://localhost/notify`, {method: 'POST', headers: {'Content-Type': 'application/json',}, body:JSON.stringify({ftc:await get_user()})},);
        }
    }
})

async function main(){
    if(pseudo == "Invité")
        return;
    
    let left = document.querySelector(".left");
    let mp = document.createElement("div");
    mp.className = "item";
    mp.id = "messages-button";
    mp.innerHTML = `<div class="mdi mdi-email"></div>`;
    left.appendChild(mp);
    mp.addEventListener("click", handle_click);
    GM_addStyle(`header .item.new .mdi-email:after {
        background-color: #ff3b30;
        border: 2px solid #2f374a;
        border-radius: 50%;
        content: "";
        height: 7px;
        margin-left: -7px;
        margin-top: 1px;
        position: absolute;
        width: 7px;
    }`);

    let g = await fetch('http://localhost/notif', {method: 'POST', headers: {'Content-Type': 'application/json',}, body:JSON.stringify({ftc:await get_user()})},);
    let r = await g.text();
    let j = JSON.parse(await r);
    if(j[pseudo])
        document.getElementById("messages-button").setAttribute("class", "item new");
}

// window.addEventListener('click', function(e){   
//     const tooltip = document.getElementById("tooltip");
//     const btn = document.getElementById('messages-button');
//     if (!btn.contains(e.target) && !e.target.classList.contains("mp")){
//         if(tooltip.style.display == "flex"){
//             tooltip.setAttribute("style", `display: none; width: 420px; left: 0px; top: 54.8px; height: 200px;`);
//             arrow.setAttribute("style",`left: 135.6px; top: 48.3px; display: none;`)
//             tooltip.innerHTML = "";
//             wind = 0;
//         }
//     } 
// });

main();

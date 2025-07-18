//WEB PROJECT A JS CODE

let tar='';                         //target word
let gameready=false;
let over=false;
let current='';
let entered=[];         //guessed words
const enter_button=document.querySelector('[data-key="Enter"]');
const GCont=document.querySelector('.guesshistory');
const keyboardElement=document.querySelector('.keyboard');
function disabled(){
    document.removeEventListener('keydown',keydownHandler);
    keyboardElement.removeEventListener('click', clickHandler);
}
function enabled(){
    document.addEventListener('keydown', keydownHandler );
    keyboardElement.addEventListener('click',clickHandler);
}
function keydownHandler(e){
    if(e.key==='Backspace'){
        handleback();
    }
    else if(/^[a-zA-Z]$/.test(e.key)){
        handleletterip(e.key);
    }else if(e.key==='Enter'){
    handleenter();
    }
}
function clickHandler(e){                       //handling the keyboard on screen
    if(e.target.classList.contains('keys')||e.target.classList.contains('widekeys')){
        const key=e.target.dataset.key;
        console.log("button clicked",key);
        if(/^[A-Z]$/.test(key)){
            handleletterip(key);
            }else if(key==='Back'){
            handleback();
            }else if(key==='Enter'){
            handleenter();
            }
    }
}
function newgame(){                     //asking user for a new game
    const newgame=confirm('new game??');
    if(newgame){
        reset();
    }else{
        over=true;
        disabled();
    }
}
function reset(){                           //resetting the game
    localStorage.removeItem('wordlestate');
    current='';
    tar='';
    entered=[];
    gameready=false;
    over=false;
    GCont.innerHTML='';
    document.querySelectorAll('.keys').forEach(key=>{
        key.style.backgroundColor='white';
    });
    const boxes=Array.from(document.querySelector('.current').children);
    boxes.forEach(box=>{
        box.textContent='';
        box.classList.remove('filled');
    });
    init();
    enabled();
}
async function init(){                              //intialisation of the game and fetching the word from the provided API
    enter_button.disabled=true;
    enter_button.classList.add('disabled');
    try {
        const response = await fetch('https://words.trex-sandwich.com?count=1&length=6');
        const data = await response.json();
        if (data && data.length > 0) {
            tar = data[0].toUpperCase();
            console.log('the word should be: ', tar);
            const valid = await validate(tar);
                gameready = true;
                enter_button.disabled = false;
                enter_button.classList.remove('disabled');
                console.log('Target Word is ', tar);

        }else{
        alert('problem with api');
    }
    }catch(error){
        console.error('Error in getting the target word', error);
        alert('api error');
    }
}

document.addEventListener('DOMContentLoaded',async ()=>{
    const prev=load();
    if(!prev){
        await init();
    }
    enabled();
    document.querySelector('[data-key="NewGame"]').addEventListener('click',newgame)
    document.addEventListener('keydown',(e)=>{
        if(e.key==='Escape'){
            newgame();
        }
    });
});
function handleletterip(letter){
    if(!gameready||current.length>=6)return;
    current+=letter.toUpperCase();
    updatecurrent();
    save();
}
function save(){                                    //game saves to local storage
    const state={
        tar,
        gameready,
        over,
        current,
        entered,

    };
    localStorage.setItem('wordlestate', JSON.stringify(state));
}
function load(){                        //game loads from the local storage
    const j=localStorage.getItem('wordlestate');
    if(!j){
        return false;
    }
    try{
        const state = JSON.parse(j);
        tar=state.tar;
        gameready=state.gameready;
        over=state.over;
        current=state.current;
        entered=state.entered;
        entered.forEach(guess=>guessdisplay(guess));
        updatecurrent();
        updatekeyboard();
        return true;
    }catch(e){
        console.error('not able to parse the saved games state', e);
        return false;
    }
}
function handleback(){                          //removes the last typed alphabet
    if(!gameready||current.length===0)return;
    current=current.slice(0,-1);
    updatecurrent();
    save();
}
function updatecurrent(){
    const boxes=Array.from(document.querySelector('.current').children);
    boxes.forEach(box=>{
        box.textContent='';
        box.classList.remove('filled');
    });
    for(let i=0;i<current.length;i++){
        boxes[i].textContent=current[i];
        boxes[i].classList.add('filled');
    }
    enter_button.disabled=current.length!==6;
    enter_button.classList.toggle('disabled',current.length!==6);
}
async function handleenter(){
    if(!gameready||current.length!==6)return;
    enter_button.disabled=true;
    try{
        const valid=await validate(current);
        if(!valid){
            const curr=document.querySelector('.current');
            curr.classList.add('invalid');
            setTimeout(()=>{
            curr.classList.remove('invalid');
            enter_button.disabled=false;
        },500);
            return;
    }
        processvalid(current);
}catch(e){
    console.error('error in validation', e);
    enter_button.disabled=false;}
}
async function validate(word){                      //validating the word fetched from the API
    if(word.toUpperCase()===tar.toUpperCase()){
        return true;
    }
  if(word.length!==6){
      return false;
  }
  try{
      const response=await fetch(`https://words.trex-sandwich.com/${word.toLowerCase()}`);
      if(!response.ok){
          throw new Error('api error');
      }
      const data = await response.json();
      return data?.valid||false;
  }catch(error){
      console.error('error in validation', error);
      return word.length===6;
  }
}
function processvalid(guess){
    entered.push(guess);
    console.log('valid guesses:',guess);
    console.log('target word:',tar);
    console.log('guess = target',guess===tar);
    console.log('all guesses: ',entered);
    guessdisplay(guess);
    current='';
    updatecurrent();
    updatekeyboard();
    save();
    enter_button.disabled=false;
    if(guess===tar) {
        alert('You WON!!....');
        setTimeout(() => {
            newgame();
        }, 500);
    }
}
function guessdisplay(guess){                           //adds colors for the guesses
    const guessRow=document.createElement('div');
    guessRow.classList.add('guess-row');
    for(let i=0;i<guess.length;i++){
        const letter=document.createElement('div');
        letter.classList.add('letter');
        letter.textContent=guess[i];
        const stat=getletterstat(guess[i],i);
        letter.style.backgroundColor=stat.color;
        guessRow.appendChild(letter);
    }
    GCont.appendChild(guessRow);
}

function getletterstat(letter,posn){
    if(letter===tar[posn]){
        return{color:'green'};
    }else if(tar.includes(letter)){
        return{color:'yellow'};
    }else{
        return{color:'gray'};
    }
}
function updatekeyboard(){
    const keys=Array.from(document.querySelectorAll('.keys'));
    keys.forEach(key=>{
        const letter=key.dataset.key;
        const stat=getkeystat(letter);
        key.style.backgroundColor=stat.color;
    });
}
function getkeystat(key) {
    let order = {
        'green': 3,
        'red': 2,
        'gray': 1,
        'white': 0
    };
    let c = 'white';
    entered.forEach(guess => {
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === key) {
                const stat = getletterstat(guess[i], i);
                if (order[stat.color] > order[c]) {
                    c = stat.color;
                }
            }
        }
    });
    return {color: c};
}
document.addEventListener("keydown",(event)=>{
    let keys=event.key.toUpperCase();
    let onscreenKeys=null;
    if(keys==='ENTER'){
        onscreenKeys=document.querySelector('[data-key=Enter]');
        keys='Enter';
    }else if(keys==='ESCAPE'){
        onscreenKeys=document.querySelector('[data-key=NewGame]');
        keys='NewGame';
    }else if(keys==='BACKSPACE'){
        onscreenKeys=document.querySelector('[data-key=Back]');
        keys='Back';
    }else if(/^[A-Z]$/.test(keys)){
      onscreenKeys=document.querySelector(`[data-key="${keys}"]`);
    }
    if(onscreenKeys||keys==='Enter'||keys==='NewGame'||keys==='Back'){
        if(onscreenKeys){
            onscreenKeys.classList.add('active');
            setTimeout(()=>{
                onscreenKeys.classList.remove('active');
            },100);
        }
        handleKeyPress(keys,onscreenKeys);
    }
});
function handleKeyPress(keys,element) {
    console.log(`keys: ${keys}`);
    if (element) {
        element.classList.add('active');
        setTimeout(() => {
            element.classList.remove('active');
        }, 100);
    }
    if(keys==='Enter'){
        handleenter();
    }

}
console.log('lets write js');
let currentSong= new Audio()
let isListenerAdded = false;

function formatTime(seconds) {
    // Convert to integer to ignore fractional part
    seconds = Math.floor(seconds);
    
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    
    // Add leading zero to seconds if less than 10
    if (remainingSeconds < 10) {
        remainingSeconds = '0' + remainingSeconds;
    }

    return `${minutes}:${remainingSeconds}`;
}



async function getSongs() {

    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/" )[1])
        }

    }
    return songs
}
const playMusic=(track)=>{
    // let audi o = new Audio("/songs/"+ track)
    currentSong.src= "/songs/"+ track
    currentSong.play()
    // play.src ="pause.png"
    play.src = "pause.svg" ;
    document.querySelector(".songinfo").innerHTML= track
    document.querySelector(".songTime").innerHTML="00:00 / 00:00"
}
async function main() {
    
    let songs = await getSongs()
    console.log(songs);

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li> <div class="musicLibIcon">
                                <img class="invert" src="pngs/vinyl.png" alt="">
                            </div>
                            
                            <div class="songInfo">
                                <div class="songName">${song.replaceAll("%20"," ")} </div>
                                
                            </div>
                            <div class="playNow">
                                <img src="pngs/play.png" alt="">
                            </div>
        </li>`;
    }
    let audio = new Audio(songs[0]);
    // audio.play();
    

    audio.addEventListener("loaded", ()=>{
        console.log(audio.duration, audio.currentSrc,audio.currentTime);
        
    })
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=> {
        e.addEventListener("click", element =>{
            console.log(e.querySelector(".songInfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML.trim())
            
        })
        
    });
    // attach a eventlisterner to play and pause 
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.img.src="pause.svg";
            console.log('music is playing');
        }
        else{
            currentSong.pause()
            play.img.src = "play.svg";
            console.log('music is not playing');
            

        }
    })
    // lister for the time
    currentSong.addEventListener("timeupdate",()=>{
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songTime").innerHTML=`${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 98 + "%";
    })

    // add an addEventListener for seek bar
    document.querySelector(".audioseek").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left= percent +"%"
        currentSong.currentTime=((currentSong.duration)*percent)/100
    })

    // adding a addEventListener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".right").style.left= "0" +"%"
    })
    // adding a addEventListener for closing a hamburger
    document.querySelector(".cross").addEventListener("click",()=>{
        document.querySelector(".right").style.left= "-100%"
    })
    
}
main()

  



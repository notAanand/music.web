
let currentSong = new Audio()
let isListenerAdded = false;
let songs;
let currFolder;

function displaySongName(song) {
    // Replace %20 with space
    const formattedSongName = song.replaceAll("%20", " ");
    document.querySelector(".songinfo").innerText = formattedSongName;
}



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



async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1])
        }
    }



    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li> <div class="musicLibIcon">
                                <img class="invert" src="pngs/vinyl.png" alt="">
                            </div>
                            
                            <div class="songInfo">
                                <div class="songName">${song.replaceAll("%20", " ")} </div>
                                
                            </div>
                            <div class="playNow">
                                <img src="pngs/play.png" alt="">
                            </div>
        </li>`;
    }
    // let audio = new Audio(songs[0]);

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".songInfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML.trim())

        })

    })
    return songs
}
const playMusic = (track) => {
    currentSong.src = encodeURI(`${currFolder}${track}`);
    currentSong.play()
    play.src = "img/pause.svg";
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"


}
async function displayAlbum() {

    let a = await fetch(`/songs/`);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // console.log(e);



        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            // console.log(folder);

            // get the mata data of the folder 
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json()
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card">
                        <div class="play">
                            <img src="pngs/play.png" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`

        }
        // load the playlist when ever the card is touched 
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener('click', async item => {

                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        })
    }
}

async function main() {
    await getSongs("songs/bikhra")//

    // .log(songs);

    displayAlbum()

    // attach a eventlisterner to play and pause 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            console.log('music is playing');
        }
        else {
            currentSong.pause()
            console.log('music is not playing');
        }
    })
    // attach a eventlisterner to play and pause 
    document.querySelector("#play>img").addEventListener("click", e => {
        if (e.target.src.includes("img/pause.svg")) {
            e.target.src = e.target.src.replaceAll("img/pause.svg", "img/play.svg")
        }
        else {
            e.target.src = e.target.src.replaceAll("img/play.svg", "img/pause.svg")
        }

    })

    // adding a addEventListener for  next button
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("Next song clicked");
        let index = songs.findIndex(song => currentSong.src.endsWith(song.trim()));
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
            displaySongName(songs[index + 1]);
        }
    });

    // adding a addEventListener for previous 
    prev.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous song clicked");
        let index = songs.findIndex(song => currentSong.src.endsWith(song.trim()));
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
            displaySongName(songs[index - 1]);
        }
    });

    // lister for the time
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 98 + "%";
        ;
    })

    // add an addEventListener for seek bar
    document.querySelector(".audioseek").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    // color changing of the seek


    // adding a addEventListener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".right").style.left = "0" + "%"
    })
    // adding a addEventListener for closing a hamburger
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".right").style.left = "-100%"
    })


}
main()





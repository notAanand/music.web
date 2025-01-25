let currentSong = new Audio();
let songs = [];
let currFolder = "";

function displaySongName(song) {
    const formattedSongName = decodeURIComponent(song).replaceAll("%20", " ");
    document.querySelector(".songinfo").innerText = formattedSongName;
}

function formatTime(seconds) {
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }
    return `${minutes}:${remainingSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder.endsWith("/") ? folder : folder + "/";
    console.log("Fetching folder:", currFolder);

    try {
        const response = await fetch(currFolder);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const htmlText = await response.text();

        const div = document.createElement("div");
        div.innerHTML = htmlText;

        const links = div.getElementsByTagName("a");
        songs = Array.from(links)
            .filter(link => link.href.endsWith(".mp3"))
            .map(link => link.href.split(`${folder}/`).pop());

        console.log("Songs fetched:", songs);

        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        songs.forEach(song => {
            const songName = decodeURIComponent(song).replaceAll("%20", " ");
            songUL.innerHTML += `
                <li>
                    <div class="musicLibIcon">
                        <img class="invert" src="pngs/vinyl.png" alt="">
                    </div>
                    <div class="songInfo">
                        <div class="songName">${songName}</div>
                    </div>
                    <div class="playNow">
                        <img src="pngs/play.png" alt="">
                    </div>
                </li>`;
        });

        Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", () => {
                console.log(`Playing song: ${songs[index]}`);
                playMusic(songs[index]);
            });
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

function playMusic(track) {
    if (!track) {
        console.error("No track provided");
        return;
    }

    const fullPath = `${currFolder}${track.trim()}`;
    console.log("Playing track path:", fullPath);

    currentSong.src = fullPath;
    currentSong
        .play()
        .then(() => {
            console.log("Now playing:", currentSong.src);
            displaySongName(track);
            document.querySelector(".songTime").innerText = "00:00 / 00:00";
            document.querySelector("#play img").src = "./img/pause.svg";
        })
        .catch(error => console.error("Error playing song:", error));
}

async function displayAlbum() {
    console.log("Fetching album data...");

    try {
        const response = await fetch(`/songs/`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const htmlText = await response.text();

        const div = document.createElement("div");
        div.innerHTML = htmlText;

        const links = div.getElementsByTagName("a");
        const cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let link of links) {
            if (link.href.includes("/songs") && !link.href.includes(".htaccess")) {
                const folder = link.href.split("/").slice(-2)[0];
                console.log(`Processing folder: ${folder}`);

                try {
                    const metadataResponse = await fetch(`/songs/${folder}/info.json`);
                    if (!metadataResponse.ok) throw new Error(`HTTP Error: ${metadataResponse.status}`);
                    const metadata = await metadataResponse.json();

                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <img src="pngs/play.png" alt="">
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <h3>${metadata.title}</h3>
                            <p>${metadata.description}</p>
                        </div>`;
                } catch (metaError) {
                    console.warn(`No metadata found for folder: ${folder}`, metaError);
                }
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async () => {
                const folder = card.dataset.folder;
                console.log(`Card clicked: Loading folder - ${folder}`);
                songs = await getSongs(`songs/${folder}`);
                if (songs.length > 0) {
                    playMusic(songs[0]);
                } else {
                    console.error("No songs found in folder:", folder);
                }
            });
        });
    } catch (error) {
        console.error("Error displaying album:", error);
    }
}

async function main() {
    console.log("Initializing app...");

    await getSongs("songs/karan_aujla");
    if (songs.length > 0) playMusic(songs[0]);

    await displayAlbum();

    document.querySelector("#play img").addEventListener("click", e => {
        if (currentSong.paused) {
            currentSong.play();
            e.target.src = "./img/pause.svg";
        } else {
            currentSong.pause();
            e.target.src = "./img/play.svg";
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        const index = songs.findIndex(song =>
            currentSong.src.endsWith(song.trim())
        );
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector("#prev").addEventListener("click", () => {
        const index = songs.findIndex(song =>
            currentSong.src.endsWith(song.trim())
        );
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        const timeDisplay = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".songTime").innerText = timeDisplay;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 98 + "%";
    });

    document.querySelector(".audioseek").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.offsetWidth) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".right").style.left = "0%";
    });

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".right").style.left = "-100%";
    });
}

main();
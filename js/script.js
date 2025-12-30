/* =========================
   GLOBALS
========================= */

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = 0;

/* =========================
   HELPERS
========================= */

function displaySongName(song) {
    document.querySelector(".songinfo").innerText =
        decodeURIComponent(song).replaceAll("%20", " ");
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    seconds = Math.floor(seconds);
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
}

/* =========================
   LOAD SONGS (JSON)
========================= */

async function getSongs(folder) {
    currFolder = folder.endsWith("/") ? folder : folder + "/";
    console.log("Loading songs from:", currFolder);

    try {
        const res = await fetch(`${currFolder}songs.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("songs.json must be an array");

        songs = data.map(song => song.file);

        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";

        data.forEach((song, index) => {
            songUL.innerHTML += `
                <li data-index="${index}">
                    <div class="musicLibIcon">
                        <img class="invert" src="pngs/vinyl.png">
                    </div>
                    <div class="songInfo">
                        <div class="songName">${song.title}</div>
                    </div>
                    <div class="playNow">
                        <img src="pngs/play.png">
                    </div>
                </li>
            `;
        });

        Array.from(songUL.children).forEach(li => {
            li.addEventListener("click", () => {
                playMusic(songs[li.dataset.index], Number(li.dataset.index));
            });
        });

        return songs;
    } catch (err) {
        console.error("Error loading songs:", err);
        songs = [];
        return [];
    }
}

/* =========================
   PLAYER
========================= */

function playMusic(track, index) {
    if (!track) return;

    currentIndex = index;
    const songPath = currFolder + track;

    console.log("Playing:", songPath);

    currentSong.src = songPath;

    currentSong.play()
        .then(() => {
            document.querySelector("#play img").src = "./img/pause.svg";
        })
        .catch(err => {
            console.warn("Playback blocked:", err);
        });

    displaySongName(track);
}

/* =========================
   LOAD ALBUMS
========================= */

async function displayAlbum() {
    try {
        const res = await fetch("songs/albums.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const albums = await res.json();
        const cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let album of albums) {
            const metaRes = await fetch(`songs/${album.folder}/info.json`);
            if (!metaRes.ok) continue;

            const meta = await metaRes.json();

            cardContainer.innerHTML += `
                <div class="card" data-folder="${album.folder}">
                    <div class="play">
                        <img src="pngs/play.png">
                    </div>
                    <img src="songs/${album.folder}/cover.jpg">
                    <h3>${meta.title}</h3>
                    <p>${meta.description}</p>
                </div>
            `;
        }

        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async () => {
                const folder = card.dataset.folder;

                await getSongs(`songs/${folder}`);

                if (songs.length > 0) {
                    playMusic(songs[0], 0); // 🔥 autoplay first song
                }
            });
        });
    } catch (err) {
        console.error("Album load error:", err);
    }
}

/* =========================
   MAIN
========================= */

async function main() {
    console.log("App initialized");

    await getSongs("songs/karan_aujla");
    await displayAlbum();

    /* ---- PLAY / PAUSE ---- */
    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play img").src = "./img/pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play img").src = "./img/play.svg";
        }
    });

    /* ---- NEXT ---- */
    document.querySelector("#next").addEventListener("click", () => {
        if (currentIndex + 1 < songs.length) {
            playMusic(songs[currentIndex + 1], currentIndex + 1);
        }
    });

    /* ---- PREVIOUS ---- */
    document.querySelector("#prev").addEventListener("click", () => {
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1], currentIndex - 1);
        }
    });

    /* ---- AUTO PLAY NEXT SONG ---- */
    currentSong.addEventListener("ended", () => {
        if (currentIndex + 1 < songs.length) {
            playMusic(songs[currentIndex + 1], currentIndex + 1);
        }
    });

    /* ---- TIME UPDATE ---- */
    currentSong.addEventListener("timeupdate", () => {
        if (isNaN(currentSong.duration)) return;

        document.querySelector(".songTime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 98 + "%";
    });

    /* ---- SEEK BAR ---- */
    document.querySelector(".audioseek").addEventListener("click", e => {
        if (isNaN(currentSong.duration)) return;

        const percent = e.offsetX / e.target.offsetWidth;
        currentSong.currentTime = currentSong.duration * percent;
    });

    /* ---- MOBILE MENU ---- */
    document.querySelector(".hamburger").onclick =
        () => document.querySelector(".right").style.left = "0%";

    document.querySelector(".cross").onclick =
        () => document.querySelector(".right").style.left = "-100%";
}

main();

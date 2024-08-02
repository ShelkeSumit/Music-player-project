// Initialize variables
let currentSong = new Audio();
let songs;
let currfolder;
let isShuffleMode = false; // Variable to track shuffle mode

// Display a message in the console
console.log("Let's write some JavaScript");

// Function to convert seconds to minutes and seconds format
function secondToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Asynchronously fetch songs from a specified folder
async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${currfolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1]);
        }
    }

    // Extract artist name from the folder name
    let artistName = currfolder.split('songs/')[1];

    // Show all the songs in the playlists
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = " ";
    for (const song of songs) {
        songUl.innerHTML += `<li> <img class="invert" width="34" src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>${artistName}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
        </div> </li>`;
    }

    // Add click event listeners to play songs
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const playNowButton = e.querySelector(".playnow img");
            const isPaused = currentSong.paused;
            const isSameSong = decodeURI(e.querySelector(".info").firstElementChild.innerHTML.trim()) === decodeURI(document.querySelector(".songinfo").innerHTML);

            // Reset all play SVGs to play icon if the clicked song is different from the current one
            if (!isSameSong) {
                document.querySelectorAll(".songslist .playnow img").forEach(svg => {
                    svg.src = "img/play.svg";
                });
            }

            // Toggle the play/pause icon for the clicked song
            if (isPaused && isSameSong) {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
                playNowButton.src = "img/pause.svg";
            } else {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim(), true);
                playNowButton.src = "img/play.svg";
            }
        });
    });
}

// Function to play or pause a song
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        currentSong.pause();
        play.src = "img/play.svg";
    }

    // Update song information and play/pause SVG icons in the song list
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((item, index) => {
        const isSameSong = currentSong.src.includes(songs[index]);
        item.querySelector(".playnow img").src = isSameSong ? (currentSong.paused ? "img/play.svg" : "img/pause.svg") : "img/play.svg";
    });
}

// Asynchronously fetch and display albums
async function DisplayAlbums() {
    console.log("displaying albums");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            console.log(folder);
            // Get metadata from the folder
            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
        <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="white" fill="white" stroke-width="1.5"
                    stroke-linejoin="round" />
            </svg>
        </div>
        <img width="35" src="/songs/${folder}/cover.jpg" alt="">
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
        }
    }

    // Load the playlist when card clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
            const playButton = document.querySelector(".play img");
            playButton.src = "img/pause.svg"; // Change the play button to pause when starting a new song
        });
    });
}

// Main function
async function main() {
    await getSongs("songs/");

    playMusic(songs[0], true);

    // Display all the albums on the page
    await DisplayAlbums();

    // Event listener for song end
    currentSong.addEventListener('ended', () => {
        if (isShuffleMode) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex], true);
        } else {
            playNextSongInSequence();
        }
    });

    // Event listener for next button
    next.addEventListener("click", () => {
        currentSong.pause();
        if (isShuffleMode) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex]);
        } else {
            playNextSongInSequence();
        }
    });

    // Event listener for previous button
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index;
        if (isShuffleMode) {
            index = Math.floor(Math.random() * songs.length);
        } else {
            index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            index = (index - 1 + songs.length) % songs.length;
        }
        playMusic(songs[index]);
    });

    // Event listener for shuffle SVG
    shuffle.addEventListener("click", () => {
        isShuffleMode = !isShuffleMode; // Toggle shuffle mode
        if (isShuffleMode) {
            alert("Shuffle is on");
        } else {
            alert("Shuffle is off");
        }
    });

    // Listen for time update events
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondToMinutesSeconds(currentSong.currentTime)} / ${secondToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Event listener for seek bar
    const seekbar = document.querySelector(".seekbar");
    seekbar.addEventListener("click", e => {
        updateSeekbar(e);
    });

    // Function to update seek bar
    function updateSeekbar(e) {
        let percent = (e.offsetX / seekbar.getBoundingClientRect().width) * 100;
        let newTime = (currentSong.duration * percent) / 100;

        // Update seek bar position and current time
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = newTime;

        // Update seek bar color
        updateSeekbarColor();
    }

    // Function to update seek bar color
    function updateSeekbarColor() {
        let percentPlayed = (currentSong.currentTime / currentSong.duration) * 100;

        // Set the background color for the played part to a specific color
        seekbar.style.background = `linear-gradient(to right, #1bffc9 ${percentPlayed}%, #000 ${percentPlayed}%, #000 100%)`;
    }

    // Add event listener to update seek bar color during playback
    currentSong.addEventListener("timeupdate", updateSeekbarColor);

    // Event listener for play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }

        // Update the play SVG for the current song in the song list
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((item, index) => {
            if (currentSong.src.includes(songs[index])) {
                item.querySelector(".playnow img").src = currentSong.paused ? "img/play.svg" : "img/pause.svg";
            }
        });
    });

    // Event listener for volume bar
    document.querySelector(".volrange").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;

        // Update volume icon based on the new volume level
        const volumeIcon = document.querySelector(".volume > img");
        if (currentSong.volume > 0) {
            volumeIcon.src = "img/volume.svg";
        } else {
            volumeIcon.src = "img/mute.svg";
        }
    });

    // Event listener for mute button
    document.querySelector(".volume > img").addEventListener("click", () => {
        const volumeIcon = document.querySelector(".volume > img");
        if (currentSong.volume > 0) {
            // Mute the song and update the volume icon
            currentSong.volume = 0;
            document.querySelector(".volrange input").value = 0;
            volumeIcon.src = "img/mute.svg";
        } else {
            // Unmute the song and set a default volume level
            currentSong.volume = 0.1;
            document.querySelector(".volrange input").value = 10;
            volumeIcon.src = "img/volume.svg";
        }
    });
}

// Function to play the next song in sequence
function playNextSongInSequence() {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    index = (index + 1) % songs.length;
    playMusic(songs[index]);
}

// Call the main function
main();

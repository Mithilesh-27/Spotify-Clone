let playMusic = document.querySelector(".playMusic")
let pauseMusic = document.querySelector(".pauseMusic")
let previous = document.querySelector(".previous")
let next = document.querySelector(".next")
let seekBar = document.getElementById("seekBar")
let volumeBar = document.getElementById("volumeBar")
let replay = document.querySelector(".replay")

let audio = []
let currSong
let cards

function makePlaylist(songs) {
    for (const song of songs) {
        document.querySelector(".songsList>ul").insertAdjacentHTML("beforeend", `<li><div>
        <img class="invert" src="./Assets/music1.svg" alt="music">
        <div>${song}</div>
    </div>
    <button class="play playSong">
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 768 1024"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path
                d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
        </svg>
    </button>
    <button class="pause pauseSong">
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path
                d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />
        </svg>
    </button></li>`)
    }
    let songsUL = document.querySelector(".songsList>ul")
    cards = Array.from(songsUL.children)
}

async function getSongs(folder) {
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let songs = []
    let links = []
    let anchors = div.getElementsByTagName("a")
    Array.from(anchors).forEach((card) => {
        if (card.href.includes(".mp3")) {
            links.push(card.href)
            songs.push(card.href.replace(".mp3", "").replaceAll("%20", " ").split(`${folder}/`)[1])
        }
    })

    makePlaylist(songs)

    return [songs, links]
}

function highlightCard(card) {
    document.querySelectorAll(".songsList li").forEach((e) => {
        e.querySelector("img").setAttribute("src", "./Assets/music1.svg")
        e.querySelector("div>div").classList.remove("highlight")
        e.style.backgroundColor = '#8308ff'
    })
    card.querySelector("img").setAttribute("src", "./Assets/music2.svg")
    card.querySelector("div>div").classList.add("highlight")
    card.style.backgroundColor = '#121212'
}

function controls(songs) {
    document.querySelector(".playbar>b").innerText = songs[audio.indexOf(currSong)]


    const normalize = (value, max) => (value / max) * 100

    currSong.addEventListener('loadedmetadata', () => {
        seekBar.max = 100
    })

    seekBar.addEventListener('input', () => {
        currSong.currentTime = (seekBar.value / 100) * currSong.duration
    })


    currSong.addEventListener('timeupdate', () => {
        seekBar.value = normalize(currSong.currentTime, currSong.duration)
        document.querySelector("#currTime").innerHTML = secToMin(currSong.currentTime)
        document.querySelector("#duration").innerHTML = secToMin(currSong.duration)
    })

    volumeBar.oninput = () => {
        currSong.volume = volumeBar.value
        if (currSong.volume == 0) {
            vol.querySelector("img").setAttribute("src", "./Assets/volumeOff.svg")
        } else {
            vol.querySelector("img").setAttribute("src", "./Assets/volumeOn.svg")
        }
    }

    let vol = document.querySelector(".volume>button")
    vol.addEventListener("click", () => {
        if (vol.querySelector("img").getAttribute("src") == "./Assets/volumeOn.svg") {
            vol.querySelector("img").setAttribute("src", "./Assets/volumeOff.svg")
            volumeBar.value = 0
            currSong.volume = 0
        } else {
            vol.querySelector("img").setAttribute("src", "./Assets/volumeOn.svg")
            volumeBar.value = 100
            currSong.volume = 1
        }
    })

    replay.addEventListener("click", () => {
        if (replay.querySelector("img").getAttribute("src") == "./Assets/replay1.svg") {
            replay.querySelector("img").setAttribute("src", "./Assets/replay2.svg")
        } else {
            replay.querySelector("img").setAttribute("src", "./Assets/replay1.svg")
        }
    })
}

function playSongs(songs, links, album, albums) {
    audio = [] 
    for (let i = 0; i < songs.length; i++) {
        if (cards[i].querySelector("div>div").innerText === songs[i]) {
            audio[i] = new Audio(links[i])
        }
    }

    let i = 0
    audio[i].play()
    highlightCard(cards[i])
    currSong = audio[i]
    for (const card of cards) {
        card.addEventListener("click", (e) => {
            highlightCard(e.currentTarget)
            i = cards.indexOf(e.currentTarget)
            currSong = audio[i]
            audio.forEach(music => {
                if (music != currSong) {
                    music.pause()
                    music.currentTime = 0
                }
            })
            if (currSong.paused) {
                currSong.play()
            } else {
                currSong.pause()
            }
        })
    }

    audio.forEach(e => {
        e.addEventListener('play', (event) => {
            currSong = event.currentTarget
            album.querySelector(".playAlbum").style.display = 'none'
            album.querySelector(".pauseAlbum").style.display = 'block'
            pauseMusic.style.display = 'block'
            playMusic.style.display = 'none'
            cards[audio.indexOf(currSong)].querySelector(".playSong").style.display = 'none'
            cards[audio.indexOf(currSong)].querySelector(".pauseSong").style.display = 'block'

            controls(songs)
        })

        e.addEventListener('pause', (event) => {
            currSong = event.currentTarget
            album.querySelector(".playAlbum").style.display = 'block'
            album.querySelector(".pauseAlbum").style.display = 'none'
            pauseMusic.style.display = 'none'
            playMusic.style.display = 'block'
            cards[audio.indexOf(currSong)].querySelector(".playSong").style.display = 'block'
            cards[audio.indexOf(currSong)].querySelector(".pauseSong").style.display = 'none'

            controls(songs)
        })

        e.addEventListener('ended', (event) => {
            currSong = event.currentTarget
            if (replay.querySelector("img").getAttribute("src") === "./Assets/replay2.svg") {
                currSong.currentTime = 0
                currSong.play()
            } else {
                pauseMusic.style.display = 'none'
                playMusic.style.display = 'block'
                cards[audio.indexOf(currSong)].querySelector(".playSong").style.display = 'block'
                cards[audio.indexOf(currSong)].querySelector(".pauseSong").style.display = 'none'
                currSong = (currSong == audio[cards.length - 1] ? audio[0] : audio[audio.indexOf(currSong) + 1])
                highlightCard(cards[audio.indexOf(currSong)])
                currSong.play()
            }
        })

        albums.forEach(e => {
            if (e != album) {
                e.addEventListener("click", () => {
                    currSong.pause()
                    currSong.currentTime = 0
                    album.querySelector(".pauseAlbum").style.display = 'none'
                    album.querySelector(".playAlbum").style.display = 'block'
                })
            }
            
        })
    })
}

async function selectAlbum(folder, album, albums) {
    document.querySelector(".playlist").style.display = 'block'
    document.querySelector(".songsList>ul").innerHTML = null
    document.querySelector(".playbar").style.visibility = 'visible'
    let [songs, links] = await getSongs(folder)
    playSongs(songs, links, album, albums)
}

function secToMin(time) {
    let min = Math.floor(time / 60)
    let sec = Math.floor(time % 60)
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
}

async function loadAlbums() {
    let response = await fetch(`http://127.0.0.1:3000/songs/`)
    let b = await response.text()
    let div = document.createElement("div")
    div.innerHTML = b
    let anchors = Array.from(div.getElementsByTagName("a"))
    let folders = []
    anchors.forEach(e => {
        if (e.href.includes("/songs")) {
            folders.push(e.href)
        }
    })
    for (let j = 0; j < folders.length; j++) {
        let folder = folders[j]
        let a = await fetch(`${folder}info.json`)
        let response = await a.json()
        document.querySelector(".container").insertAdjacentHTML("beforeend",
            `<div class="album">
                    <img class="albumImage" src="${folder}cover.jpg">
                    <button class="play playAlbum">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 768 1024"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path
                                d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                        </svg>
                    </button>
                    <button class="pause pauseAlbum">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path
                                d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />
                        </svg>
                    </button>
                    <h4>${response.title}</h4>
                    <span>${response.description}</span>
                </div>`)
    }
    let albums = document.querySelectorAll(".album")
    return albums
}

async function main() {
    let albums = await loadAlbums()
    albums.forEach((album) => {
        album.addEventListener("mouseover", () => {
            album.querySelector(".playAlbum").classList.remove("revAnimate")
            album.querySelector(".playAlbum").classList.add("animate")
        })
        album.addEventListener("mouseleave", () => {
            album.querySelector(".playAlbum").classList.remove("animate")
            album.querySelector(".playAlbum").classList.add("revAnimate")
        })
        album.addEventListener("click", (e) => {
            selectAlbum(e.currentTarget.querySelector("h4").innerText, e.currentTarget, albums)
        })
    })
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = '0%';
    })
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = '-100%';
    })

    
    playMusic.addEventListener('click', () => {
        audio.forEach(music => {
            if (music != currSong) {
                music.pause()
            }
        })
        if (currSong.paused) {
            currSong.play()
        }
    })

    pauseMusic.addEventListener('click', () => {
        if (currSong.play) {
            currSong.pause()
        }
    })

    previous.addEventListener('click', () => {
        currSong.pause()
        currSong.currentTime = 0;
        currSong = (currSong == audio[0] ? audio[audio.length - 1] : audio[audio.indexOf(currSong) - 1])
        highlightCard(cards[audio.indexOf(currSong)])
        currSong.play()
    })

    next.addEventListener('click', () => {
        currSong.pause()
        currSong.currentTime = 0;
        currSong = (currSong == audio[audio.length - 1] ? audio[0] : audio[audio.indexOf(currSong) + 1])
        highlightCard(cards[audio.indexOf(currSong)])
        currSong.play()
    })
}

main()
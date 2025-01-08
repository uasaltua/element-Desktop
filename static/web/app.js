var postId = 0 

function chtotoload() {
  eel.load_offline_mode_settings()(function (results){
    if (results["music-save"]) {
      document.querySelector('#settings').querySelector("#saving-music").className = "activated"
    }
    if (results["last-posts-save"]) {
      document.querySelector('#settings').querySelector("#saving-last-posts").className = "activated"
    }
    if (results["my-profile-save"]) {
      document.querySelector('#settings').querySelector("#saving-photos").className = "activated"
    }
    if (results["sessions-save"]) {
      document.querySelector('#settings').querySelector("#saving-my-profile").className = "activated"
    }
  })
}

function changeUsername() {
  var menu = document.querySelector("#changeUsernameMenu")
  eel.profileChange({"username": menu.querySelector("#username").value})((callback) => {
    if (callback.status == "error") {
      show_notification("assets/Error.png", "Редактирование имя пользователя", callback.text)
    } else if (callback.status == "success") {
      show_notification("favicon.ico", "Редактирование имя пользователя", callback.text)
    }
  })
}

function changeMail() {
  var menu = document.querySelector("#changeMailMenu")
  eel.profileChange({"email": menu.querySelector("#email").value})((callback) => {
    if (callback.status == "error") {
      show_notification("assets/Error.png", "Редактирование почты", callback.text)
    } else if (callback.status == "success") {
      show_notification("favicon.ico", "Редактирование почты", callback.text)
    }
  })
}

function changePass() {
  var menu = document.querySelector("#changePassMenu")
  eel.profileChange({"old_password": menu.querySelector("#oldPassword").value, "new_password": menu.querySelector("#newPassword").value})((callback) => {
    if (callback.status == "error") {
      show_notification("assets/Error.png", "Редактирование пароля", callback.text)
    } else if (callback.status == "success") {
      show_notification("favicon.ico", "Редактирование пароля", callback.text)
    }
  })
}

function upload(type) {
  document.querySelector('#fileInput').click();
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = async function(event) {
    const arrayBuffer = event.target.result;
    const uint8Array = new Uint8Array(arrayBuffer);

    // Упаковываем файл в объект для отправки
    const fileData = {
      name: file.name,
      type: file.type,
      data: uint8Array
    };

    if (type == "avatar") {
      eel.profileChange({ "avatar": fileData })(function(callback) {
        if (callback.status == "error") {
          show_notification("assets/Error.png", "Загрузка аватара", callback.text);
        } else if (callback.status == "success") {
          show_notification("favicon.ico", "Загрузка аватара", callback.text);
        }
        eel.my_profile()(function(profile) {
          var settings = document.querySelector("#settings");
          settings.querySelector('#cover').src = "https://elemsocial.com/Content/Covers/" + JSON.parse(profile).Cover;
          settings.querySelector('#avatar').src = "https://elemsocial.com/Content/Avatars/" + JSON.parse(profile).Avatar;
        });
      });
    } else if (type == "cover") {
      eel.profileChange({ "cover": fileData })(function(callback) {
        if (callback.status == "error") {
          show_notification("assets/Error.png", "Загрузка обложки", callback.text);
        } else if (callback.status == "success") {
          show_notification("favicon.ico", "Загрузка обложки", callback.text);
        }
        eel.my_profile()(function(profile) {
          var settings = document.querySelector("#settings");
          settings.querySelector('#cover').src = "https://elemsocial.com/Content/Covers/" + JSON.parse(profile).Cover;
          settings.querySelector('#avatar').src = "https://elemsocial.com/Content/Avatars/" + JSON.parse(profile).Avatar;
        });
      });
    }
  };

  reader.readAsArrayBuffer(file); // Читаем файл в бинарном формате
}

function loadComms() { 
  eel.load_comments(postId)(function(comments) {
    document.querySelector("#comments").querySelector("div").innerHTML = ''
    for (let i = 0; i < comments.length; i++) {
      document.querySelector("#comments").querySelector("div").innerHTML += `
      <div class="Post1">
        <div style="margin-bottom: 10px;display: flex;">
          <img src="https://elemsocial.com/Content/Avatars/${comments[i].Avatar}" alt="avatar">
          <div style="display: flex;flex-direction: column;margin: 0;">
            <a style="color: white; text-decoration: none;margin: 0;" onclick="loadProfile('${comments[i].Username}'); document.querySelector('#comments').className = 'CommentsClosed';">${comments[i].Name}</a>
            <p>${TimeAgo(comments[i].Date)}</p>
          </div>
        </div>
        ${comments[i].Text}
      </div>`
    }
  })
}

var Themes = []

function loadThemes() {
  if (localStorage.getItem("CustomThemes")) {
    Themes = JSON.parse(localStorage.getItem("CustomThemes"))
    for (let i = 0; i < Themes.length; i++) {
      var option = document.createElement('option')
      option.value = Themes[i].name
      option.innerHTML = Themes[i].name
      document.querySelector('#ThemesSelector').appendChild(option)
    }
  }
}

loadThemes()

function change(event) {
  if(event.target.value == "dark") {
    document.querySelector("#themelnk").href = "UI/style.css"
    document.querySelector('#themeStyle').innerHTML = ""
    return
  } else if (event.target.value == "white") {
    document.querySelector("#themelnk").href = "UI/white.css"
    document.querySelector('#themeStyle').innerHTML = ""
    return
  }

  for (let i = 0; i < Themes.length; i++) {
    document.querySelector('#themeStyle').innerHTML = Themes[i].content
  }
  localStorage.setItem("SelectedTheme", event.target.value)
}

function loadCustomTheme() {
  const file = document.getElementById("customTheme").files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const content = event.target.result
    Themes.push({ name: file.name, content: content });

    var option = document.createElement('option')
    option.value = file.name
    option.innerHTML = file.name
    document.querySelector('#ThemesSelector').appendChild(option)

    localStorage.setItem("CustomThemes", JSON.stringify(Themes))
  };

  reader.readAsText(file, "UTF-8")

  localStorage.getItem(file)
}

function TimeAgo(dateStr) {
  const date = new Date(dateStr.replace(" ", "T"));
  if (isNaN(date.getTime())) return "Некорректная дата"; // Проверка на корректность

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "только что";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} минут назад`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} часов назад`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} дней назад`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} месяцев назад`;

  return `${Math.floor(diffInSeconds / 31536000)} лет назад`;
}

function resizeToFit(originalWidth, originalHeight) {
  const widthRatio = 460 / originalWidth;
  const heightRatio = 300 / originalHeight;
  const scale = Math.min(widthRatio, heightRatio);

  const newWidth = Math.round(originalWidth * scale);
  const newHeight = Math.round(originalHeight * scale);

  return { width: newWidth, height: newHeight };
}

function substr12(text) {
  if (text.length > 12) {
    return text.substring(0, 10) + "...";
  }
  return text
}

function substr43(text) {
  if (text.length > 43) {
    return text.substring(0, 40) + "...";
  }
  return text
}

function get_FAVORITES() {
  eel.get_music("FAVORITES", 0)(function(music) {
    document.querySelector('#music').querySelector('#favorite').innerHTML = ''
    for (let i = 0; i < music.length; i++) {
      var cover = "assets/noMusicCover.jpg";
      if (music[i].Cover) {
        cover = "https://elemsocial.com/Content/Simple/" + music[i].Cover.simple_image
      }
      document.querySelector('#music').querySelector('#favorite').innerHTML += `
      <div class="MusicItem" id="${music[i].ID}">
        <img src="${cover}"><br>
        ${substr12(music[i].Title)}<br>
        <p style="font-size: 12px;font-family: 'SF Pro Display Bold', Arial, Helvetica, sans-serif;color: rgb(150, 150, 150);">${substr12(music[i].Artist)}</p>
      </div>`
    }
    document.querySelectorAll(".MusicItem").forEach(item => {
      item.addEventListener("click", function() {
        eel.load_song(item.id)(function(song){
          document.querySelector("audio").id = item.id
          if (song.Liked) {
            document.querySelector("#like").querySelector('svg').setAttribute("fill", "white")
          } else {
            document.querySelector("#like").querySelector('svg').setAttribute("fill", "none")
          }
          document.querySelector("audio").src = "https://elemsocial.com/Content/Music/Files/" + song.File
          var player = document.querySelector("#musicPlayer")
          player.querySelector("p").innerHTML = substr43(song.Title + " - " + song.Artist)
          if (song.Cover) {
            player.querySelector("img").src = "https://elemsocial.com/Content/Simple/" + song.Cover.simple_image
          } else {
            player.querySelector("img").src = "assets/noMusicCover.jpg"
          }
          document.querySelector("audio").addEventListener("loadedmetadata", function () {
            player.querySelector("input").max = document.querySelector("audio").duration
            if ('mediaSession' in navigator) {
              navigator.mediaSession.metadata = new MediaMetadata({
                title: song.Title,
                artist: song.Artist,
                artwork: [
                  { src: player.querySelector("img").src, sizes: '300x300', type: 'image/jpeg' }
                ]
              });
            }
          })

          document.querySelector("audio").addEventListener("timeupdate", function () {
            player.querySelector("input").value = document.querySelector("audio").currentTime
          })
        })
      })
    });
  })
}

var streamOwner = ""
var playPause = true
var songG;

eel.expose(sync)
function sync(...data) {
  var player = document.querySelector("#musicPlayer")
  if(data[0] == "AudioUpdate") {
    //eel.sync("AudioStreamOwnerChange", navigator.userAgent)
    var song = data[1]
    if (song.Liked) {
      document.querySelector("#like").querySelector('svg').setAttribute("fill", "white")
    } else {
      document.querySelector("#like").querySelector('svg').setAttribute("fill", "none")
    }
    player.querySelector("audio").id = song.ID
    player.querySelector("audio").src = song.src
    player.querySelector("img").src = song.Cover
    player.querySelector("p").innerHTML = substr43(song.Title)
    player.querySelector("#Author").innerHTML = substr43(song.Artist)
    player.querySelector("button").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>`
    //eel.sync("AudioPauseOwner")
  } else if (data[0] == "AudioTimeupdate") {
    if (data[3] == navigator.userAgent) {
      //eel.sync("AudioStreamOwnerChange", navigator.userAgent)
      return
    }
    player.querySelector("audio").pause()
    streamOwner = data[3]
    player.querySelector("input").value = data[1]
    player.querySelector("input").max = data[2]
  } else if (data[0] == "AudioActionPause") {
    if (!navigator.userAgent == data[1]) {return}
    if (playPause == false && navigator.userAgent == data[1]) {
      playPause = true
      player.querySelector("button").innerHTML = pauseIcon
      document.querySelector("audio").play();
    } else if (navigator.userAgent == data[1]) {
      playPause = false
      player.querySelector("button").innerHTML = playIcon
      document.querySelector("audio").pause();
    }
  } else if (data[0] == "AudioPauseOwner") {
    if (!data[1] == streamOwner) {return}
    if (playPause == false) {
      playPause = true
      player.querySelector("button").innerHTML = pauseIcon
      document.querySelector("audio").play();
    } else {
      playPause = false
      player.querySelector("button").innerHTML = playIcon
      document.querySelector("audio").pause();
    }
  } else if (data[0] == "AudioPauseNotOwner") {
    if (data[1] == streamOwner) {return}
    if (playPause == false) {
    } else {
      playPause = false
      player.querySelector("button").innerHTML = playIcon
      document.querySelector("audio").pause();
    }
  } else if (data[0] == "AudioChangeTime") {
    if (!navigator.userAgent == data[2]) {return}
    if (navigator.userAgent == data[2]) {
      document.querySelector('audio').currentTime = data[1]
    }
  } else if (data[0] == "AudioStreamOwnerChange") {
    streamOwner = data[1]
    if (!data[1] == navigator.userAgent) {
      player.querySelector("audio").pause()
    }
  } else if (data[0] == "getUpdates") {
    if (data[1] == navigator.userAgent) {
      return
    }
    if (data[2] == true) {
      if (data[3] == "music") {
        var info = data[4]
        player.querySelectorAll('p')[0].innerHTML = info.Title
        player.querySelector('#Author').innerHTML = info.Artist
        player.querySelectorAll('svg')[1].setAttribute('fill', info.Liked)
        player.querySelector('img').src = info.Cover
        player.querySelector('audio').id = info.ID
        player.querySelector('audio').playlist = info.Audio
        player.querySelector('audio').src = info.Playlist
        songG = info
      }
      return
    }
    eel.sync("getUpdates", navigator.userAgent, true, "music", {
      "Title": player.querySelectorAll('p')[0].innerHTML,
      "Artist": player.querySelector('#Author').innerHTML,
      "PauseState": player.querySelector('audio').paused,
      "Liked": player.querySelectorAll('svg')[1].getAttribute('fill'),
      "Cover": player.querySelector('img').src,
      "ID": player.querySelector('audio').id,
      "Audio": player.querySelector('audio').src,
      "Playlist": player.querySelector('audio').playlist
    })
  }
}

var player = document.querySelector("#musicPlayer")
var playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>`
var pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>`

document.querySelector('audio').addEventListener("play", () => {
  player.querySelector("button").innerHTML = playIcon
});

document.querySelector('audio').addEventListener("pause", () => {
  player.querySelector("button").innerHTML = pauseIcon
});


if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    if (player.querySelector("audio").playlist) {
      var item = document.querySelector("#music").querySelector("#" + player.querySelector("audio").playlist).querySelectorAll(".MusicItem")
      for (let i = 0; i < item.length; i++) {
        if (item[i].id == player.querySelector("audio").id) {
          if (item.length > i) {
            player.currentTime = 0
            item[i + 1].click()
            return
          }
        }
      }
    }
  });

  navigator.mediaSession.setActionHandler('previoustrack', () => {
    if (player.querySelector("audio").playlist) {
      var item = document.querySelector("#music").querySelector("#" + player.querySelector("audio").playlist).querySelectorAll(".MusicItem")
      for (let i = 0; i < item.length; i++) {
        if (item[i].id == player.querySelector("audio").id) {
          if (!item.length < i) {
            player.querySelector("audio").currentTime = 0
            item[i - 1].click()
            return
          }
        }
      }
    }
  });
}

document.querySelector("audio").addEventListener("timeupdate", function () {
  player.querySelector("input").value = document.querySelector("audio").currentTime
  //eel.sync("AudioStreamOwnerChange", navigator.userAgent)
  //eel.sync("AudioPauseNotOwner", navigator.userAgent)
  //eel.sync('AudioTimeupdate', document.querySelector("audio").currentTime, document.querySelector("audio").duration, navigator.userAgent)()
  if (document.querySelector("audio").currentTime == document.querySelector("audio").duration && document.querySelector("audio").paused && document.querySelector("audio").playlist) {
    var item = document.querySelector("#music").querySelector("#" + document.querySelector("audio").playlist).querySelectorAll(".MusicItem")
    for (let i = 0; i < item.length; i++) {
      if (item[i].id == document.querySelector("audio").id) {
        if (item.length > i) {
          document.querySelector("audio").currentTime = 0
          item[i + 1].click()
          return
        }
      }
    }
  }
})

function onSongLoad(del=false) {
  player.querySelector("input").max = document.querySelector("audio").duration
  document.querySelector("audio").play()
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: songG.Title,
      artist: songG.Artist,
      artwork: [
        { src: player.querySelector("img").src, sizes: '300x300', type: 'image/jpeg' }
      ]
    });
  }
  if(del) {
    player.querySelector("audio").removeEventListener('loadedmetadata', onSongLoad)
  }
}

player.querySelector("audio").addEventListener("loadedmetadata", onSongLoad)

function load_music_player(item, playlist) {
  eel.load_song(item.id)(function(song){
    document.querySelector("audio").id = item.id
    document.querySelector("audio").playlist = playlist
    if (song.Liked) {
      document.querySelector("#like").querySelector('svg').setAttribute("fill", "white")
    } else {
      document.querySelector("#like").querySelector('svg').setAttribute("fill", "none")
    }
    if (!song.Offline) {
      document.querySelector("audio").src = "https://elemsocial.com/Content/Music/Files/" + song.File
    } else {
      document.querySelector("audio").src = song.File
    }
    
    ////eel.sync("AudioStreamOwnerChange", navigator.userAgent)
    ////eel.sync("AudioPauseNotOwner", navigator.userAgent)

    player.querySelector("button").innerHTML = playIcon
    player.querySelector("p").innerHTML = substr43(song.Title)
    player.querySelector("#Author").innerHTML = substr43(song.Artist)
    if (song.Cover) {
      player.querySelector("img").src = "https://elemsocial.com/Content/Simple/" + song.Cover.simple_image
    } else {
      player.querySelector("img").src = "assets/noMusicCover.jpg"
    }

    player.querySelector("audio").addEventListener("loadedmetadata", onSongLoad, true)
    songG = song
  })
}

function removeFromPlaylist(id, element) {
  element.remove()
  //...
}

function addToPlaylist(da, id, element) {
  if (da == "window") {
    document.querySelector('#playlistSelector').parentNode.querySelector('center').style.filter = 'blur(10px)'
    document.querySelector('#playlistSelector').classList.toggle('non-visible-anim-closed')
    document.querySelector('#playlistSelector').classList.toggle('non-visible-anim-opened')
  }
}

function load_music() {
  var indexF = document.querySelector('#music').querySelector('#favorite').querySelectorAll('.MusicItem').length;
  var indexN = document.querySelector('#music').querySelector('#new').querySelectorAll('.MusicItem').length;
  var indexR = document.querySelector('#music').querySelector('#random').querySelectorAll('.MusicItem').length;
  //var index = 0
  eel.get_music("FAVORITES", indexF)(function(music) {
    for (let i = 0; i < music.length; i++) {
      var cover = "assets/noMusicCover.jpg";
      if (music[i].Cover) {
        cover = "https://elemsocial.com/Content/Simple/" + music[i].Cover.simple_image
      }
      document.querySelector('#music').querySelector('#favorite').innerHTML += `
      <div class="MusicItem" id="${music[i].ID}" onclick="load_music_player(this, 'favorite')">
        <img src="${cover}"><br>
        ${substr12(music[i].Title)}<br>
        <p style="font-size: 12px;font-family: 'SF Pro Display Bold', Arial, Helvetica, sans-serif;color: rgb(150, 150, 150);">${substr12(music[i].Artist)}</p>
        <svg onclick="addToPlaylist('window', ${music[i].ID}, this)" xmlns="http://www.w3.org/2000/svg" style="position: relative;bottom: 205px;right: -55px;background-color: rgba(15, 15, 15, 0.6);border-radius: 15px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </div>`
    }
  })
  eel.get_music("LATEST", indexN)(function(music) {
    for (let i = 0; i < music.length; i++) {
      var cover = "assets/noMusicCover.jpg";
      if (music[i].Cover) {
        cover = "https://elemsocial.com/Content/Simple/" + music[i].Cover.simple_image
      }
      document.querySelector('#music').querySelector('#new').innerHTML += `
      <div class="MusicItem" id="${music[i].ID}" onclick="load_music_player(this, 'new')">
        <img src="${cover}"><br>
        ${substr12(music[i].Title)}<br>
        <p style="font-size: 12px;font-family: 'SF Pro Display Bold', Arial, Helvetica, sans-serif;color: rgb(150, 150, 150);">${substr12(music[i].Artist)}</p>
        <svg onclick="addToPlaylist('window', ${music[i].ID}, this)" xmlns="http://www.w3.org/2000/svg" style="position: relative;bottom: 205px;right: -55px;background-color: rgba(15, 15, 15, 0.6);border-radius: 15px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </div>`
    }
  })
  eel.get_music("RANDOM", indexR)(function(music) {
    for (let i = 0; i < music.length; i++) {
      var cover = "assets/noMusicCover.jpg";
      if (music[i].Cover) {
        cover = "https://elemsocial.com/Content/Simple/" + music[i].Cover.simple_image
      }
      document.querySelector('#music').querySelector('#random').innerHTML += `
      <div class="MusicItem" id="${music[i].ID}" onclick="load_music_player(this, 'random')">
        <img src="${cover}"><br>
        ${substr12(music[i].Title)}<br>
        <p style="font-size: 12px;font-family: 'SF Pro Display Bold', Arial, Helvetica, sans-serif;color: rgb(150, 150, 150);">${substr12(music[i].Artist)}</p>
        <svg onclick="addToPlaylist('window', ${music[i].ID}, this)" xmlns="http://www.w3.org/2000/svg" style="position: relative;bottom: 205px;right: -55px;background-color: rgba(15, 15, 15, 0.6);border-radius: 15px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </div>`
    }
  })
  eel.load_playlists()(function(playlists) {
    if (!indexF == 0) {return} 
    playlists.forEach((playlist) => {
      var playlistName = playlist.name
//<svg class="Icon" iid="VERIFY" clicked="0" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.808312 2.95062C0.37935 3.6936 0.632055 4.63671 1.13747 6.52292L1.53952 8.0234C2.04493 9.90962 2.29763 10.8527 3.04061 11.2817C3.7836 11.7106 4.7267 11.4579 6.61292 10.9525L8.1134 10.5505C9.99961 10.0451 10.9427 9.79237 11.3717 9.04938C11.8006 8.3064 11.5479 7.36329 11.0425 5.47708L10.7855 4.51772L7.26808 8.03511L6.80991 8.49327C6.60769 8.69548 6.27984 8.69548 6.07763 8.49327L3.6093 6.02494C3.40708 5.82272 3.40708 5.49487 3.6093 5.29266L3.94388 4.95807C4.1461 4.75585 4.47395 4.75585 4.67617 4.95807L6.07764 6.35954C6.27985 6.56175 6.6077 6.56175 6.80992 6.35954L10.3289 2.84056C9.99633 1.69157 9.71499 1.05065 9.13938 0.718315C8.3964 0.289354 7.45329 0.542059 5.56707 1.04747L4.0666 1.44952C2.18038 1.95493 1.23727 2.20764 0.808312 2.95062Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M7.35912 9.04248L13.0281 3.37355C13.5336 2.86802 13.5336 2.04838 13.0281 1.54284L12.6935 1.20826C12.1879 0.702721 11.3683 0.702722 10.8628 1.20826L6.44378 5.62725L5.22538 4.40886C4.71984 3.90332 3.90021 3.90332 3.39467 4.40886L3.06008 4.74344C2.55455 5.24898 2.55455 6.06862 3.06008 6.57415L5.52841 9.04248C6.03395 9.54802 6.85358 9.54802 7.35912 9.04248ZM7.62111 7.8733C7.59582 7.81812 7.56315 7.78098 7.54268 7.7605L7.26808 8.03511L6.80991 8.49327C6.60769 8.69548 6.27984 8.69548 6.07763 8.49327L3.6093 6.02494C3.40708 5.82272 3.40708 5.49487 3.6093 5.29266L3.94388 4.95807C4.1461 4.75585 4.47395 4.75585 4.67617 4.95807L6.07764 6.35954C6.27985 6.56175 6.6077 6.56175 6.80992 6.35954L11.412 1.75747C11.6142 1.55525 11.9421 1.55525 12.1443 1.75747L12.4789 2.09206C12.6811 2.29427 12.6811 2.62213 12.4789 2.82434L7.54373 7.75945C7.58805 7.80295 7.62507 7.8619 7.64483 7.94092C7.65289 7.97316 7.65632 8.00398 7.65648 8.03285C7.65606 7.96735 7.6389 7.91213 7.62111 7.8733Z"></path></svg>
      document.querySelector('#music').querySelector('.playlists').innerHTML += `
    <h2 style="margin-left: 25px; text-align: left;">${playlistName} 
    <span onclick="show_notification('favicon.ico', 'Иконки', 'Это иконка плейлиста')" class="material-symbols-outlined" style="cursor: pointer;position: relative;font-size: 30px;top: 9px;">queue_music</span>
    <span onclick="eel.playlist('Rename', '${playlistName}', prompt('Введите новое имя плейлиста'))" class="material-symbols-outlined" style="cursor: pointer;position: relative;font-size: 30px;top: 9px;">edit</span>
    <span onclick="eel.playlist('Remove', '${playlistName}')" class="material-symbols-outlined" style="cursor: pointer;position: relative;font-size: 30px;top: 9px;">delete</span>
    </h2>
    <div id="${playlistName}" style="display: inline-flex;overflow-x: scroll;overflow-y: none;width: 470px;"></div>`

      playlist.sounds.forEach((music) => {
        var cover = "assets/noMusicCover.jpg";
        if (music.Cover) {
          cover = "https://elemsocial.com/Content/Simple/" + music.Cover.simple_image
        }
        
        document.querySelector('#music').querySelector("#" + playlistName).innerHTML += `
        <div class="MusicItem" id="${music.ID}" onclick="load_music_player(this, '${playlistName}')">
          <img src="${cover}"><br>
          ${substr12(music.Title)}<br>
          <p style="font-size: 12px;font-family: 'SF Pro Display Bold', Arial, Helvetica, sans-serif;color: rgb(150, 150, 150);">${substr12(music.Artist)}</p>
          <svg onclick="removeFromPlaylist(${music.ID}, this)" xmlns="http://www.w3.org/2000/svg" style="position: relative;bottom: 205px;right: -55px;background-color: rgba(15, 15, 15, 0.6);border-radius: 15px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>
        </div>`
      })
    })
  })
  
}

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return `${bytes.toFixed(2)} ${units[i]}`;
}

eel.expose(loadProfile)
function loadProfile(id, new_posts) {
  eel.get_profile(id)(function(profiledata) {
    var idd = profiledata.ID
    var profile = document.querySelector("#profile")

    
    var avatar = "https://elemsocial.com/Content/Avatars/" + profiledata.Avatar
    var cover = "https://elemsocial.com/Content/Covers/" + profiledata.Cover
    var subscriptions = profiledata.Subscriptions  + '<p style="font-size: 11px;color: gray;margin-top: 3px;">Подписок</p>'
    if (profiledata.Avatar == null) {
      avatar = "assets/noUserAvatar.png"
    }
    if (profiledata.Cover == null) {
      cover = "assets/noUserCover.png"
    }
    if (profiledata.Subscriptions == undefined) {
      subscriptions = "0" + '<p style="font-size: 11px;color: gray;margin-top: 3px;">Подписок</p>'
    }

    profile.querySelector("#cover").src = cover
    profile.querySelector("#avatar").src = avatar
    profile.querySelector("#username").innerHTML = "@" + profiledata.Username

    profile.querySelector("#subscriptions").innerHTML = subscriptions
    profile.querySelector("#subscribers").innerHTML = profiledata.Subscribers + '<p style="font-size: 11px;color: gray;margin-top: 3px;">Подписчиков</p>'
    profile.querySelector("#posts").innerHTML = profiledata.Posts + '<p style="font-size: 11px;color: gray;margin-top: 3px;">Постов</p>'

    profile.querySelector("#description").innerHTML = profiledata.Description

    eel.load_UserPosts(idd)(function(posts) {
      userposts = profile.querySelector(".UserPosts")
      userposts.innerHTML = ""
      posts.forEach((post) => {

        
        if (post.Comments == 0) {
          var comments = "Обсуждения"
        } else {
          var comments = post.Comments
        }
        if (post.Dislikes == 0) {
          var dislikes = "Дизлайк"
        } else {
          var dislikes = post.Dislikes
        }
        if (post.Likes == 0) {
          var likes = "Лайк"
        } else {
          var likes = post.Likes
        }

        var liked = "like"
        var disliked = "like"

        if (post.Liked) {
          liked = "liked"
        }
        if (post.Disliked) {
          disliked = "liked"
        }

        var postContent = ""
        if (post.Content) {
          if (JSON.parse(post.Content).Image) {
            var size = resizeToFit(JSON.parse(post.Content).Image.width, JSON.parse(post.Content).Image.height)
            postContent = `<img src="https://elemsocial.com/Content/Posts/Images/${JSON.parse(post.Content).Image.file_name}" alt="Photo" style="position: relative;margin-top: 19px;width: ${size.width}px; max-width: 600px;height: ${size.height}px; border-radius: 5px;z-index: 12;">
            <img src="https://elemsocial.com/Content/Posts/Images/${JSON.parse(post.Content).Image.file_name}" alt="Photo" style="position: absolute;margin-top: 19px;width: 450px; height: 300px; border-radius: 10px; filter: blur(10px);top: 100px;left: 25px;z-index: 11;"`
          } else if (JSON.parse(post.Content).File) {
            if (JSON.parse(post.Content).File.file_size) {
              size = formatFileSize(JSON.parse(post.Content).File.file_size)
            } else {
              size = "0B"
            }
            postContent = `
      <a class="PostContentFile" href="https://elemsocial.com/System/API/Download.php?File=${JSON.parse(post.Content).File.file_name}&amp;FileName=${JSON.parse(post.Content).File.orig_name}&amp;Target=post">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
        <div style="flex-direction: column;">
          <p class="FileName">${JSON.parse(post.Content).File.orig_name}</p>
          <p class="FileSize">${size}</p>
        </div>
      </a>`
          } else if (JSON.parse(post.Content).Video) {
            postContent = `
            <div class="PostContentVideo">
              <center>
                <video controls src="https://elemsocial.com/Content/Posts/Video/${JSON.parse(post.Content).Video.file_name}" style="width: 476px; height: 300px; border-radius: 10px;" alt="video"></video>
              </center>
            </div>`
          }
        }

    userposts.innerHTML += `
<div class="Post1">
  <div style="margin-bottom: 10px;display: flex;">
    <img src="${avatar}" style="margin-right: 5px;" alt="avatar">
    <div style="display: flex;flex-direction: column;margin: 0;">
      <button style="color: white; background-color: rgb(20, 20, 20);margin: 0;padding: 0;height: 15px;margin-top: 8px;text-align: left;">${profiledata.Name}</button>
      <p style="margin-top: 5px;font-size: 12px;color: rgb(200, 200, 200);">${TimeAgo(post.Date)}</p>
    </div>
  </div>
  ${addBreaks(post.Text, 53)}<br>
  <center>
    ${postContent}
  </center>
  <div>
        <button onclick="if (this.className == 'like') {eel.actionOnPost(${post.ID}, 'LIKE')(); this.className = 'liked'} else {eel.actionOnPost(${post.ID}, 'DELETE')(); this.className = 'like'}" class="UI-Button ${liked}" style="font-size: 16; margin-rigth: 0; border-top-right-radius: 0px; border-bottom-right-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> ${likes}</button>
        <button onclick="eel.actionOnPost(${post.ID}, 'DISLIKE')(); this.className = 'disliked' class="UI-Button ${disliked}" style="font-size: 16; margin-left: 0;margin-right: 0; border-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-off"><line x1="2" y1="2" x2="22" y2="22"/><path d="M16.5 16.5 12 21l-7-7c-1.5-1.45-3-3.2-3-5.5a5.5 5.5 0 0 1 2.14-4.35"/><path d="M8.76 3.1c1.15.22 2.13.78 3.24 1.9 1.5-1.5 2.74-2 4.5-2A5.5 5.5 0 0 1 22 8.5c0 2.12-1.3 3.78-2.67 5.17"/></svg> ${dislikes}</button>
        <button onclick="postId = ${post.ID}; loadComms();document.querySelector('.posts').style.filter = 'blur(10px)'; document.querySelector('#comments').className = 'Comments';" class="UI-Button comments" style="font-size: 16; margin-left: 0; border-top-left-radius: 0px; border-bottom-left-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-more"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg> ${comments}</button>
  </div>
</div>`;
      })
    })

    document.querySelector('.posts').style.filter = 'blur(10px)';
    profile.className = "profile"
  })
}

function addBreaks(text, n) {
  if (text) {
    return text.match(new RegExp(`.{1,${n}}`, 'g')).join('<br>');
  } else {return text;}
}

function fullImage(url) {

}

function load_posts(type) {
  var index = document.querySelectorAll('.Post').length - 1
  if (type == "upd") {
    document.querySelector('.posts').innerHTML = `
  <div class="Post">
    <textarea maxlength="3400" style="height: 56px; width: 587px;" placeholder="Введите текст"></textarea>
    <div>
      <button onclick="eel.new_post(document.querySelector('textarea').value)(function(){load_posts('upd'); document.querySelector('textarea').value = ''})" class="UI-Button comments">Отправить</button>
    </div>
  </div>`
    index = 0
  }

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return `${bytes.toFixed(2)} ${units[i]}`;
}

eel.load_posts(index)(function(posts) {
  posts = JSON.parse(posts);
  console.log(posts)
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].Comments == 0) {
      var comments = "Обсуждения"
    } else {
      var comments = posts[i].Comments
    }
    if (posts[i].Dislikes == 0) {
      var dislikes = "Дизлайк"
    } else {
      var dislikes = posts[i].Dislikes
    }
    if (posts[i].Likes == 0) {
      var likes = "Лайк"
    } else {
      var likes = posts[i].Likes
    }

    var liked = "like"
    var disliked = "like"

    if (posts[i].Liked) {
      liked = "liked"
    }
    if (posts[i].Disliked) {
      disliked = "liked"
    }
    var avatar = "https://elemsocial.com/Content/Avatars/" + posts[i].Avatar
    if (posts[i].Avatar == null) {
      avatar = "assets/noUserAvatar.png"
    }
    
    var postContent = ""

    if (posts[i].Content) {
      if (JSON.parse(posts[i].Content).Image) {
        var size = resizeToFit(JSON.parse(posts[i].Content).Image.width, JSON.parse(posts[i].Content).Image.height)
        postContent = `<img src="https://elemsocial.com/Content/Posts/Images/${JSON.parse(posts[i].Content).Image.file_name}" alt="Photo" style="position: relative;margin-top: 19px;width: ${size.width}px; max-width: 600px;height: ${size.height}px; border-radius: 5px;">
            <!-- <img src="https://elemsocial.com/Content/Posts/Images/${JSON.parse(posts[i].Content).Image.file_name}" alt="Photo" style="position: relative;margin-top: 19px;width: 460px; height: 300px; border-radius: 10px; filter: blur(10px);top: -300px;z-index: 11;z-index: 10;"-->`
      } else if (JSON.parse(posts[i].Content).File) {
        postContent = `
  <a class="PostContentFile" href="https://elemsocial.com/System/API/Download.php?File=${JSON.parse(posts[i].Content).File.file_name}&amp;FileName=${JSON.parse(posts[i].Content).File.orig_name}&amp;Target=post">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
    <div style="flex-direction: column;">
      <p class="FileName">${JSON.parse(posts[i].Content).File.orig_name}</p>
      <p class="FileSize">${formatFileSize(JSON.parse(posts[i].Content).File.file_size)}</p>
    </div>
  </a>`
      } else if (JSON.parse(posts[i].Content).Video) {
        postContent = `
        <div class="PostContentVideo">
          <center>
            <video controls src="https://elemsocial.com/Content/Posts/Video/${JSON.parse(posts[i].Content).Video.file_name}" style="width: 476px; height: 300px; border-radius: 10px;" alt="video"></video>
          </center>
        </div>`
      }
    }
    document.querySelector(".posts").innerHTML += `
<div class="Post">
  <div style="margin-bottom: 10px;display: flex;">
    <img src="${avatar}" style="margin-right: 5px;" alt="avatar">
    <div style="display: flex;flex-direction: column;margin: 0;">
      <button style="color: white; background-color: rgb(15, 15, 15);margin: 0;padding: 0;height: 15px;margin-top: 8px;text-align: left;" onclick="loadProfile('${posts[i].Username}')">${posts[i].Name}</button>
      <p style="margin-top: 5px;font-size: 12px;color: rgb(200, 200, 200);">${TimeAgo(posts[i].Date)}</p>
    </div>
  </div>
  ${posts[i].Text}<br>
  <center>
    ${postContent}
  </center>
  <div>
        <button onclick="if (this.className == 'like') {eel.actionOnPost(${posts[i].ID}, 'LIKE')(); this.className = 'liked'} else {eel.actionOnPost(${posts[i].ID}, 'DELETE')(); this.className = 'like'}" class="UI-Button ${liked}" style="font-size: 16; margin-rigth: 0; border-top-right-radius: 0px; border-bottom-right-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> ${likes}</button>
        <button onclick="if (this.className == 'like') {eel.actionOnPost(${posts[i].ID}, 'DISLIKE')(); this.className = 'disliked'} else {eel.actionOnPost(${posts[i].ID}, 'DELETE')(); this.className = 'like'}" class="UI-Button ${disliked}" style="font-size: 16; margin-left: 0;margin-right: 0; border-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-off"><line x1="2" y1="2" x2="22" y2="22"/><path d="M16.5 16.5 12 21l-7-7c-1.5-1.45-3-3.2-3-5.5a5.5 5.5 0 0 1 2.14-4.35"/><path d="M8.76 3.1c1.15.22 2.13.78 3.24 1.9 1.5-1.5 2.74-2 4.5-2A5.5 5.5 0 0 1 22 8.5c0 2.12-1.3 3.78-2.67 5.17"/></svg> ${dislikes}</button>
        <button onclick="postId = ${posts[i].ID}; loadComms();document.querySelector('.posts').style.filter = 'blur(10px)'; document.querySelector('#comments').className = 'Comments';" class="UI-Button comments" style="font-size: 16; margin-left: 0; border-top-left-radius: 0px; border-bottom-left-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-more"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg> ${comments}</button>
  </div>
</div>`;
  }
});
}

load_posts()
  
function onload() {
  function isMobile() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }

  if (isMobile()) {
    document.body.style.fontSize = "0.6875rem"
  }

  //eel.sync("getUpdates", navigator.userAgent, false)

  document.querySelector(".down-navbar").style.top = (window.innerHeight - 69) + "px"
  document.querySelector("#settings").style.height = (window.innerHeight - 69) + "px"
  document.querySelector("#music").style.height = (window.innerHeight - 300) + "px"
  document.querySelector("#comments").style.height = (window.innerHeight - 400) + "px"
  document.querySelector("#profile").style.height = (window.innerHeight - 155) + "px"

  document.querySelector("#music").style.marginLeft = (window.innerWidth - 620) + "px"
  document.querySelector("#musicPlayer").style.marginLeft = (window.innerWidth - 630) + "px"

  if (localStorage.getItem("SelectedTheme")) {
    for (let i = 0; i < Themes.length; i++) {
      if (Themes[i].name == localStorage.getItem("SelectedTheme")) {
        document.querySelector('#themeStyle').innerHTML = Themes[i].content
        document.querySelector('#themelnk').href = ""
      }
    }
  }

  eel.my_profile()(function(profile) {
  document.querySelector('.top-navbar').querySelector('button').querySelector('img').src = `https://elemsocial.com/Content/Avatars/${JSON.parse(profile).Avatar}`
  document.querySelector('.top-navbar').querySelector('button').querySelector('img').addEventListener("click", function() {
    loadProfile(JSON.parse(profile).Username)
  })

  var settings = document.querySelector('#settings')

  eel.load_offline_mode_settings()(function (results){
    if (results["music-save"]) {
      document.querySelector('#settings').querySelector("#saving-music").className = "activated"
    }
    if (results["last-posts-save"]) {
      document.querySelector('#settings').querySelector("#saving-last-posts").className = "activated"
    }
    if (results["my-profile-save"]) {
      document.querySelector('#settings').querySelector("#saving-photos").className = "activated"
    }
    if (results["sessions-save"]) {
      document.querySelector('#settings').querySelector("#saving-my-profile").className = "activated"
    }
    
  })

  settings.querySelector('#cover').src = "https://elemsocial.com/Content/Covers/" + JSON.parse(profile).Cover
  settings.querySelector('#avatar').src = "https://elemsocial.com/Content/Avatars/" + JSON.parse(profile).Avatar

  settings.querySelector('#ChangeUsername').querySelector('p').innerHTML = "@" + JSON.parse(profile).Username
  settings.querySelector('#ChangeMail').querySelector('p').innerHTML = JSON.parse(profile).Email
  eel.load_sessions()(function(sessions){
    if(sessions.status == "success") {
      settings.querySelector('#Sessions').querySelector('p').innerHTML = sessions.current_session.device
      var device_type = "Неизвесно"
      var device_img = "assets/anonymous.png"
      if (sessions.current_session.device_type == 1) {
        device_type = "Браузер"
        device_img = "assets/Google Chrome.png"
      } else if (sessions.current_session.device_type == 2) {
        device_type = "Android"
        device_img = "assets/Android.png"
      } else if (sessions.current_session.device_type == 3) {
        device_type = "IOS"
        device_img = "assets/Apple.png"
      } else if (sessions.current_session.device_type == 4) {
        device_type = "Windows"
        device_img = "assets/windows.png"
      }
      settings.querySelector('#session-menu').querySelector('#currentSession').querySelector('#Device').innerHTML = device_type
      settings.querySelector('#session-menu').querySelector('#currentSession').querySelector('#DeviceDescription').innerHTML = sessions.current_session.device
      settings.querySelector('#session-menu').querySelector('#currentSession').querySelector('img').src = device_img
      sessions.sessions.forEach((session) => {
        if (session.device_type == 0) {
          device_type = "Анонимная"
          device_img = "assets/anonymous.png"
        } else if (session.device_type == 1) {
          device_type = "Браузер"
          device_img = "assets/Google Chrome.png"
        } else if (session.device_type == 2) {
          device_type = "Android"
          device_img = "assets/Android.png"
        } else if (session.device_type == 3) {
          device_type = "IOS"
          device_img = "assets/Apple.png"
        } else if (session.device_type == 4) {
          device_type = "Windows"
          device_img = "assets/windows.png"
        }
        settings.querySelector('#session-menu').innerHTML += `
      <div id="otherSession">
          <div class="content">
              <img src="${device_img}">
              <p id="Device">${device_type}</p>
              <p id="DeviceDescription">${session.device}</p>
          </div>
      </div>`
      })
    }
  })
})



document.querySelector('#searcher').addEventListener("input", function() {
  document.querySelector('#searcherDIV').className = 'search'
  if(document.querySelector('#searcher').value == "") {
    document.querySelector('#searcherDIV').className = 'searchClosed'
    return
  }

  eel.search(document.querySelector('#searcher').value, "Users")(function(results) {
    document.querySelector('#searcherDIV').querySelector('div').innerHTML = ''
    for (let i = 0; i < results.Content.length; i++) {
      document.querySelector('#searcherDIV').querySelector('div').innerHTML += `
  <div class="Post1">
<div style="display: flex; align-items: center; gap: 10px; height: 50px;">
  <img src="https://elemsocial.com/Content/Avatars/${results.Content[i].Avatar}" alt="avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
    <div style="display: flex; flex-direction: column;">
    <button style="background-color: transparent; color: white; text-decoration: none; margin: 0; padding: 0; border: none; font-size: 16px; text-align: left; height: 23px;" 
            onclick="document.querySelector('#profile').className = 'profileClosed'; loadProfile('${results.Content[i].Username}'); document.querySelector('#searcherDIV').className = 'searchClosed';document.querySelector('.posts').style.filter = 'blur(10)';">
      ${results.Content[i].Name}
    </button>
    <p style="margin: 0px; color: rgba(250, 250, 250, 0.5); font-size: 14px;">
      ${results.Content[i].Subs} подписчиков • ${results.Content[i].Posts} постов
    </p>
  </div>
</div>
</div>`
    }
  })
})
}

function onscroll() {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 36) {
      load_posts()
    }
    
    // if (document.querySelector('#random').scrollLeft + document.querySelector('#new').clientWidth >= document.querySelector('#new').scrollWidth) {
    //   load_music()
    // }
    
    // if (document.querySelector('#favorite').scrollLeft + document.querySelector('#new').clientWidth >= document.querySelector('#new').scrollWidth) {
    //   load_music()
    // }
    
    // if (document.querySelector('#new').scrollLeft + document.querySelector('#new').clientWidth >= document.querySelector('#new').scrollWidth) {
    //     load_music();
    // }
}
window.addEventListener("scroll", () => {
  onscroll()
})

document.body.addEventListener("scroll", () => {
  document.querySelector(".down-navbar").style.top = (window.innerHeight - 80) + "px"
})

window.addEventListener("load", function() {
  onload()
})

function reload(silent=false) {
  load_posts()
  load_music()
  onload()
  if (!silent) {
    alert("Перезагрузка завершена")
  }
}

const favorite = document.getElementById("favorite");
const newM = document.getElementById("new");
const random = document.getElementById("random");

favorite.addEventListener("scroll", () => {
  if (favorite.scrollLeft + favorite.clientWidth >= favorite.scrollWidth) {
    load_music()
  }
});
newM.addEventListener("scroll", () => {
  if (newM.scrollLeft + newM.clientWidth >= newM.scrollWidth) {
    load_music()
  }
});
random.addEventListener("scroll", () => {
  if (random.scrollLeft + random.clientWidth >= random.scrollWidth) {
    load_music()
  }
});

eel.expose(show_notification)
function show_notification(image, name, action) {
  if ((image || name || action) === undefined) {
    image = "favicon.ico"
    name = "Проверка"
    action = "Проверка встроенных оповещений"
  }

  document.querySelector("#notification").querySelector("img").src = image
  document.querySelector("#notification").querySelector("#Name").innerHTML = name
  document.querySelector("#notification").querySelector("#ActionText").innerHTML = action

  document.querySelector("#notification").classList.toggle("show")
  document.querySelector("#notification").classList.toggle("closed")
  var oldBlur = document.querySelector(".posts").style.filter;
  if (!document.querySelector(".posts").style.filter == "blur(0)" || document.querySelector(".posts").style.filter == "") {
    document.querySelector(".posts").style.filter = "blur(3px)"
  }
  
  setTimeout(function() {
    document.querySelector("#notification").classList.toggle("show")
    document.querySelector("#notification").classList.toggle("closed")
    document.querySelector(".posts").style.filter = oldBlur
  }, 3000)
}
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
      var cover = "noMusicCover.jpg";
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
            player.querySelector("img").src = "noMusicCover.jpg"
          }
          document.querySelector("audio").addEventListener("loadedmetadata", function () {
            player.querySelector("input").max = document.querySelector("audio").duration
            document.querySelector("audio").play()
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

function load_music() {
  var indexF = document.querySelector('#music').querySelector('#favorite').length
  var indexN = document.querySelector('#music').querySelector('#new').length
  var indexR = document.querySelector('#music').querySelector('#random').length
  if((indexF || indexN || indexR) == null) {
    indexF = 0
    indexN = 0
    indexR = 0
  }
  //var index = 0
  eel.get_music("FAVORITES", indexF)(function(music) {
    for (let i = 0; i < music.length; i++) {
      var cover = "noMusicCover.jpg";
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
  })
  eel.get_music("LATEST", indexN)(function(music) {
    for (let i = 0; i < music.length; i++) {
      var cover = "noMusicCover.jpg";
      if (music[i].Cover) {
        cover = "https://elemsocial.com/Content/Simple/" + music[i].Cover.simple_image
      }
      document.querySelector('#music').querySelector('#new').innerHTML += `
      <div class="MusicItem" id="${music[i].ID}">
        <img src="${cover}"><br>
        ${substr12(music[i].Title)}<br>
        <p style="font-size: 12px;font-family: 'SF Pro Display Bold', Arial, Helvetica, sans-serif;color: rgb(150, 150, 150);">${substr12(music[i].Artist)}</p>
      </div>`
    }
  })
  eel.get_music("RANDOM", indexR)(function(music) {
    for (let i = 0; i < music.length; i++) {
      var cover = "noMusicCover.jpg";
      if (music[i].Cover) {
        cover = "https://elemsocial.com/Content/Simple/" + music[i].Cover.simple_image
      }
      document.querySelector('#music').querySelector('#random').innerHTML += `
      <div class="MusicItem" id="${music[i].ID}">
        <img src="${cover}"><br>
        ${substr12(music[i].Title)}<br>
        <p style="font-size: 12px;font-family: 'SF Pro Display Bold', Arial, Helvetica, sans-serif;color: rgb(150, 150, 150);">${substr12(music[i].Artist)}</p>
      </div>`
    }
  })
  setTimeout(function() {
    document.querySelectorAll(".MusicItem").forEach(item => {
      item.addEventListener("click", function() {
        eel.load_song(item.id)(function(song){
          document.querySelector("audio").id = item.id
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
          var player = document.querySelector("#musicPlayer")
          player.querySelector("p").innerHTML = substr43(song.Title + " - " + song.Artist)
          if (song.Cover) {
            player.querySelector("img").src = "https://elemsocial.com/Content/Simple/" + song.Cover.simple_image
          } else {
            player.querySelector("img").src = "noMusicCover.jpg"
          }
          document.querySelector("audio").addEventListener("loadedmetadata", function () {
            player.querySelector("input").max = document.querySelector("audio").duration
            document.querySelector("audio").play()
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
  }, 1000)
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

function send(type) {
  document.querySelector('#fileInput').click()
  if (type == "avatar") {
    const fileInput = document.getElementById('fileInput');
      const file = fileInput.files[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();

      reader.onload = async function(event) {
        const fileContent = event.target.result;
        const fileName = file.name;

        await eel.sendAvatar(fileName, fileContent)(function() {
          onload()
        });
      };

      reader.readAsDataURL(file); 
  }
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
      avatar = "noUserAvatar.png"
    }
    if (profiledata.Cover == null) {
      cover = "noUserCover.png"
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
            <img src="https://elemsocial.com/Content/Posts/Images/${JSON.parse(post.Content).Image.file_name}" alt="Photo" style="position: relative;margin-top: 19px;width: 460px; height: 300px; border-radius: 10px; filter: blur(10px);top: -300px;z-index: 11;"`
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
      avatar = "noUserAvatar.png"
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
  ${addBreaks(posts[i].Text, 53)}<br>
  <center>
    ${postContent}
  </center>
  <div>
        <button onclick="if (this.className == 'like') {eel.actionOnPost(${posts[i].ID}, 'LIKE')(); this.className = 'liked'} else {eel.actionOnPost(${posts[i].ID}, 'DELETE')(); this.className = 'like'}" class="UI-Button ${liked}" style="font-size: 16; margin-rigth: 0; border-top-right-radius: 0px; border-bottom-right-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> ${likes}</button>
        <button onclick="eel.actionOnPost(${posts[i].ID}, 'DISLIKE')(); this.className = 'disliked' class="UI-Button ${disliked}" style="font-size: 16; margin-left: 0;margin-right: 0; border-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-off"><line x1="2" y1="2" x2="22" y2="22"/><path d="M16.5 16.5 12 21l-7-7c-1.5-1.45-3-3.2-3-5.5a5.5 5.5 0 0 1 2.14-4.35"/><path d="M8.76 3.1c1.15.22 2.13.78 3.24 1.9 1.5-1.5 2.74-2 4.5-2A5.5 5.5 0 0 1 22 8.5c0 2.12-1.3 3.78-2.67 5.17"/></svg> ${dislikes}</button>
        <button onclick="postId = ${posts[i].ID}; loadComms();document.querySelector('.posts').style.filter = 'blur(10px)'; document.querySelector('#comments').className = 'Comments';" class="UI-Button comments" style="font-size: 16; margin-left: 0; border-top-left-radius: 0px; border-bottom-left-radius: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-more"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg> ${comments}</button>
  </div>
</div>`;
  }
});
}

load_posts()
  
function onload() {
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
    } else {
      console.log(sessions)
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

window.addEventListener("load", function() {
  onload()
})

function reload() {
  load_posts()
  load_music()
  onload()
  onscroll()
  alert("Перезагрузка завершена")
}
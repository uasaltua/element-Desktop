var postId = 0 

function loadComms() { 
  eel.load_comments(postId)(function(comments) {
    document.querySelector("#comments").querySelector("div").innerHTML = ''
    for (let i = 0; i < comments.length; i++) {
      document.querySelector("#comments").querySelector("div").innerHTML += `
      <div class="Post1">
        <div style="margin-bottom: 10px;display: flex;">
          <img src="https://elemsocial.com/Content/Avatars/${comments[i].Avatar}" alt="avatar">
          <div style="display: flex;flex-direction: column;margin: 0;">
            <a style="color: white; text-decoration: none;margin: 0;" href="/profiles.html?username=${comments[i].Username}">${comments[i].Name}</a>
            <p>${TimeAgo(comments[i].Date)}</p>
          </div>
        </div>
        ${comments[i].Text}
      </div>`
    }
  })
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

function substr12(text) {
  if (text.length > 12) {
    return text.substring(0, 10) + "...";
  }
  return text
}

function substr78(text) {
  if (text.length > 78) {
    return text.substring(0, 75) + "...";
  }
  return text
}

function load_music() {
  var indexF = document.querySelector('#music').querySelector('#favorite').length
  var indexN = document.querySelector('#music').querySelector('#new').length
  var indexR = document.querySelector('#music').querySelector('#random').length
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
          document.querySelector("audio").src = "https://elemsocial.com/Content/Music/Files/" + song.File
          var player = document.querySelector("#musicPlayer")
          player.querySelector("p").innerHTML = substr78(song.Title + " - " + song.Artist)
          if (song.Cover) {
            player.querySelector("img").src = "https://elemsocial.com/Content/Simple/" + song.Cover.simple_image
          } else {
            player.querySelector("img").src = "noMusicCover.jpg"
          }
          document.querySelector("audio").addEventListener("loadedmetadata", function () {
            player.querySelector("input").max = document.querySelector("audio").duration
            document.querySelector("audio").play()
          })

          document.querySelector("audio").addEventListener("timeupdate", function () {
            player.querySelector("input").value = document.querySelector("audio").currentTime
          })
        })
      })
    });
  }, 1000)
}

function loadProfile(id) {
  eel.get_profile(id)(function(profiledata) {
    var profile = document.querySelector("#profile")

    profile.querySelector("#cover").src = "https://elemsocial.com/Content/Covers/" + profiledata.Cover
    profile.querySelector("#avatar").src = "https://elemsocial.com/Content/Avatars/" + profiledata.Avatar
    profile.querySelector("#username").innerHTML = "@" + profiledata.Username

    profile.querySelector("#subscriptions").innerHTML = profiledata.Subscriptions + '<p style="font-size: 11px;color: gray;margin-top: 3px;">Подписок</p>'
    profile.querySelector("#subscribers").innerHTML = profiledata.Subscribers + '<p style="font-size: 11px;color: gray;margin-top: 3px;">Подписчиков</p>'
    profile.querySelector("#posts").innerHTML = profiledata.Posts + '<p style="font-size: 11px;color: gray;margin-top: 3px;">Постов</p>'

    profile.querySelector("#description").innerHTML = profiledata.Description

    profile.className = "profile"
  })
}

function load_posts() {
var index = document.querySelectorAll('.Post').length - 1
eel.load_posts(index)(function(posts) {
  posts = JSON.parse(posts);

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
    
    var postContent = ""

    if (posts[i].Content) {
      if (JSON.parse(posts[i].Content).Image) {
        postContent = `<img src="https://elemsocial.com/Content/Posts/Images/${JSON.parse(posts[i].Content).Image.file_name}" alt="Photo" style="margin-top: 19px;width: ${JSON.parse(posts[i].Content).Image.width}px; max-width: 600px;height: ${JSON.parse(posts[i].Content).Image.height}px; max-height: 300px; border-radius: 10px;">`
      }
    }
    document.querySelector(".posts").innerHTML += `
<div class="Post">
  <div style="margin-bottom: 10px;display: flex;">
    <img src="https://elemsocial.com/Content/Avatars/${posts[i].Avatar}" alt="avatar">
    <div style="display: flex;flex-direction: column;margin: 0;">
      <button style="color: white; background-color: transparency;margin: 0;padding: 0;height: 15px;" onclick="loadProfile('${posts[i].Username}')">${posts[i].Name}</button>
      <p style="font-size: 12px;color: rgb(200, 200, 200);">${TimeAgo(posts[i].Date)}</p>
    </div>
  </div>
  ${posts[i].Text}<br>
  ${postContent}
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

window.addEventListener("load", function() {
  eel.my_profile()(function(profile) {
    document.querySelector('.top-navbar').querySelector('button').querySelector('img').src = `https://elemsocial.com/Content/Avatars/${JSON.parse(profile).Avatar}`
    document.querySelector('.top-navbar').querySelector('button').onclick = function(){
      loadProfile(profile.Username)
    }
  })
  
  window.addEventListener("scroll", () => {
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
  })

  document.querySelector('#searcher').addEventListener("input", function() {
    document.querySelector('#searcherDIV').className = 'search'
    if(document.querySelector('#searcher').value == "") {
      document.querySelector('#searcherDIV').className = 'searchClosed'
    }

    eel.search(document.querySelector('#searcher').value, "Users")(function(results) {
      document.querySelector('#searcherDIV').querySelector('div').innerHTML = ''
      for (let i = 0; i < results.Content.length; i++) {
        document.querySelector('#searcherDIV').querySelector('div').innerHTML += `
        
    <div class="Post1">
      <img src="https://elemsocial.com/Content/Avatars/${results.Content[i].Avatar}" alt="avatar">
      <div style="display: flex;flex-direction: column;margin: 0;">
        <a style="color: white; text-decoration: none;margin: 0;" href="/profiles.html?Username=${results.Content[i].Username}">${results.Content[i].Name}</a>
        ${results.Content[i].Subs} подписчиков • ${results.Content[i].Posts} постов
      </div>
    </div>`
      }
    })
  })
})
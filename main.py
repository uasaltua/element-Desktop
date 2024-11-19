import os
try:
    import eel, json
    from api import element
    from threading import Thread
    from time import sleep
    import requests
except:
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install eel") 
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install pillow") 
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install io") 
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install plyer")
    import eel, json
    from api import element
    from threading import Thread
    from time import sleep
    import requests

eel.init('static/web')

page = 'index.html'
s_key = False

def notifications():
    while True:
        element.notifications_get(s_key)
        sleep(10)

if os.path.exists("static/userdata.json"):
    page = "home.html"
    with open("static/userdata.json", encoding="UTF-8") as f:
        s_key = json.loads(f.read())["S-KEY"]
    Thread(target=notifications).start()

@eel.expose
def auth(email, password):
    global s_key
    status, response = element.auth(email, password)
    if status:
        s_key = response
        Thread(target=notifications).start()
        return json.dumps({"status": "success", "Location": "/home.html"})
    return json.dumps({"status": "error", "text": response})

@eel.expose
def load_posts(start_index):
    return json.dumps(element.get_posts(s_key, start_index))

@eel.expose
def actionOnPost(id, type):
    requests.post(f'https://elemsocial.com/System/API/PostInteraction.php?F=' + type, headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"PostID": id})

@eel.expose
def get_music(type, start_index):
    req = requests.post(f'https://elemsocial.com//System/API/LoadSongs.php?F=' + type, headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"StartIndex": start_index}).json()
    return req

@eel.expose
def new_post(text):
    element.new_post(s_key, text)

@eel.expose
def my_profile():
    req = requests.get(f'https://elemsocial.com/System/API/Connect.php', headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}).json()
    return json.dumps(req)

@eel.expose
def send_comment(id, text):
    requests.post(f"https://elemsocial.com/System/API/PostInteraction.php?F=POST_COMMENT", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"PostID": id, "Text": text})

@eel.expose
def load_comments(id):
    req = requests.post(f"https://elemsocial.com/System/API//PostInteraction.php?F=LOAD_COMMENTS", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"PostID": id}).json()
    return req

@eel.expose
def search(val, category):
    req = requests.post(f"https://elemsocial.com/System/API/Search.php", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"SearchVal": val, "Category": category}).json()
    return req

@eel.expose
def load_song(id):
    req = requests.post(f"https://elemsocial.com/System/API/LoadSong.php", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"SongID": id}).json()
    return req

try:
    eel.start(page, size=(660, 934))
except:
    eel.start(page, mode='edge', size=(660, 934))
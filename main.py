import os
try:
    import eel, json
    from api import element
    from threading import Thread
    from time import sleep
    import requests
    from pystray import Icon, MenuItem, Menu
    from PIL import Image
    import sys
    import shutil
except:
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install eel") 
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install pillow") 
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install io") 
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install plyer")
    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install pystray")
    import eel, json
    from api import element
    from threading import Thread
    from time import sleep
    import requests
    from pystray import Icon, MenuItem, Menu
    import shutil

eel.init('static/web')

page = 'index.html'
s_key = False
enableNotifications = True

def notifications():
    while enableNotifications:
        element.notifications_get(s_key)
        sleep(10)

def add_to_tray():
    def on_click(icon, item):
        global enableNotifications
        enableNotifications = False
        icon.update_menu()
    def open():
        try:
            eel.start(page, size=(660, 934), block=True)
        except OSError:
            eel.start(page, mode='edge', size=(660, 934), block=True)  
        icon.update_menu()
    def close(icon, item):
        icon.stop()
    icon = Icon(
        name="Element Desktop",
        icon=Image.open("./static/logo.ico"),
        title="Element Desktop",
        menu=Menu(
            MenuItem("Открыть", open),
            MenuItem(f"Уведомления {'включены' if enableNotifications else 'выключены'}", on_click),
            MenuItem("Закрыть", close)
        )
    )
    icon.run()

tray = Thread(target=add_to_tray)

if os.path.exists("static/userdata.json"):
    page = "home.html"
    with open("static/userdata.json", encoding="UTF-8") as f:
        s_key = json.loads(f.read())["S-KEY"]
    Thread(target=notifications, daemon=True).start()
    tray.start()

@eel.expose
def auth(email, password):
    global s_key
    status, response = element.auth(email, password)
    if status:
        s_key = response
        Thread(target=notifications, daemon=True).start()
        tray.start()
        shutil.copy("static/Element Desktop.lnk", os.environ['USERPROFILE'] + "\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs")
        return json.dumps({"status": "success", "Location": "/home.html"})
    return json.dumps({"status": "error", "text": response})

@eel.expose
def get_profile(username):
    return requests.get("https://elemsocial.com/System/API/Profile.php?Username=" + username).json()

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

@eel.expose
def like(id):
    requests.post(f'https://elemsocial.com/System/API/MusicInteraction.php?F=LIKE', headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"SongID": id})

try:
    eel.start(page, size=(660, 934), block=True)
except OSError:
    eel.start(page, mode='edge', size=(660, 934), block=True)  
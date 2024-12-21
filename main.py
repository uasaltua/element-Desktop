import os

try:

    import eel, json

    from threading import Thread

    from time import sleep, time

    import requests

    from pystray import Icon, MenuItem, Menu

    from PIL import Image

    import sys

    import shutil

    import plyer

    from win10toast_click import ToastNotifier

    from pypresence import Presence

    from api import element, Discord_API

    #from update import updater

except ModuleNotFoundError:

    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install eel")

    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install pillow")

    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install win10toast-click")

    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install plyer")

    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install pystray")

    os.system("%userprofile%\\AppData\\Local\\Programs\\Python\\Python38\\python.exe -m pip install pypresence")



    os.system("pip install eel")

    os.system("pip install pillow")

    os.system("pip install win10toast-click")

    os.system("pip install plyer")

    os.system("pip install pystray")

    os.system("pip install pypresence")

    import eel, json

    from threading import Thread

    from time import sleep, time

    import requests

    from pystray import Icon, MenuItem, Menu

    from PIL import Image

    import sys

    import shutil

    import plyer

    from win10toast_click import ToastNotifier

    from pypresence import Presence

    from api import element, Discord_API

    #from update import updater



eel.init('static/web')



page = 'index.html'

s_key = False

enableNotifications = True

notifier = ToastNotifier()

rpc = Presence("1210698410257027162")

try:
    rpc.connect()
except:
    class rpc:
        def update(*args, **kwargs):
            pass



def notifications():

    while enableNotifications:

        element.notifications_get(s_key, notifier, eel)

        sleep(10)



def add_to_tray():

    def on_click(icon, item):

        global enableNotifications

        enableNotifications = False

        icon.update_menu()

    def open():

        os.system(f"start {os.environ['appdata']}\\..\\Local\\Programs\\element-client\\ElementDesktop.exe")

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
    response = element.get_posts(s_key, rpc, start_index)
    return json.dumps(response)



@eel.expose

def actionOnPost(id, type):

    requests.post(f'https://elemsocial.com/System/API/PostInteraction.php?F=' + type, headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"PostID": id})



@eel.expose

def get_music(type, start_index):
    try:
        req = requests.post(f'https://elemsocial.com/System/API/LoadSongs.php?F=' + type, headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"StartIndex": start_index})
    except:
        class podmena:
            def __init__(self):
                self.status_code = 501
        req = podmena()

    if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

        plyer.notification.notify(

            title='Музыка',

            message=f"Не удалось загрузить {type} музыку (status_code {req.status_code})",

            app_name='element',

            app_icon="./static/logo.ico",

        )

        with open("static/userdata.json") as f:
            data = json.loads(f.read())

        if data["Offline-mode"]["music-save"]:
            with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
                data = json.loads(f.read())
            return data["Music25"][type]

        return

    with open("static/userdata.json") as f:
        data = json.loads(f.read())

    if data["Offline-mode"]["music-save"]:
        with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
            data = json.loads(f.read())
        
        data["Music25"][type] = req.json()

        with open("temp/offline-mode.json", mode="w", encoding="UTF-8") as f:
            f.write(json.dumps(data, indent=4))

    return req.json()



@eel.expose

def new_post(text):

    element.new_post(s_key, text)

@eel.expose
def load_offline_mode_settings():
    with open("static/userdata.json") as f:
        data = json.loads(f.read())
    
    da = {}
    da["music-save"] = data["Offline-mode"]["music-save"]
    da["last-posts-save"] = data["Offline-mode"]["last-posts-save"]
    da["my-profile-save"] = data["Offline-mode"]["my-profile-save"]
    da["sessions-save"] = data["Offline-mode"]["sessions-save"]
    return da

@eel.expose
def setOffline(type, mode):
    with open("static/userdata.json") as f:
        data = json.loads(f.read())

    data["Offline-mode"][type] = not data["Offline-mode"][type]

    with open("static/userdata.json", mode="w") as f:
        f.write(json.dumps(data))

@eel.expose

def my_profile():

    try:
        req = requests.get(f'https://elemsocial.com/System/API/Connect.php', headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'})
    except:
        class podmena:
            def __init__(self):
                self.status_code = 501
        req = podmena()

    if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

        plyer.notification.notify(

            title='Профили',

            message=f"Не удалось загрузить ваш профиль (status_code {req.status_code})",

            app_name='element',

            app_icon="./static/logo.ico",

        )
        with open("static/userdata.json") as f:
            data = json.loads(f.read())

        if data["Offline-mode"]["my-profile-save"]:
            with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
                data = json.loads(f.read())
            return json.dumps(data["MyProfile"])

        return

    with open("static/userdata.json", mode="r", encoding="UTF-8") as f:
        data = json.loads(f.read())
    
    if data["Offline-mode"]["my-profile-save"]:
        with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
            data = json.loads(f.read())
        
        data["MyProfile"] = req.json()

        with open("temp/offline-mode.json", mode="w", encoding="UTF-8") as f:
            f.write(json.dumps(data, indent=4))

    return json.dumps(req.json())



@eel.expose

def send_comment(id, text):

    requests.post(f"https://elemsocial.com/System/API/PostInteraction.php?F=POST_COMMENT", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"PostID": id, "Text": text})



@eel.expose

def load_comments(id):

    req = requests.post(f"https://elemsocial.com/System/API//PostInteraction.php?F=LOAD_COMMENTS", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"PostID": id})

    if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

        plyer.notification.notify(

            title='Комментарии',

            message=f"Не удалось загрузить комментарии (status_code {req.status_code})",

            app_name='element',

            app_icon="./static/logo.ico",

        )

        return

    return req.json()



@eel.expose

def search(val, category):

    req = requests.post(f"https://elemsocial.com/System/API/Search.php", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"SearchVal": val, "Category": category})

    if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

        plyer.notification.notify(

            title='Поиск',

            message=f"Не удалось произвести поиск (status_code {req.status_code})",

            app_name='element',

            app_icon="./static/logo.ico",

        )

        return

    return req.json()



@eel.expose

def load_song(id):
    try:
        req = requests.post(f"https://elemsocial.com/System/API/LoadSong.php", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"SongID": id})
    except:
        class podmena:
            def __init__(self):
                self.status_code = 501
            def json(*args): pass
        req = podmena()

    if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

        plyer.notification.notify(

            title='Загрузка музыки',

            message=f"Не удалось загрузить музыку (status_code {req.status_code})",

            app_name='element',

            app_icon="./static/logo.ico",

        )
        with open("static/userdata.json", mode="r", encoding="UTF-8") as f:
            data = json.loads(f.read())

        if data["Offline-mode"]["music-save"]:
            with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
                data = json.loads(f.read())["Music25"]["Files"]

            for song in data:
                if song["ID"] == int(id):
                    da = {
                        "Offline": True,
                        "File": "/OfflineMusic/" + song["Origin"]["File"],
                        "Artist": song["Origin"]["Artist"],
                        "Title": song["Origin"]["Title"],
                        "Liked": song["Origin"]["Liked"]
                    }
                    return json.loads(json.dumps(da))
        return

    #Discord_API.update("https://elemsocial.com/Content/Simple/" + req.json()["Cover"]["simple_image"])

    rpc.update(

        details=req.json()["Title"],

        state=req.json()["Artist"],

        large_image="music",

        small_image="logo",

        small_text="Element desktop"

        #start_timestamp=int(time.time())

    )

    with open("static/userdata.json", mode="r", encoding="UTF-8") as f:
        data = json.loads(f.read())
    
    da = req.json()
    da["Offline"] = False
    if data["Offline-mode"]["music-save"]:
        with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
            data = json.loads(f.read())
        
        flag = True
        for file in data["Music25"]["Files"]:
            if int(file["ID"]) == int(id):
                flag = False
        if flag:
            data["Music25"]["Files"].append({"ID": da["ID"], "Path": f"/OfflineMusic/{da['File']}", "Origin": da})
            file = requests.get("https://elemsocial.com/Content/Music/Files/" + da['File']).content
            with open(f"static/web/OfflineMusic/{da['File']}", mode="wb") as f:
                f.write(file)

        with open("temp/offline-mode.json", mode="w", encoding="UTF-8") as f:
            f.write(json.dumps(data, indent=4))

    return json.loads(json.dumps(da))



@eel.expose

def load_UserPosts(id, start_index=0):

    req = requests.post(f"https://elemsocial.com/System/API/LoadPosts.php?F=USER", headers={"S-KEY": s_key}, data={"target_id": int(id), "target_type": 0, "StartIndex": start_index})

    if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

        plyer.notification.notify(

            title='Посты пользователя',

            message=f"Не удалось загрузить посты пользователя (status_code {req.status_code})",

            app_name='element',

            app_icon="./static/logo.ico",

        )

        return

    try:

        return req.json()

    except:

        print(req.content)



@eel.expose

def load_sessions():
    try:
        req = requests.post(f"https://api.elemsocial.com/settings/load_sessions", headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'})
    except:
        class podmena:
            def __init__(self):
                self.status_code = 501
        req = podmena()

    if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

        plyer.notification.notify(

            title='Сессии',

            message=f"Не удалось загрузить сессии (status_code {req.status_code})",

            app_name='element',

            app_icon="./static/logo.ico",

        )

        with open("static/userdata.json", mode="r", encoding="UTF-8") as f:
            data = json.loads(f.read())
        
        if data["Offline-mode"]["sessions-save"]:
            with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
                data = json.loads(f.read())
            
            return data["Sessions"]

        return

    try:
        with open("static/userdata.json", mode="r", encoding="UTF-8") as f:
            data = json.loads(f.read())
            
        if data["Offline-mode"]["sessions-save"]:
            with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
                data = json.loads(f.read())
                
            data["Sessions"] = req.json()

            with open("temp/offline-mode.json", mode="w", encoding="UTF-8") as f:
                f.write(json.dumps(data, indent=4))
        return req.json()

    except:

        print(req.content)



@eel.expose

def like(id):

    requests.post(f'https://elemsocial.com/System/API/MusicInteraction.php?F=LIKE', headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'}, data={"SongID": id})


@eel.expose
def sendAvatar(filename, content):
    req = requests.post(f"https://api.elemsocial.com/settings/change_profile", data={"avatar": content}, headers={"S-KEY": s_key, 'User-Agent':'ElementAPI'})

    if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():
        plyer.notification.notify(
            title='Сессии',
            message=f"Не удалось загрузить сессии (status_code {req.status_code})",
            app_name='element',
            app_icon="./static/logo.ico",
        )
        print(req.content)
        return

    try:
        return req.json()
    except:
        print(req.content)

@eel.expose
def redirect():
    return f"/{page}"

#updater()

print("Консоль элемент клиента")

Thread(target=eel.start, args=(page), kwargs={"mode": None}, daemon=True).start()

import sys, os
from threading import Thread
import win32com.client

def create_shortcut(target, shortcut_path):    
    shell = win32com.client.Dispatch("WScript.Shell")
    shortcut = shell.CreateShortcut(shortcut_path)
    shortcut.TargetPath = target
    shortcut.WorkingDirectory = os.path.dirname(target)
    shortcut.Description = "Element desktop nogui"
    shortcut.Arguments = "--no-gui"
    shortcut.save()

target = os.path.abspath(f"{os.environ['appdata']}\\Local\\Programs\\element-client\\ElementDesktop.exe")
shortcut_path = os.path.join(os.environ['USERPROFILE'], 
                             "AppData", 
                             "Roaming", 
                             "Microsoft", 
                             "Windows", 
                             "Start Menu", 
                             "Programs", 
                             "Startup", 
                             "Element.lnk")

try:
    if not sys.argv[0] == "--no-gui":
        if not sys.argv[1] == "--no-gui":
            if os.path.exists(f"{os.environ['appdata']}\\..\\Local\\Programs\\element-client\\ElementDesktop.exe"):
                os.system(f"start {os.environ['appdata']}\\..\\Local\\Programs\\element-client\\ElementDesktop.exe")
                create_shortcut(target, shortcut_path)
            else:
                os.system("start static/ElementDesktop.exe")
except:
    if os.path.exists(f"{os.environ['appdata']}\\..\\Local\\Programs\\element-client\\ElementDesktop.exe"):
        os.system(f"start {os.environ['appdata']}\\..\\Local\\Programs\\element-client\\ElementDesktop.exe")
        create_shortcut(target, shortcut_path)
    else:
        os.system("start static/ElementDesktop.exe")
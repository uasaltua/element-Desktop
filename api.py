import requests

import plyer

import json

from PIL import Image

from io import BytesIO

from pypresence import Presence



status_codes = {522: "Время подключения истекло\nСкорее всего сервера elemsocial.com находятся под DDoS аттакой повторите попытку позже", 404: "Страница не найдена\nВ некоторых случаях тоже может означать что сервера elemsocial.com находятся под DDoS аттакой"}



class element:

    def getelm(list: dict, element):

        if not list.get(element) == None:

            return list.get(element)

        return False



    def auth(email, password):

        req = requests.post(f'https://api.elemsocial.com/auth/login', headers={'User-Agent':'ElementAPI'}, data={'email': email, 'password': password, "device_type": "4", "device": "element Desktop 1.0"})



        respond = ""

        if not req.status_code == 200:

            if element.getelm(status_codes, req.status_code):

                respond = element.getelm(status_codes, req.status_code)

            else:

                respond = f"Неизвестная ошибка: {req.status_code}"



        if "<!DOCTYPE html>" in req.content.decode():

            req = {"status": "error", "text": "elemsocial.com Сейчас не доступен (Был получен ответ от CloudFlare)"}

        else:

            req = req.json()



        if req["status"] == "error":

            respond = req["text"]



        if req["status"] == "success":

            respond == "Успешно"

        

        plyer.notification.notify(

            title='Авторизация',

            message=respond,

            app_name='element',

            app_icon="./static/logo.ico",

        )



        if req["status"] == "success":

            with open("static/userdata.json", "w", encoding="UTF-8") as f:

                f.write(json.dumps({"S-KEY": req["S_KEY"], "Offline-mode": {"music-save": True, "last-posts-save": True, "my-profile-save": True, "sessions-save": True}}))



            return True, req["S_KEY"]

        return False, False

    

    def new_post(S_KEY:str, text:str, *, files=False, clearMetaData=False) -> bool:

        req = requests.post(f'https://elemsocial.com/System/API/AddPost.php', headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}, data={"Text": text, "ClearMetadataIMG": clearMetaData})

        if not req.status_code == 200:

            return False

        return True



    def get_posts(S_KEY:str, rpc, start_index:int=0):
        try:
            req = requests.post(f'https://elemsocial.com/System/API/LoadPosts.php?F=LATEST', headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}, data={"StartIndex": start_index})
        except:
            class podmena:
                def __init__(self):
                    self.status_code = 501
            req = podmena()

        if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower() or req.content.decode() == "":

            plyer.notification.notify(

                title='Загрузка постов',

                message="Не удалось загрузить посты",

                app_name='element',

                app_icon="./static/logo.ico",

            )
            with open("static/userdata.json") as f:
                data = json.loads(f.read())

            if data["Offline-mode"]["last-posts-save"]:
                with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
                    data = json.loads(f.read())
                return data["LastPosts25"]

            return False

        rpc.update(

            #state="",

            details="Просматривает посты",

            large_image="logo",

            #small_image="play_icon",

        )

        with open("static/userdata.json") as f:
            data = json.loads(f.read())

        if data["Offline-mode"]["last-posts-save"]:
            with open("temp/offline-mode.json", mode="r", encoding="UTF-8") as f:
                data = json.loads(f.read())

            data["LastPosts25"] = req.json()

            with open("temp/offline-mode.json", mode="w", encoding="UTF-8") as f:
                f.write(json.dumps(data, indent=4))

        return req.json()



    def notifications_get(S_KEY, notifier, eel):

        try:
            req = requests.get(f"https://elemsocial.com/System/API/Notifications.php?F=CHECK", headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'})
        except:
            class podmena:
                def __init__(self):
                    self.status_code = 501
            req = podmena()

        if not req.status_code == 200:

            return False

        if not req.content.decode() == "" and int(req.content.decode()) >= 1:

            allnotifys = requests.post(f"https://elemsocial.com/System/API/Notifications.php?F=GET", data={"StartIndex": "0"}, headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}).json()

            for i in range(0, int(req.content.decode())):

                

                respond = ""

                if allnotifys[i].get("Action") == "ProfileSubscribe":

                    respond = "Подписывается на вас"

                    def callback():

                        req = requests.post(f"https://elemsocial.com/System/API/Search.php", headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}, data={"SearchVal": allnotifys[i]["Name"], "Category": "Users"})

                        if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

                            plyer.notification.notify(

                                title='Поиск',

                                message=f"Не удалось произвести поиск (status_code {req.status_code})",

                                app_name='element',

                                app_icon="./static/logo.ico",

                            )

                            return

                        username = "uasalt"

                        for user in req.json()["Content"]:

                            if user["Avatar"] == allnotifys[i]["Avatar"]:

                                username = user["Username"]

                        eel.loadProfile(username)()

                elif allnotifys[i].get("Action") == "PostLike":

                    respond = "Ставит лайк на пост"

                    def callback():

                        req = requests.post(f"https://elemsocial.com/System/API/Search.php", headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}, data={"SearchVal": allnotifys[i]["Name"], "Category": "Users"})

                        if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

                            plyer.notification.notify(

                                title='Поиск',

                                message=f"Не удалось произвести поиск (status_code {req.status_code})",

                                app_name='element',

                                app_icon="./static/logo.ico",

                            )

                            return

                        username = "uasalt"

                        for user in req.json()["Content"]:

                            if user["Avatar"] == allnotifys[i]["Avatar"]:

                                username = user["Username"]

                        eel.loadProfile(username)()

                elif allnotifys[i].get("Action") == "PostComment":

                    respond = f'Комментирует ваш пост "{json.loads(allnotifys[i].get("Content"))["Text"]}"'

                    def callback():

                        req = requests.post(f"https://elemsocial.com/System/API/Search.php", headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}, data={"SearchVal": allnotifys[i]["Name"], "Category": "Users"})

                        if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

                            plyer.notification.notify(

                                title='Поиск',

                                message=f"Не удалось произвести поиск (status_code {req.status_code})",

                                app_name='element',

                                app_icon="./static/logo.ico",

                            )

                            return

                        username = "uasalt"

                        for user in req.json()["Content"]:

                            if user["Avatar"] == allnotifys[i]["Avatar"]:

                                username = user["Username"]

                        eel.loadProfile(username)()

                elif allnotifys[i].get("Action") == "PostDislike":

                    respond = f'Ставит дизлайк на пост'

                    def callback():

                        req = requests.post(f"https://elemsocial.com/System/API/Search.php", headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}, data={"SearchVal": allnotifys[i]["Name"], "Category": "Users"})

                        if not req.status_code == 200 or "<!DOCTYPE html>".lower() in req.content.decode().lower():

                            plyer.notification.notify(

                                title='Поиск',

                                message=f"Не удалось произвести поиск (status_code {req.status_code})",

                                app_name='element',

                                app_icon="./static/logo.ico",

                            )

                            return

                        username = "uasalt"

                        for user in req.json()["Content"]:

                            if user["Avatar"] == allnotifys[i]["Avatar"]:

                                username = user["Username"]

                        eel.loadProfile(username)()

                else:

                    respond = f'Не удалось определить тип'



                icoPath = "static/logo.ico"

                if allnotifys[i].get("Avatar"):

                    element.convert_png_to_ico(requests.get("https://elemsocial.com/Content/Avatars/" + allnotifys[i].get("Avatar")).content)

                    icoPath = "temp/Avatar.ico"

                try:

                    notifier.show_toast(

                        f'{allnotifys[i]["Name"]} ',                 # Заголовок

                        respond,                                     # Сообщение

                        icon_path="static/logo.ico",                 # Путь к иконке (если нужно)

                        duration=10,                                 # Время отображения в секундах

                        threaded=True,                               # Потоковое уведомление

                        callback_on_click=callback                   # Обработчик клика

                    )

                except:

                    plyer.notification.notify(

                        title=f'{allnotifys[i]["Name"]} ',

                        message=respond,

                        app_name='element',

                        app_icon=icoPath,

                    )

    

    def convert_png_to_ico(bytes):

        image = Image.open(BytesIO(bytes))

        image.save("temp/Avatar.ico", format="ICO")



class Discord_API:

    token = "А хуй вам"

    client_id = "1210698410257027162"



    headers = {

        "Authorization": f"Bot {token}",

        "Content-Type": "application/json"

    }



    def delete_image(image_name):

        url = f"https://discord.com/api/v10/applications/{Discord_API.client_id}/assets/{image_name}"

        response = requests.delete(url, headers=Discord_API.headers)

        if response.status_code == 200:

            print("Изображение удалено успешно.")

        else:

            print("Ошибка при удалении изображения:", response.text)



    def upload_image(image_path, image_name):

        url = f"https://discord.com/api/v10/applications/{Discord_API.client_id}/assets"

        

        with open(image_path, 'rb') as file:

            files = {'file': (image_name, file)}

            response = requests.post(url, headers=Discord_API.headers, files=files)

        

        if response.status_code == 200:

            print("Изображение загружено успешно.")

        else:

            print("Ошибка при загрузке изображения:", response.text)



    def update(url):

        if not url == None:

            content = requests.get(url).content

            path = "temp/music_cover.png"

            with open("temp/music_cover.png", mode="wb") as f:

                f.write(content)

        else:

            path = "static/noMusicCover.jpg"



        Discord_API.delete_image("Music")

        Discord_API.upload_image(path, "Music")
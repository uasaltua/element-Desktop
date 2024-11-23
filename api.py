import requests
import plyer
import json
from PIL import Image
from io import BytesIO

status_codes = {522: "Время подключения истекло\nСкорее всего сервера elemsocial.com находятся под DDoS аттакой повторите попытку позже", 404: "Страница не найдена\nВ некоторых случаях тоже может означать что сервера elemsocial.com находятся под DDoS аттакой"}

def getAction(action:str, text):
    notifytype = ""
    if action == "ProfileSubscribe":
        notifytype = "Подписывается на вас"
    elif action == "PostLike":
        notifytype = "Ставит лайк на пост"
    elif action == "PostComment":
        notifytype = f'Комментирует ваш пост "{text}"'
    elif action == "PostDislike":
        notifytype = f'Ставит дизлайк на пост'
    else:
        notifytype = f'Не удалось определить тип'
    return notifytype

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
                f.write(json.dumps({"S-KEY": req["S_KEY"], "Lang": "ru"}))

            return True, req["S_KEY"]
        return False, False
    
    def new_post(S_KEY:str, text:str, *, files=False, clearMetaData=False) -> bool:
        req = requests.post(f'https://elemsocial.com/System/API/AddPost.php', headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}, data={"Text": text, "ClearMetadataIMG": clearMetaData})
        if not req.status_code == 200:
            return False
        return True

    def get_posts(S_KEY:str, start_index:int=0):
        req = requests.post(f'https://elemsocial.com/System/API/LoadPosts.php?F=LATEST', headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}, data={"StartIndex": start_index})
        if not req.status_code == 200:
            return False
        return req.json()

    def notifications_get(S_KEY):
        req = requests.get(f"https://elemsocial.com/System/API/Notifications.php?F=CHECK", headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'})
        if not req.status_code == 200:
            return False
        if not req.content.decode() == "" and int(req.content.decode()) >= 1:
            allnotifys = requests.post(f"https://elemsocial.com/System/API/Notifications.php?F=GET", data={"StartIndex": "0"}, headers={"S-KEY": S_KEY, 'User-Agent':'ElementAPI'}).json()
            for i in range(0, int(req.content.decode())):
                respond = getAction(allnotifys[i].get("Action"), None if allnotifys[i].get("Content") == None else json.loads(allnotifys[i].get("Content"))["Text"])
                icoPath = "static/logo.ico"
                if allnotifys[i].get("Avatar"):
                    element.convert_png_to_ico(requests.get("https://elemsocial.com/Content/Avatars/" + allnotifys[i].get("Avatar")).content)
                    icoPath = "temp/Avatar.ico"
                plyer.notification.notify(
                    title=f'{allnotifys[i]["Name"]} ',
                    message=respond,
                    app_name='element',
                    app_icon=icoPath,
                )
    
    def convert_png_to_ico(bytes):
        image = Image.open(BytesIO(bytes))
        image.save("temp/Avatar.ico", format="ICO")
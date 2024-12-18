import requests

import json

import os

import plyer



class updater:

    def __init__(self):

        if updater.checkUpdates:

            updater.update()



            plyer.notification.notify(



                title='Обновления',



                message="Клиент успешно обновлен!\nПожалуйста перезапустите приложение",



                app_name='element',



                app_icon="./static/logo.ico",



            )



    def update(path=""):

        response = requests.get("https://api.github.com/repos/uasaltua/element-Desktop/contents/" + path)



        if not response.status_code:

            return False

        

        response = response.json()



        for file in response:



            if not file["name"][0] == "." or file["name"] == "README.txt" or file["name"] == "requirements.txt" or file["name"] == "update.exe":

                if file["type"] == "dir":

                    if not os.path.exists(file["path"]):

                        os.makedirs(file["path"])

                        updater.update(file["path"])



                if file["type"] == "file":
                    with open(file["path"], encoding="UTF-8", mode="w") as f:

                        content = requests.get(file["download_url"])

                        f.write(content.text)



                



    def checkUpdates():

        response = requests.get("https://raw.githubusercontent.com/uasaltua/element-Desktop/refs/heads/main/ver.info")



        if not response.status_code == 200:

            return False



        response = response.json()



        try:

            with open("ver.info") as f:

                userVer = json.loads(f.read())

        except:

            return True



        



        if not response["Version"] == userVer["Version"] and userVer["Auto-update"]:

            return True



updater()


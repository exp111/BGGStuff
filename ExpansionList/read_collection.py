import csv
import secrets
from time import sleep
from typing import TypedDict, Optional
import math, requests
import xml.etree.ElementTree as ET

file = "collection.csv"
count = 500

maxQueryLength = 20
sleepTime = 5
idPlaceholder = "<id>"
url = f"https://boardgamegeek.com/xmlapi2/thing/"
headers = {"Authorization": "Bearer " + secrets.auth_token}

outfile = open("output.txt", "wt", encoding="utf8")
def tprint(string: str):
    print(string)
    print(string, file=outfile)

class BGGEntry(TypedDict, total=False):
    objectname: str
    objectid: int
    rating: float
    numplays: int
    weight: float
    own: bool
    fortrade: bool
    want: bool
    wanttobuy: bool
    wanttoplay: bool
    prevowned: bool
    preordered: bool
    wishlist: bool
    wishlistpriority: int
    wishlistcomment: str
    comment: str
    conditiontext: str
    haspartslist: bool
    wantpartslist: bool
    collid: int
    baverage: float
    average: float
    avgweight: float
    rank: int
    numowned: int
    objecttype: str
    originalname: str
    minplayers: int
    maxplayers: int
    playingtime: int
    maxplaytime: int
    minplaytime: int
    yearpublished: int
    bggrecplayers: str
    bggbestplayers: str
    bggrecagerange: str
    bgglanguagedependence: str
    publisherid: int
    imageid: int
    year: int
    language: str
    other: str
    itemtype: str
    barcode: str
    pricepaid: float
    pp_currency: str
    currvalue: float
    cv_currency: str
    acquisitiondate: str
    acquiredfrom: str
    quantity: int
    privatecomment: str
    invlocation: str
    invdate: str
    version_publishers: str
    version_languages: str
    version_yearpublished: int
    version_nickname: str

games: list[BGGEntry] = []
# read games into array
with open(file, newline="", encoding="utf8") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    for game in reader:
        games.append(game)
print(len(games))
print(games[0]["objectname"])

for game in games:
    # filter out unowned
    if game["own"] != "1":
        continue
    
    # filter out expansions
    if game["itemtype"] != "standalone":
        continue

    tprint(f"{game["objectname"]} ({game["objectid"]})")
    response = requests.get(url, headers=headers, params={
        "id": game["objectid"]
    })
    if response.status_code != 200:
        tprint(f"Request failed ({response.status_code})")
        continue
    items = ET.fromstring(response.text)
    game = items[0]
    # types
    def printAllOfType(header, type):
        types = game.findall(f"link[@type='{type}']")
        if len(types) > 0:
            tprint(f"-{header}:")
            for item in types:
                id = item.attrib["id"]
                if len(list(filter(lambda x: x["objectid"] == id and x["own"], games))):
                    tprint(f"- {item.attrib["value"]} ({id}) (OWNED)")
                else:
                    tprint(f"- {item.attrib["value"]} ({id})")
    printAllOfType("Expansions", "boardgameexpansion")
    printAllOfType("Integrates with", "boardgameintegration")
    printAllOfType("Accessories", "boardgameaccessory")
    # sleep
    if response.elapsed.seconds < sleepTime:
        sleep(sleepTime - response.elapsed.seconds)

outfile.close()
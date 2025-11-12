import csv
import secrets
from time import sleep
from typing import TypedDict, Optional
import math, requests
import xml.etree.ElementTree as ET

file = "boardgames_ranks.csv"
count = 500

maxQueryLength = 20
sleepTime = 5
url = "https://boardgamegeek.com/xmlapi2/thing"
querystring = {"versions":"1","id":"412","stats":"1"}
headers = {"Authorization": "Bearer " + secrets.auth_token}

class BoardGame(TypedDict):
    id: int
    name: str
    yearpublished: int
    rank: int
    bayesaverage: float
    average: float
    usersrated: int
    is_expansion: bool
    abstracts_rank: Optional[int]
    cgs_rank: Optional[int]
    childrensgames_rank: Optional[int]
    familygames_rank: Optional[int]
    partygames_rank: Optional[int]
    strategygames_rank: Optional[int]
    thematic_rank: Optional[int]
    wargames_rank: Optional[int]

class ExtendedBoardGame(BoardGame):
    complexity: float
    width: float
    length: float
    depth: float
    weight: float

games: list[BoardGame] = []
# read games into array
with open(file, newline="", encoding="utf8") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
    for game in reader:
        games.append(game)
print(len(games))
print(games[0]["name"])

nonExpansions = []
# filter out expansions
for game in filter(lambda g: g["is_expansion"] != "1", games):
    nonExpansions.append(game)
print(len(nonExpansions))
print(nonExpansions[0]["name"])

selected = nonExpansions[0:count]
print(len(selected))
print(selected[0]["name"])

counter = 0
merged = []
for index in range(math.ceil(len(selected) / maxQueryLength)):
    print(f"{index*maxQueryLength}:{(index+1)*maxQueryLength}")
    part = selected[index*maxQueryLength:(index+1)*maxQueryLength]
    ids = list(map(lambda g: g["id"], part))
    response = requests.get(url, headers=headers, params={
        "versions": "1",
        "stats": "1",
        "id": ",".join(ids)
    })
    items = ET.fromstring(response.text)
    for item in items:
        original = list(filter(lambda g: g["id"] == item.attrib["id"], part))
        if len(original) == 0:
            print(f"no item found for {item.attrib["id"]}")
            continue
        original = original[0]
        firstValidVersion = list(filter(lambda i: float(i.find("width").attrib["value"]) != 0 and 
                                        float(i.find("length").attrib["value"]) != 0 and 
                                        float(i.find("depth").attrib["value"]) != 0 and 
                                        float(i.find("weight").attrib["value"]) != 0, item.find("versions")))
        if len(firstValidVersion) == 0:
            print(f"no valid version found for {item.attrib["id"]}")
            continue
        firstValidVersion = firstValidVersion[0]
        merged.append({
            **original,
            'complexity': item.find("statistics").find("ratings").find("averageweight").attrib["value"],
            'width': firstValidVersion.find("width").attrib["value"],
            'length': firstValidVersion.find("length").attrib["value"],
            'depth': firstValidVersion.find("depth").attrib["value"],
            'weight': firstValidVersion.find("weight").attrib["value"]
        })
    print(merged)
    if index < math.ceil(len(selected) / maxQueryLength) - 1:
        sleep(sleepTime)

with open("merged.csv", mode="w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=merged[0].keys())
    writer.writeheader()
    writer.writerows(merged)
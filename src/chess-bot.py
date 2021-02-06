import berserk
import json

with open("./envs.json", "r") as f:
    TOKEN = json.load(f).get("lichess_token")

session = berserk.TokenSession(TOKEN)
client = berserk.Client(session)

print(client.account.get())

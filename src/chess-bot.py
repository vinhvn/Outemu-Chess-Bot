import berserk
import json
from Game import Game


with open("./envs.json", "r") as f:
    TOKEN = json.load(f).get("lichess_token")

session = berserk.TokenSession(TOKEN)
bot = berserk.clients.Bots(session)


def game_listener():
    for event in bot.stream_incoming_events():
        if event.get("type") == "challenge":
            bot.accept_challenge(event.get("challenge").get("id"))
        elif event.get("type") == "gameStart":
            game = Game(bot, event.get("game").get("id"))
            game.run()


game_listener()

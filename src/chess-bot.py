import berserk
import json
from multiprocessing import Process
from flask import Flask
from pprint import pprint
from Game import Game
from time import sleep


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
            game_process = Process(target=game.run)
            game_process.start()
            game_controller(game)


def game_controller(game):
    while True:
        print("writing bot status")
        with open("turn.txt", "w+") as f:
            f.write(str(game.get_bot_turn()))
        print("checking bot turn")
        if game.get_bot_turn():
            print("bot turn... waiting 15 seconds")
            sleep(15)
            print("reading from queue")
            with open("moves.txt", "r") as f:
                for move in f.readlines():
                    if game.make_move(move):
                        break


game_listener()

import threading
from pprint import pprint
from time import sleep
import os


class Game(threading.Thread):
    def __init__(self, bot, users, game_id, **kwargs):
        super().__init__(**kwargs)
        self.game_id = game_id
        self.bot = bot
        self.users = users
        self.stream = bot.stream_game_state(self.game_id)
        self.current_state = next(self.stream)
        self.move_counter = 0
        self.color = ""
        self.bot_turn = False
        self.first_check()

    def first_check(self):
        pprint(self.current_state)
        if self.current_state.get("white").get("id") == "outemubot":
            self.color = "white"
        else:
            self.color = "black"
            self.move_counter = 1

        if self.color == "white":
            self.handle_state_change(self.current_state)

    def run(self):
        for event in self.stream:
            pprint(event)
            if event.get("type") == "gameFinish" or event.get("winner"):
                return
            elif event.get("type") == "gameState":
                # pprint("GAMESTATE: {}".format(event))
                print("game state received")
                self.handle_state_change(event)
            elif event.get("type") == "chatLine":
                # pprint("CHATLINE: {}".format(event))
                self.handle_chat_line(event)

    def get_bot_turn(self):
        return self.bot_turn

    def make_move(self, move):
        try:
            self.bot.make_move(self.game_id, move)
            return True
        except:
            return False

    def get_next_move(self, game_state):
        move_made = False
        with open("turn.txt", "w+") as f:
            f.write("True")
        print("MOVEMADE: {}".format(move_made))
        print("bot turn... waiting 15 seconds")
        sleep(15)
        print("reading from queue")
        if not os.path.exists("./moves.txt"):
            return
        with open("moves.txt", "r") as f:
            for move in f.readlines():
                print("trying move {}".format(move))
                sleep(1)
                if self.make_move(move):
                    move_made = True
                    break

    def handle_state_change(self, game_state):
        self.move_counter += 1
        print("MOVE COUNTER: {} --- COLOR: {}".format(self.move_counter, self.color))
        if self.color == "white" and self.move_counter % 2 != 0:
            self.get_next_move(game_state)

        if self.color == "black" and self.move_counter % 2 == 0:
            self.get_next_move(game_state)

        with open("turn.txt", "w+") as f:
            f.write("False")
        pass

    def handle_chat_line(self, chat_line):
        pass

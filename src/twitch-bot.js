"use strict";
exports.__esModule = true;
var tmi = require("tmi.js");
var envs_json_1 = require("./envs.json");
var fs = require("fs");
// Main
var queue = [];
var votes = {};
var timer = setInterval(function () {
    queueMove();
}, 5000);
var onMessageHandler = function (target, context, msg, self) {
    // don't listen to self
    if (self || !currentTurn()) {
        queue = [];
        return;
    }
    // remove spaces
    var move = msg.trim();
    // message should only contain move
    var splits = move.split(' ');
    if (splits.length > 1) {
        move = splits[0];
    }
    // check if move is valid
    if (!validMove(move)) {
        return;
    }
    // add move to queue
    addMove(move);
};
var onConnectedHandler = function (address, port) {
    console.log("> Connected to " + address + ":" + port);
};
var currentTurn = function () {
    var result = fs.readFileSync('./turn.txt', 'utf8');
    return result.toString() == "True";
};
var validMove = function (s) {
    var regex = /^[a-h][1-8][a-h][1-8]$/g;
    return regex.test(s);
};
var addMove = function (move) {
    if (!Object.prototype.hasOwnProperty.call(votes, move)) {
        votes[move] = 1;
    }
    else {
        votes[move] += 1;
    }
};
var queueMove = function () {
    console.log('> Queueing a move...');
    var max = 0;
    var qMove = "";
    // find max
    for (var move in votes) {
        if (votes[move] > max) {
            max = votes[move];
            qMove = move;
        }
    }
    // push to q and clear it from votes
    queue.push(qMove);
    clearVote(qMove);
    writeQueue();
};
var clearVote = function (move) {
    if (Object.prototype.hasOwnProperty.call(votes, move)) {
        delete votes[move];
        return true;
    }
    else {
        return false;
    }
};
var writeQueue = function () {
    console.log('> Writing queue to `moves.txt`...');
    var data = formatQueue();
    fs.writeFile('moves.txt', data, function (err) {
        console.error('>> ERROR: ', err);
    });
};
var formatQueue = function () {
    var output = "";
    for (var _i = 0, queue_1 = queue; _i < queue_1.length; _i++) {
        var move = queue_1[_i];
        output += move + "\n";
    }
    return output;
};
// Bot
var opts = {
    identity: {
        username: envs_json_1.twitch_username,
        password: envs_json_1.twitch_token
    },
    channels: [
        envs_json_1.twitch_channel,
    ]
};
var client = new tmi.client(opts);
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

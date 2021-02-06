"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var tmi = require("tmi.js");
var envs_json_1 = require("./envs.json");
var fs = require("fs");
// Main
var queue = [];
var votes = {};
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
    sortQueue();
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
var sortQueue = function () {
    console.log("> Queueing a move...");
    if (Object.keys(votes).length === 0) {
        console.log('>> No moves in votes. Aborting...');
        return;
    }
    queue = [];
    var copy = __assign({}, votes);
    while (queue.length < Object.keys(votes).length) {
        var max = 0;
        var qMove = "";
        // find max
        for (var move in copy) {
            if (copy[move] > max) {
                max = copy[move];
                qMove = move;
            }
        }
        queue.push(qMove);
        clearVote(copy, qMove);
    }
    writeQueue(queue);
};
var clearVote = function (dict, move) {
    if (Object.prototype.hasOwnProperty.call(dict, move)) {
        delete dict[move];
        return true;
    }
    else {
        return false;
    }
};
var writeQueue = function (queue) {
    console.log('> Writing queue to `moves.txt`...');
    if (queue.length === 0) {
        console.log('>> No moves in queue. Aborting...');
        return;
    }
    var data = formatQueue(queue);
    var options = { flag: 'w' };
    fs.writeFile('moves.txt', data, options, function (err) {
        console.error('>> ERROR: ', err);
    });
};
var formatQueue = function (queue) {
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

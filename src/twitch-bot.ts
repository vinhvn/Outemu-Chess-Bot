import * as tmi from 'tmi.js'
import { twitch_username, twitch_token, twitch_channel }  from './envs.json'
import * as fs from 'fs'

// Main

let queue: string[] = [];
const votes: { [key: string]: number } = {};

const onMessageHandler = (target: any, context: any, msg: string, self: any) => {
  // don't listen to self
  if (self || !currentTurn()) {
    queue = [];
    return;
  }
  // remove spaces
  let move = msg.trim()
  // message should only contain move
  const splits = move.split(' ')
  if (splits.length > 1) {
    move = splits[0]
  }
  // check if move is valid
  if (!validMove(move)) {
    return;
  }
  // add move to queue
  addMove(move)
  sortQueue()
}

const onConnectedHandler = (address: string, port: number) => {
  console.log(`> Connected to ${address}:${port}`)
}

const currentTurn = () => {
  const result = fs.readFileSync('./turn.txt', 'utf8')
  return result.toString() == "True"
}

const validMove = (s: string) => {
  const regex = /^[a-h][1-8][a-h][1-8]$/g
  return regex.test(s)
}

const addMove = (move: string) => {
  if (!Object.prototype.hasOwnProperty.call(votes, move)) {
    votes[move] = 1
  } else {
    votes[move] += 1
  }
}

const sortQueue = () => {
  console.log(`> Queueing a move...`)
  if (Object.keys(votes).length === 0) {
    console.log('>> No moves in votes. Aborting...')
    return;
  }

  queue = []
  const copy = { ...votes }

  while (queue.length < Object.keys(votes).length) {
    let max = 0
    let qMove = ""
    // find max
    for (const move in copy) {
      if (copy[move] > max) {
        max = copy[move]
        qMove = move
      }
    }
    queue.push(qMove)
    clearVote(copy, qMove)
  }

  writeQueue(queue)
}

const clearVote = (dict: Record<string, number>, move: string) => {
  if (Object.prototype.hasOwnProperty.call(dict, move)) {
    delete dict[move]
    return true
  } else {
    return false
  }
}

const writeQueue = (queue: string[]) => {
  console.log('> Writing queue to `moves.txt`...')
  if (queue.length === 0) {
    console.log('>> No moves in queue. Aborting...')
    return;
  }
  const data = formatQueue(queue)
  const options = { flag: 'w' }
  fs.writeFile('moves.txt', data, options, (err) => {
    console.error('>> ERROR: ', err)
  })
}

const formatQueue = (queue: string[]) => {
  let output = ""
  for (const move of queue) {
    output += `${move}\n`
  }
  return output
}


// Bot

const opts = {
  identity: {
    username: twitch_username,
    password: twitch_token,
  },
  channels: [
    twitch_channel,
  ]
}

const client = new tmi.client(opts)

client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)

client.connect()

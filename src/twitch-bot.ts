import * as tmi from 'tmi.js'
import { twitch_username, twitch_token, twitch_channel }  from './envs.json'
import * as fs from 'fs'

// Main

let queue: string[] = [];
const votes: { [key: string]: number } = {};
const timer = setInterval(() => {
  queueMove()
}, 5000)

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
    move = splits[0];
  }
  // check if move is valid
  if (!validMove(move)) {
    return;
  }
  // add move to queue
  addMove(move)
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

const queueMove = () => {
  console.log('> Queueing a move...')
  let max = 0
  let qMove = ""
  // find max
  for (const move in votes) {
    if (votes[move] > max) {
      max = votes[move]
      qMove = move
    }
  }
  // push to q and clear it from votes
  queue.push(qMove)
  clearVote(qMove)
  writeQueue()
}

const clearVote = (move: string) => {
  if (Object.prototype.hasOwnProperty.call(votes, move)) {
    delete votes[move]
    return true
  } else {
    return false
  }
}

const writeQueue = () => {
  console.log('> Writing queue to `moves.txt`...')
  if (queue.length === 0) {
    console.log('>> No moves in queue. Aborting...')
    return;
  }
  const data = formatQueue()
  const options = { flag: 'w' }
  fs.writeFile('moves.txt', data, options, (err) => {
    console.error('>> ERROR: ', err)
  })
}

const formatQueue = () => {
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

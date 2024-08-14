// app.js

// const myUsername = prompt('Please enter your name') || 'Anonymous'
const myUsername = generateUsername()
// const socket = new WebSocket(`${window.wsAppUrl}start_web_socket?username=${myUsername}`)
const isHttps = window.location.protocol === 'https:'
const currentDomain = window.location.host
// const currentPort = window.location.port
const currentPort = window.appPort
const socket = new WebSocket(`${isHttps ? 'wss' : 'ws'}://${currentDomain}:${currentPort}/start_web_socket?username=${myUsername}`)

mapboxgl.accessToken = window.mapboxToken;
const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [12.550343, 55.665957],
  zoom: 8
});

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
  .setLngLat([12.554729, 55.70651])
  .addTo(map);

// Create a default Marker, colored black, rotated 45 degrees.
const marker2 = new mapboxgl.Marker({ color: 'black', rotation: 45 })
  .setLngLat([12.65147, 55.608166])
  .addTo(map);

socket.onmessage = (m) => {
  const data = JSON.parse(m.data)

  switch (data.event) {
    case 'update-users': {
      // refresh displayed user list
      let userListHtml = ''
      for (const username of data.usernames) {
        userListHtml += `<div> ${username} </div>`
      }
      document.getElementById('users').innerHTML = userListHtml
      break
    }

    case 'send-message': {
      // display new chat message
      addMessage(data.username, data.message)
      break
    }
    default: {
      console.log('Unknown event', data)
      break
    }
  }
}

function addMessage(username, message) {
  // displays new message
  document.getElementById('conversation').innerHTML += `<b> ${username} </b>: ${message} <br/>`
}

// on page load
window.onload = () => {
  // when the client hits the ENTER key
  document.getElementById('data').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const inputElement = document.getElementById('data')
      var message = inputElement.value
      inputElement.value = ''
      socket.send(
        JSON.stringify({
          event: 'send-message',
          message: message
        })
      )
    }
  })
}

const usernamePrefixes = [
  'Anonymous',
  'Brave',
  'Clever',
  'Daring',
  'Eager',
  'Fearless',
  'Gentle',
  'Humble',
  'Intelligent',
  'Jolly',
  'Kind',
  'Loyal',
  'Mighty',
  'Noble',
  'Optimistic',
  'Proud',
  'Quiet',
  'Respectful',
  'Strong',
  'Talented',
  'Unique',
  'Valiant',
  'Wise',
  'Xenial',
  'Youthful',
  'Zealous'
]

const usernamePostfixes = [
  'Aardvark',
  'Bear',
  'Cat',
  'Dog',
  'Elephant',
  'Fox',
  'Giraffe',
  'Horse',
  'Iguana',
  'Jaguar',
  'Kangaroo',
  'Lion',
  'Monkey',
  'Newt',
  'Owl',
  'Penguin',
  'Quokka',
  'Raccoon',
  'Squirrel',
  'Tiger',
  'Uakari',
  'Vulture',
  'Walrus',
  'Xerus',
  'Yak',
  'Zebra'
]

const generateUsername = () => {
  const prefix = usernamePrefixes[Math.floor(Math.random() * usernamePrefixes.length)]
  const postfix = usernamePostfixes[Math.floor(Math.random() * usernamePostfixes.length)]
  return `${prefix} ${postfix}`
}
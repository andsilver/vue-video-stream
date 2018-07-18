import _ from 'lodash'
import HostingRegions from './components/hostingRegions'

let streams = [
  {
    id: 'alsduk18md',
    name: 'Youtube',
    region: HostingRegions[0],
    platforms: []
  }
  // {
  //   id: 'asmudn9ddx',
  //   name: 'SteamPro',
  //   region: HostingRegions[1],
  //   platforms: []
  // }, {
  //   id: 'cvhmsfdlkd',
  //   name: 'MediumBrown',
  //   region: HostingRegions[2],
  //   platforms: []
  // }
]

export function getStreams() {
  return streams
}

export function getStream(id) {
  return _.find(streams, { id })
}

export function addStream(stream) {
  streams = [...streams, stream]
}

export function deleteStream(id) {
  const stream = getStream(id)
  const index = streams.indexOf(stream)
  streams = _.concat(streams.slice(0, index), streams.slice(index + 1))
}

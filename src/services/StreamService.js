import _ from 'lodash'
import Vue from 'vue'
import RequestError from './RequestError'

/**
 * @typedef RequestConfig
 * @prop {string} path
 * @prop {string} method
 * @prop {Object} [params]
 * @prop {any} [data]
 */

export default {
  getUserStreams,
  getStream,
  getStreamDvrRanges,
  getStreamDvrEpisodes,
  getStreamViewership,
  addStream,
  addLiveStream,
  addCamStream,
  addScheduledStream,
  addVODChannel,
  setStreamName,
  toggleStream,
  setStreamPullUrl,
  unsetStreamPullUrl,
  deleteStream,
  addStreamPlatform,
  toggleStreamPlatform,
  setStreamPlatformName,
  setStreamPlatformAddress,
  deleteStreamPlatform,
  getAvailableRegions,
  getStreamMetadata,
  saveStreamMetadata,
  enableStreamABR,
  disableStreamABR,
  uploadStreamPoster,

  getStreamScheduleSettings,
  saveStreamScheduleSettings,

  uploadStreamPlaylistVideo,
  deleteStreamPlaylistVideoFile,
  getStreamPlaylist,
  saveStreamPlaylistVideo,
  moveStreamPlaylistVideo,
  togleStreamPlaylistVideoStatus,
  removeStreamPlaylistVideo
}

function getUserStreams() {
  return makeRequest('/streams/mystreams')
}

/**
 * @param {string} streamId
 */
function getStream(streamId) {
  return makeRequest(`/streams/${streamId}`)
}

/**
 * @param {string} streamId
 * @param {number} startTime
 * @param {number} endTime
 */
function getStreamDvrRanges(streamId, startTime, endTime) {
  let uri = `/streams/${streamId}/dvrRanges`
  uri += `?start=${startTime}`
  uri += `&end=${endTime}`

  return makeRequest(uri)
}

/**
 * @param {string} streamId
 */
function getStreamDvrEpisodes(streamId) {
  return makeRequest(`/streams/${streamId}/dvrEpisodes`)
  // return
  // makeRequest(`http://api-staging.castr.io:22776/streams/5be297af95f06137e7081b
  // 3 e/dvrEpisodes`)
}

/**
 * @param {string} streamId
 */
function getStreamViewership(streamId) {
  let uri = `/streams/${streamId}/viewership`
  return makeRequest(uri)
}

/**
 * @param {string} name
 * @param {string} regionId
 */
function addStream(name, regionId) {
  return makeRequest({
    path: '/streams/deploy',
    method: 'post',
    data: {
      stream: {
        name,
        region: regionId,
        type: 'restream'
      }
    }
  })
}

/**
 * @param {string} name
 * @param {string} regionId
 */
function addLiveStream(name, regionId) {
  return makeRequest({
    path: '/streams/deploy',
    method: 'post',
    data: {
      stream: {
        name,
        region: regionId,
        type: 'live'
      }
    }
  })
}

/**
 * @param {string} name
 * @param {string} regionId
 */
function addCamStream(name, regionId) {
  return makeRequest({
    path: '/streams/deploy',
    method: 'post',
    data: {
      stream: {
        name,
        region: regionId,
        type: 'ipcam'
      }
    }
  })
}

/**
 * @param {string} name
 * @param {string} regionId
 */
function addScheduledStream(name, regionId) {
  return makeRequest({
    path: '/streams/deploy',
    method: 'post',
    data: {
      stream: {
        name,
        region: regionId,
        type: 'scheduled'
      }
    }
  })
}

/**
 * @param {string} name
 * @param {string} regionId
 */
function addVODChannel(name, regionId) {
  return makeRequest({
    path: '/streams/deploy',
    method: 'post',
    data: {
      stream: {
        name,
        region: regionId,
        type: 'vod'
      }
    }
  })
}

/**
 * @param {string} streamId
 * @param {string} name
 */
function setStreamName(streamId, name) {
  return makeRequest({
    path: `/streams/${streamId}/name`,
    method: 'put',
    data: {
      name
    }
  })
}

/**
 * @param {string} streamId
 */
function toggleStream(streamId) {
  return makeRequest({ path: `/streams/${streamId}/toggle`, method: 'put' })
}

/**
 * @param {string} streamId
 * @param {string} pulUrl
 */
function setStreamPullUrl(streamId, pullUrl) {
  return makeRequest({
    path: `/streams/${streamId}/pullurl/set`,
    method: 'put',
    data: {
      url: pullUrl
    }
  })
}

/**
 * @param {string} streamId
 */
function unsetStreamPullUrl(streamId) {
  return makeRequest({ path: `/streams/${streamId}/pullurl/unset`, method: 'put' })
}

/**
 * @param {string} streamId
 */
function deleteStream(streamId) {
  return makeRequest({ path: `/streams/${streamId}`, method: 'delete' })
}

/**
 * @param {string} streamId
 * @param {object} platformPayload
 * @param {string} platformPayload.template
 * @param {string} platformPayload.server
 * @param {string} platformPayload.key
 * @param {boolean} platformPayload.enabled
 * @param {boolean} platformPayload.linkedServiceCreds
 */
function addStreamPlatform(streamId, platformPayload) {
  const config = {
    path: `/streams/${streamId}/platforms/add`,
    method: 'post',
    data: {
      platform: {
        template: platformPayload.template,
        server: platformPayload.server,
        key: platformPayload.key,
        enabled: platformPayload.enabled
      }
    }
  }

  if (platformPayload.linkedServiceCreds)
    config.data.platform.linkedServiceCreds = platformPayload.linkedServiceCreds

  if (platformPayload.serviceMeta)
    config.data.platform.serviceMeta = platformPayload.serviceMeta

  return makeRequest(config)
}

/**
 * @param {string} streamId
 * @param {string} platformId
 * @param {boolean} [forceState]
 */
function toggleStreamPlatform(streamId, platformId, forceState) {
  const config = {
    path: `/streams/${streamId}/platforms/${platformId}/toggle`,
    method: 'put'
  }

  if (forceState !== undefined) {
    config.data = {
      enabled: forceState
    }
  }

  return makeRequest(config)
}

/**
 * @param {string} streamId
 * @param {string} platformId
 * @param {string} name
 */
function setStreamPlatformName(streamId, platformId, name) {
  return makeRequest({
    path: `/streams/${streamId}/platforms/${platformId}/name`,
    method: 'put',
    data: {
      name
    }
  })
}

/**
 * @param {string} streamId
 * @param {string} platformId
 * @param {object} addressUpdates
 * @param {string} addressUpdates.server
 * @param {string} addressUpdates.key
 */
function setStreamPlatformAddress(streamId, platformId, addressUpdates) {
  return makeRequest({
    path: `/streams/${streamId}/platforms/${platformId}/address`,
    method: 'put',
    data: {
      platform: {
        server: addressUpdates.server,
        key: addressUpdates.key
      }
    }
  })
}

/**
 * @param {string} streamId
 * @param {string} platformId
 */
function deleteStreamPlatform(streamId, platformId) {
  return makeRequest({ path: `/streams/${streamId}/platforms/${platformId}`, method: 'delete' })
}

/**
 * @param {string} streamId
 */
function getStreamMetadata(streamId) {
  return makeRequest(`/streams/${streamId}/metadata`)
}

/**
 * @param {string} streamId
 * @param {string} key
 * @param {string} value
 */
function saveStreamMetadata(streamId, key, value) {
  return makeRequest({
    path: `/streams/${streamId}/metadata/save`,
    method: 'put',
    data: {
      updates: {
        key,
        value
      }
    }
  })
}

/**
 * @param {string} streamId
 */
function enableStreamABR(streamId) {
  return makeRequest({
    path: `/streams/${streamId}/abr/toggle`,
    method: 'put',
    data: { enabled: true }
  })
}

/**
 * @param {string} streamId
 */
function disableStreamABR(streamId) {
  return makeRequest({
    path: `/streams/${streamId}/abr/toggle`,
    method: 'put',
    data: { enabled: false }
  })
}

/**
 * @param {string} streamId
 * @param {FormData} fdata
 */
function uploadStreamPoster(streamId, fdata) {
  return makeRequest({
    path: `/streams/${streamId}/metadata/poster`,
    method: 'post',
    data: fdata,
    headers: {
      'content-type': 'multipart/form-data'
    }
  })
}

/**
 * @param {string} streamId
 */
function getStreamScheduleSettings(streamId) {
  return makeRequest(`/streams/${streamId}/schedular/config`)
}

/**
 * @param {string} streamId
 * @param {string} mode
 * @param {number} [datetime]
 */
function saveStreamScheduleSettings(streamId, mode, datetime) {
  if (!_.isNumber(datetime)) {
    datetime = datetime.getTime()
  }

  return makeRequest({
    path: `/streams/${streamId}/schedular/config`,
    method: 'post',
    data: {
      updates: {
        mode,
        datetime
      }
    }
  })
}

/**
 * @param {string} streamId
 * @param {File} file
 */
function uploadStreamPlaylistVideo(streamId, file, onBytesUploaded, cancelToken) {
  let apiUri = `https://fr-vod.castr.io:1335/playlist/${streamId}/videos/add`

  const fdata = new FormData()
  fdata.append('file', file)

  return makeRequest({
    path: apiUri,
    method: 'post',
    data: fdata,
    headers: {
      'content-type': 'multipart/form-data'
    },
    onUploadProgress(progressEvent) {
      // let percentCompleted = Math.round((progressEvent.loaded * 100) /
      // progressEvent.total)
      let percentCompleted = (progressEvent.loaded * 100) / progressEvent.total
      if (onBytesUploaded) {
        onBytesUploaded(percentCompleted)
      }
    },
    cancelToken
  })
}

/**
 * @param {string} streamId
 * @param {string} videoId
 */
function deleteStreamPlaylistVideoFile(streamId, videoId) {
  let apiUri = `https://fr-vod.castr.io:1335/playlist/${streamId}/videos/${videoId}`

  return makeRequest({
    path: apiUri,
    method: 'delete'
  })
}

/**
 * @param {string} streamId
 * @param {object} videoMeta
 */
function getStreamPlaylist(streamId) {
  return makeRequest(`/streams/${streamId}/schedular/playlist`)
}

/**
 * @param {string} streamId
 * @param {object} videoMeta
 */
function saveStreamPlaylistVideo(streamId, videoMeta) {
  return makeRequest({
    path: `/streams/${streamId}/schedular/playlist`,
    method: 'post',
    data: { videoMeta }
  })
}

/**
 * @param {string} streamId
 * @param {string} videoId
 */
function moveStreamPlaylistVideo(streamId, videoId1, videoId2) {
  return makeRequest({
    path: `/streams/${streamId}/schedular/playlist/shift`,
    method: 'put',
    data: { updates: [videoId1, videoId2] }
  })
}

/**
 * @param {string} streamId
 * @param {string} videoId
 * @param {boolean} enabled
 */
function togleStreamPlaylistVideoStatus(streamId, videoId, enabled) {
  return makeRequest({
    path: `/streams/${streamId}/schedular/playlist/${videoId}`,
    method: 'put',
    data: { updates: { enabled } }
  })
}

/**
 * @param {string} streamId
 */
function removeStreamPlaylistVideo(streamId, videoId) {
  return makeRequest({
    path: `/streams/${streamId}/schedular/playlist/${videoId}`,
    method: 'delete'
  })
}

let regions
/**
 * @param {string} [category]
 */
async function getAvailableRegions(category) {
  if (!regions) {
    regions = await makeRequest('/regions/list')
  }

  let result = regions
  if (category) {
    result = _.filter(result, region => region.platforms.indexOf(category) > -1)
  }

  return result
}

/**
 * @param {RequestConfig|string} reqConfig
 */
async function makeRequest(reqConfig) {
  if (typeof reqConfig === 'string') {
    reqConfig = {
      path: reqConfig
    }
  }

  reqConfig.url = reqConfig.path

  let res
  try {
    res = await Vue
      .axios
      .request(reqConfig)
  } catch (err) {
    let edata = _.get(err, 'response.data')
    throw new RequestError(edata)
  }

  return res && res.data
}

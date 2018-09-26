// import _ from 'lodash'
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
  addStream,
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
  getAvailableRegions
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
 * @param {string} name
 * @param {string} regionId
 */
function addStream(name, regionId) {
  return makeRequest({
    path: '/streams/deploy',
    method: 'post',
    data: {
      stream: { name, region: regionId }
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
    data: { name }
  })
}

/**
 * @param {string} streamId
 */
function toggleStream(streamId) {
  return makeRequest({
    path: `/streams/${streamId}/toggle`,
    method: 'put'
  })
}

/**
 * @param {string} streamId
 * @param {string} pulUrl
 */
function setStreamPullUrl(streamId, pullUrl) {
  return makeRequest({
    path: `/streams/${streamId}/pullurl/set`,
    method: 'put',
    data: { url: pullUrl }
  })
}

/**
 * @param {string} streamId
 */
function unsetStreamPullUrl(streamId) {
  return makeRequest({
    path: `/streams/${streamId}/pullurl/unset`,
    method: 'put'
  })
}

/**
 * @param {string} streamId
 */
function deleteStream(streamId) {
  return makeRequest({
    path: `/streams/${streamId}`,
    method: 'delete'
  })
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
    config.data = { enabled: forceState }
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
    data: { name }
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
  return makeRequest({
    path: `/streams/${streamId}/platforms/${platformId}`,
    method: 'delete'
  })
}

let regions
async function getAvailableRegions() {
  if (!regions) {
    regions = await makeRequest('/regions/list')
  }

  return regions
}

/**
 * @param {RequestConfig|string} reqConfig
 */
async function makeRequest(reqConfig) {
  if (typeof reqConfig === 'string') {
    reqConfig = { path: reqConfig }
  }

  reqConfig.url = reqConfig.path

  let res
  try {
    res = await Vue.axios.request(reqConfig)
  } catch (err) {
    throw new RequestError(err.response.data)
  }

  return res.data
}

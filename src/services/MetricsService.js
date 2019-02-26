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
  getStreamViewers,
  getStreamBandwidth,
  getUserBandwidth,
  getSubscriptionBandwidth,
  getSubscriptionStorage,
  getUserStorage
}

/**
 * @param {string} streamId
 */
function getStreamViewers(streamId) {
  let uri = `/streams/${streamId}/viewership`
  return makeRequest(uri)
}

/**
 * @param {string} streamId
 * @param {number|Date} startTime
 * @param {number|Date} endTime
 */
function getStreamBandwidth(streamId, startTime, endTime) {
  if (!endTime)
    endTime = new Date()

  if(startTime.getTime)
    startTime = startTime.getTime()
  
  if(endTime.getTime)
    endTime = endTime.getTime()

  let uri = `/metrics/streams/${streamId}/bandwidth`
  return makeRequest({
    path: uri,
    params: { startTime, endTime }
  })
}

/**
 * @param {string} userId
 */
function getUserBandwidth(userId) {
  let uri = `/metrics/subscription/${userId}/bandwidth`
  return makeRequest({
    path: uri,
    method: 'post'
  })
}

/**
 * @param {string} userId
 * @param {string} packageId
 */
function getSubscriptionBandwidth(userId, packageId) {
  let uri = `/metrics/subscription/${userId}/bandwidth/${packageId}`
  return makeRequest({
    path: uri,
    method: 'post'
  })
}

/**
 * @param {string} userId
 * @param {string} packageId
 */
function getSubscriptionStorage(userId, packageId) {
  let uri = `/metrics/subscription/${userId}/storage/${packageId}`
  return makeRequest({
    path: uri,
    method: 'post'
  })
}

function getUserStorage() {
  let uri = `/metrics/user/storage`
  return makeRequest({
    path: uri,
    method: 'post'
  })
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

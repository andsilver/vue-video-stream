// import _ from 'lodash'
// import Vue from 'vue'
import axios from 'axios'
import RequestError from './RequestError'

/**
 * @typedef RequestConfig
 * @prop {string} path
 * @prop {string} method
 * @prop {Object} [params]
 * @prop {any} [data]
 */

export default {
  makeRequest
}

/**
 * @param {string} channelId
 */
function api1() {
  let url = '/apiurl'
  return makeRequest({
    path: url,
    method: 'get'
  })
}

/**
 * @param {RequestConfig|string} reqConfig
 */
async function makeRequest(reqConfig) {
  if (typeof reqConfig === 'string') {
    reqConfig = { path: reqConfig }
  }

  reqConfig.url = reqConfig.path

  // delete Vue.axios.defaults.headers.common['auth-token']

  let res
  try {
    res = await axios.request(reqConfig)
  } catch (err) {
    throw new RequestError((err.response && err.response.data) || err.message)
  } finally {}

  return res && res.data
}

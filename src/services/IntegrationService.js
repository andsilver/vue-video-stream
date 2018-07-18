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
  checkServiceIntegrationStatus,
  checkSiblingPlatformLinkStatus,
  getServiceIngest
}

/**
 * @param {string} serviceName
 * @param {string} streamId
 */
function checkServiceIntegrationStatus(serviceName, streamId) {
  return makeRequest(`/integrations/status?stream=${streamId}&service=${serviceName}&excludeLinked=1`)
  // return makeRequest('/integrations/' + serviceName)
}

/**
 * @param {string} serviceName
 * @param {string} streamId
 */
function checkSiblingPlatformLinkStatus(serviceName, streamId) {
  return makeRequest(`/integrations/${serviceName}/linkStatus?stream=${streamId}`)
  // return makeRequest('/integrations/' + serviceName)
}

/**
 * @param {string} serviceName
 * @param {string} streamId
 * @param {string} integrationId
 */
function getServiceIngest(serviceName, streamId, integrationId) {
  let url = `/integrations/${serviceName}/ingest?stream=${streamId}`
  // if (integrationId) url += `&integration=${integrationId}`

  return makeRequest(url)
  // return makeRequest('/integrations/' + serviceName)
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

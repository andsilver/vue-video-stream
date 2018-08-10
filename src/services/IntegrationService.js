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
  checkIntegrationConnect,
  checkIntegrationConflict,
  checkServiceIntegrationStatus,
  checkSiblingPlatformLinkStatus,
  getServiceIngest,
  getMixerFTLUrl
}

/**
 * @param {string} serviceName
 * @param {string} streamId
 */
function checkIntegrationConnect(connectId) {
  return makeRequest(`/integrations/connectStatus?connectId=${connectId}`)
  // return makeRequest('/integrations/' + serviceName)
}

/**
 * @param {string} serviceName
 * @param {string} streamId
 */
function checkIntegrationConflict(streamId, oauthMetaId) {
  return makeRequest(`/integrations/conflictCheck?streamId=${streamId}&oauthMetaId=${oauthMetaId}`)
  // return makeRequest('/integrations/' + serviceName)
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
 * @param {string} integrationId
 * @param {string} streamId
 * @param {string} integrationId
 */
function getServiceIngest(linkedMetaId) {
  // let url = `/integrations/${serviceName}/ingest?stream=${streamId}`
  let url = `/integrations/${linkedMetaId}/ingest`
  // if (integrationId) url += `&integration=${integrationId}`

  return makeRequest(url)
  // return makeRequest('/integrations/' + serviceName)
}

/**
 * @param {string} username
 */
function getMixerFTLUrl(username) {
  let url = `/integrations/mixerFTL/username/${username}`
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

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
  getMixerFTLUrl,
  getIntegrationMetadata,
  updateIntegrationMetadata,
  getDiscordIntegrations,
  saveDiscordIntegration,
  updateDiscordIntegration,
  deleteDiscordIntegration,
  buildStreamChatUrl
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

/*
 * @param {string} linkedMetaId
 */
function getIntegrationMetadata(linkedMetaId) {
  let url = `/integrations/${linkedMetaId}/metadata`
  return makeRequest(url)
}

/**
 * @param {string} linkedMetaId
 */
function updateIntegrationMetadata(linkedMetaId, metaUpdates) {
  let url = `/integrations/${linkedMetaId}/metadata/update?isLinkedOAuth=1`
  return makeRequest({
    path: url,
    method: 'put',
    data: {
      metadata: metaUpdates
    }
  })
}

/**
 * @param {string} streamId
 */
function getDiscordIntegrations(streamId) {
  let url = `/integrations/stream/${streamId}/discord/webhooks`
  return makeRequest(url)
}

/**
 * @param {string} streamId
 * @param {string} integrationId
 */
function saveDiscordIntegration(streamId, discordConfig) {
  let url = `/integrations/discord/webhooks?stream=` + streamId

  return makeRequest({
    path: url,
    method: 'post',
    data: { discord: discordConfig }
  })
}

/**
 * @param {number} channelId
 * @param {object} updates
 */
function updateDiscordIntegration(integrationId, updates) {
  let url = `/integrations/${integrationId}/discord/webhooks`
  return makeRequest({
    path: url,
    method: 'put',
    data: { updates }
  })
}

/**
 * @param {string} channelId
 */
function deleteDiscordIntegration(integrationId) {
  let url = `/integrations/${integrationId}/discord/webhooks`
  return makeRequest({
    path: url,
    method: 'delete'
  })
}

/**
 * @param {string} streamId
 */
function buildStreamChatUrl(streamId) {
  let url = `/integrations/chat/buildStreamChatUrl/${streamId}`
  return makeRequest({
    path: url,
    method: 'POST'
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

  let res
  try {
    res = await Vue.axios.request(reqConfig)
  } catch (err) {
    throw new RequestError(err.response.data)
  }

  return res.data
}

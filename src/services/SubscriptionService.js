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
  getUserSubscriptions,
  getUserBillingHistory,
  getSubscriptionPackages,
  orderSubscription,
  requestTrial
}

async function getUserSubscriptions(getPackageDetails) {
  const config = {
    path: '/subscriptions/user'
  }

  if (getPackageDetails) {
    config.params = { explicit: 1 }
  }

  let response = await makeRequest(config)

  try {
    let basePack = response.subscription
    let restreamExpiry = new Date(basePack.cend)
    let subPayload = {restreamExpiry: restreamExpiry}

    _.each(response.addonSubscriptions, (sub) => {
      subPayload[`${sub.category}Expiry`] = new Date(sub.end)
    })

    window.Intercom('update', subPayload)
  } catch (e) {}

  return response
}

function getUserBillingHistory() {
  return makeRequest('subscriptions/user/transactions')
}

function getSubscriptionPackages() {
  return makeRequest('/subscriptions/packages')
}

/**
 * @param {string} packageId
 * @param {number} quantity
 * @param {string} paymentSourceToken
 */
function orderSubscription(packageId, quantity, paymentSourceToken) {
  return makeRequest({
    path: '/subscriptions/order',
    method: 'post',
    data: {
      subscription: { package: packageId, quantity, paymentSourceToken }
    }
  })
}

/**
 * @param {string} packageId
 * @param {number} quantity
 * @param {string} paymentSourceToken
 */
function requestTrial(packCategory) {
  return makeRequest({
    path: `/subscriptions/trials/${packCategory}`,
    method: 'post'
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

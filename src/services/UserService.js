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
  login,
  register,
  authenticated,
  setSession,
  unsetSession,
  getUser,
  getUserId,
  getUserToken,
  changeName,
  changeUsername,
  requestPasswordReset,
  validatePasswordReset,
  changePassword
}

function authenticated() {
  return getUserId() && getUserToken()
}

function login(email, password) {
  return makeRequest({
    method: 'post',
    path: '/users/login',
    data: { email, password }
  })
}

/**
 * @param {object} user
 * @param {string} user.name
 * @param {string} user.email
 * @param {string} user.password
 * @param {object} user.phoneCaptchaResponse
 * @param {string} user.phoneCaptchaResponse.code
 * @param {string} user.phoneCaptchaResponse.token
 * @param {string} user.phoneCaptchaResponse.phone
 */
function register(user) {
  return makeRequest({
    method: 'post',
    path: '/users/register',
    data: { user }
  })
}

function setSession(user, token) {
  Vue.localStorage.set('user', JSON.stringify(user))
  Vue.localStorage.set('token', token)
  Vue.axios.defaults.headers.common['auth-token'] = token
}

function unsetSession(user, token) {
  Vue.localStorage.remove('user')
  Vue.localStorage.remove('token')
  delete Vue.axios.defaults.headers.common['auth-token']
}

function getUserId() {
  let user = Vue.localStorage.get('user', null, Object)
  return user && user._id
}

function getUserToken() {
  return Vue.localStorage.get('token', null, String)
}

function getUser() {
  return Vue.localStorage.get('user', null, Object)
}

/**
 * @param {string} name
 */
async function changeName(name) {
  await makeRequest({
    method: 'put',
    path: `/users/${getUserId()}/update`,
    data: { updates: { name } }
  })

  const updatedUser = _.assign({}, getUser(), { name })
  Vue.localStorage.set('user', JSON.stringify(updatedUser))
}

/**
 * @param {string} username
 */
async function changeUsername(username) {
  await makeRequest({
    method: 'put',
    path: `/users/username`,
    data: { updates: { username } }
  })

  const updatedUser = _.assign({}, getUser(), { username })
  Vue.localStorage.set('user', JSON.stringify(updatedUser))
}

/**
 * @param {string} email
 */
async function requestPasswordReset(email) {
  await makeRequest({
    method: 'post',
    path: `/users/support/reset-password/request`,
    data: { email }
  })
}

/**
 * @param {string} token
 * @param {string} password
 * @param {string} confirmPassword
 */
async function validatePasswordReset(token, password, confirmPassword) {
  await makeRequest({
    method: 'post',
    path: `/users/support/reset-password/verify`,
    data: { token, password, confirmPassword }
  })
}

/**
 * @param {object} form
 * @param {string} form.currentPassword
 * @param {string} form.newPassword
 * @param {string} form.newPasswordConfirm
 */
function changePassword(form) {
  return makeRequest({
    method: 'post',
    path: `/users/${getUserId()}/reset-password`,
    data: form
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

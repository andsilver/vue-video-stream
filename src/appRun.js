import Vue from 'vue'
import _ from 'lodash'
import io from 'socket.io-client'
import UserService from './services/UserService'
import StreamService from './services/StreamService'
import SubscriptionService from './services/SubscriptionService'

export default function appRun() {
  // setup api base in http service
  const route = window.location
  // const baseURL = 'https://castr.io:22777'
  const baseURL = 'https://staging.castr.io:22777'
  // const baseURL = `${route.protocol}//${route.hostname}:22777`
  Vue.axios.defaults.baseURL = baseURL

  Vue.axios.defaults.timeout = 30 * 1000
  Vue.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

  const token = UserService.getUserToken()
  if (token) {
    Vue.axios.defaults.headers.common['auth-token'] = token
  }

  Vue.axios.interceptors.response.use(res => res, (error) => {
    const statusCode = _.get(error, 'response.status')
    if (statusCode === 401) {
      // force logout session
      Vue.localStorage.remove('user')
      Vue.localStorage.remove('token')

      const { href } = route
      // if current is not an AUTH page
      if (!/signin|signup/gi.test(href)) {
        setTimeout(() => {
          window.location.href = '/signin'
          // window.location.reload()
        }, 100)
      }
    }

    return Promise.reject(error)
  })

  if (UserService.authenticated()) {
    // prefetch available regions
    StreamService.getAvailableRegions()

    // setup Intercom chat widget
    activateIntercom()

    // setup event tracking
    setTimeout(activateEventTracking, 3000)

    // init socket io con

    // const connUrl = baseURL + `?authkey=${UserService.getUserToken()}`
    const connUrl = baseURL + `?authkey=${UserService.getUserToken()}`
    console.log('connUrl', connUrl)
    const socket = io(connUrl)
    socket.on('connect', () => {
      console.log('app event system connected')
      Vue.appEvents = socket
    })

    socket.on('error', (err) => {
      console.log('could not connect to app event system', err)
    })
  }
}

window._activateIntercom = activateIntercom
async function activateIntercom() {
  if (!window.Intercom) return

  const user = UserService.getUser()

  let userSub
  try {
    userSub = await SubscriptionService.getUserSubscriptions(true)
  } catch (e) {
    console.log('e')
  }

  let intercomConfig = {
    app_id: 'mho3vqb9',
    name: user.name,
    email: user.email,
    user_id: user._id,
    created_at: Math.round(new Date(user.joinDate).getTime() / 1000)
  }

  if (userSub) {
    const packageName = _.get(userSub, 'subscription.package.name')
    _.assign(intercomConfig, { subscription: packageName })
  }

  window.Intercom('boot', intercomConfig)
  // mark intercom activated
  window._intercomActivated = true
}

let eventTrackingRetries = 3
window._activateEventTracking = activateEventTracking
async function activateEventTracking() {
  if (!mixpanel ||
    window._eventTrackingActivated ||
    !mixpanel.get_distinct_id) {
    if (--eventTrackingRetries > 0) setTimeout(activateEventTracking, 3000)
    return
  }

  const user = UserService.getUser()

  let userSub
  try {
    userSub = await SubscriptionService.getUserSubscriptions(true)
  } catch (e) {
    console.log('e')
  }

  let payload = {
    $name: user.name,
    $email: user.email,
    $created: new Date(user.joinDate),
    $phone: user.phone
  }

  if (userSub) {
    const packageName = _.get(userSub, 'subscription.package.name')
    _.assign(payload, { subscription: packageName })
  }

  mixpanel.identify(user._id)
  mixpanel.people.set(payload)
  // mark event tracking activated
  window._eventTrackingActivated = true

  // dispatch pre-tracked events sequentially
  _.each(trackedEventsQueue, ([event, data]) => {
    window.trackEvent(event, data)
  })
}

const trackedEventsQueue = []
window.trackEvent = function(event, data) {
  if (!mixpanel) return
  if (!window._eventTrackingActivated) {
    trackedEventsQueue.push([event, data])
    return
  }

  mixpanel.track(event, data)
}

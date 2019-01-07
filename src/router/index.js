import Vue from 'vue'
import Router from 'vue-router'
import SignIn from '@/components/SignIn'
import SignUp from '@/components/SignUp'
import RequestPasswordReset from '@/components/RequestPasswordReset'
import ValidatePasswordReset from '@/components/ValidatePasswordReset'
import Payments from '@/components/Payments'
import ChannelList from '@/components/ChannelList'

import ChannelManage from '@/components/ChannelManage'
import ChannelManageDashboard from '@/components/ChannelManage/ChannelManageDashboard'
import ChannelManageChat from '@/components/ChannelManage/ChannelManageChat'
import ChannelManageDVR from '@/components/ChannelManage/ChannelManageDVR'
import ChannelManageDVRDemo from '@/components/ChannelManage/ChannelManageDVRDemo'
import ChannelManageVodEpisodes from '@/components/ChannelManage/ChannelManageVodEpisodes'

import LiveChannelManage from '@/components/LiveChannelManage'
import LiveChannelManageDashboard from '@/components/ChannelManage/LiveChannelManageDashboard'
import LiveChannelManageSettings from '@/components/ChannelManage/LiveChannelManageSettings'

import CamChannelManage from '@/components/CamChannelManage'
import CamChannelManageDashboard from '@/components/ChannelManage/CamChannelManageDashboard'
import CamChannelManageSettings from '@/components/ChannelManage/CamChannelManageSettings'

import ScheduledChannelManage from '@/components//SchedulerChannelManage'
import ScheduledChannelManageDashboard from '@/components/ChannelManage/SchedulerChannelManageDashboard'
import ScheduledChannelManageTimeline from '@/components/ChannelManage/SchedulerChannelManageTimeline'
import ScheduledChannelManageVideos from '@/components/ChannelManage/SchedulerChannelManageVideos'
import ScheduledChannelManageSettings from '@/components/ChannelManage/SchedulerChannelManageSettings'

import AppManage from '@/components/Manage'
import AdminStats from '@/components/AdminStats'
import ManageAccount from '@/components/Manage/ManageAccount'
import ManagePasswordChange from '@/components/Manage/ManagePasswordChange'
import ManageBilling from '@/components/Manage/ManageBilling'
import UserService from '../services/UserService'

Vue.use(Router)
const router = new Router({
  mode: 'history',
  routes: [{
      path: '/',
      name: 'Home',
      redirect: '/dashboard'
    },
    {
      path: '/signin',
      name: 'Signin',
      component: SignIn
    },
    {
      path: '/signup',
      name: 'Signup',
      component: SignUp
    },
    {
      path: '/forgot-password',
      name: 'RequestPasswordReset',
      component: RequestPasswordReset
    },
    {
      path: '/forgot-password/reset',
      name: 'ValidatePasswordReset',
      component: ValidatePasswordReset
    },
    {
      path: '/subscribe',
      name: 'Payments',
      component: Payments
    },
    {
      path: '/dashboard',
      name: 'ChannelList',
      component: ChannelList
    },
    {
      path: '/streams/:streamId',
      name: 'ChannelManage',
      component: ChannelManage,
      redirect: {
        name: 'ChannelManageDashboard'
      },
      children: [{
          path: 'dashboard',
          name: 'ChannelManageDashboard',
          component: ChannelManageDashboard,
          props: true
        },
        {
          path: 'chat',
          name: 'ChannelManageChat',
          component: ChannelManageChat,
          props: true
        },
        {
          path: 'recording',
          name: 'ChannelManageDVR',
          component: ChannelManageDVR,
          props: true
        },
        {
          path: 'recordingDemo',
          name: 'ChannelManageDVRDemo',
          component: ChannelManageDVRDemo,
          props: true
        }
      ]
    },
    {
      path: '/livestreams/:streamId',
      name: 'LiveChannelManage',
      component: LiveChannelManage,
      redirect: {
        name: 'LiveChannelManageDashboard'
      },
      children: [{
          path: 'dashboard',
          name: 'LiveChannelManageDashboard',
          component: LiveChannelManageDashboard,
          props: true
        },
        {
          path: 'recording',
          name: 'LiveChannelManageDVR',
          component: ChannelManageDVR,
          props: true
        },
        {
          path: 'vodepisodes',
          name: 'LiveChannelManageVodEpisodes',
          component: ChannelManageVodEpisodes,
          props: true
        },
        {
          path: 'settings',
          name: 'LiveChannelManageSettings',
          component: LiveChannelManageSettings,
          props: true
        }
      ]
    }, {
      path: '/manage',
      name: 'AppManage',
      redirect: '/manage/account',
      component: AppManage,
      children: [
        { path: 'account', component: ManageAccount },
        { path: 'change-password', component: ManagePasswordChange },
        { path: 'billing', component: ManageBilling }
      ]
    },
    {
      path: '/insights/overwatch',
      name: 'AdminStats',
      component: AdminStats
    },
    {
      path: '*',
      component: {
        template: NotFoundTemplate()
      }
    }
  ]
})

const GuestPages = ['Signin', 'Signup', 'RequestPasswordReset', 'ValidatePasswordReset']

router.beforeEach((to, from, cb) => {

  const loggedin = UserService.authenticated()
  if (GuestPages.indexOf(to.name) > -1) {
    if (loggedin) {
      return cb({ name: 'Home' })
    }

  } else {
    if (!loggedin && GuestPages.indexOf(to.name) === -1) {
      // return cb({ name: 'Signin' })
      window.location.href = '/signin'
      // return cb({ name: 'Signin' })
      return
    }
  }

  // window.trackEvent(to.name, { url: to.path, query: to.query })

  cb()
})

// router.afterEach((to, from) => {
//   console.log('to', to)
// })

function NotFoundTemplate() {
  return `<div class='container-wrapper modal-body text-center' style='color: #f7f7f7;padding-top:50px;'>
    <h1 style='font-size:72px;'>404</h1>
    <h3 class='no-margin'>Not Found</h3>
    <br>
    <p>Sorry, system was uanble to digest what you require</p>
    <p>Goto <router-link to="/dashboard">Dashboard</router-link></p>
  </div>`
}

export default router

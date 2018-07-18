<template>
  <div id="app">
    <app-navbar v-if="authenticated()" />
    <div style="margin-bottom: 125px;" :style="{minHeight: winHeight || 'auto'}">
      <router-view/>
    </div>
    <notifications group="error" classes="vue-notification error" position="bottom right"/>
    <notifications group="success" classes="vue-notification success" position="bottom right"/>
    <notifications group="info" classes="vue-notification info" position="bottom right"/>
    <app-footer />
    <div id="thumb-temp-loader"></div>
  </div>
</template>

<script>
import AppNavbar from "./components/AppNavbar";
import AppFooter from "./components/AppFooter";
import UserService from "./services/UserService";
export default {
  name: "App",
  mounted () {
    this.computeWinHeight()
  },
  watch: {
    $route (to, form) {
      setTimeout(this.computeWinHeight, 0)
    }
  },
  data () {
    return {
      winHeight: null
    }
  },
  methods: {
    authenticated () {
      return UserService.authenticated()
    },
    computeWinHeight () {
      this.winHeight = (window.innerHeight-50) + 'px'
    }
  },
  components: { AppNavbar, AppFooter }
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  position: relative;
}
#thumb-temp-loader {
  opacity: 0;
  width: 0;
  height: 0;
  overflow: hidden;
}
#thumb-temp-loader img {
}
</style>

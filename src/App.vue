<template>
  <div id="app">
    <app-navbar v-if="authenticated()" />
    <div style="margin-bottom: 125px;" :style="{minHeight: winHeight || 'auto'}">
      <router-view @updateTitle="changeWinTitle"/>
    </div>
    <notifications group="error" classes="vue-notification error" style="top:10px;right:10px"/>
    <notifications group="success" classes="vue-notification success" style="top:10px;right:10px"/>
    <notifications group="info" classes="vue-notification info" style="top:10px;right:10px"/>
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
  mounted() {
    this.computeWinHeight();    
  },
  watch: {
    $route(to, form) {
      setTimeout(this.computeWinHeight, 0);
    }
  },
  data() {
    return {
      winHeight: null
    };
  },
  methods: {
    changeWinTitle (viewTitle) {
      let updatedTitle = 'Castr WebApp'
      if (viewTitle)
        updatedTitle = viewTitle + ' - '  +  updatedTitle
      else 
        updatedTitle = 'Castr | '  +  updatedTitle

      document.title = _.trim(updatedTitle)
    },
    authenticated() {
      return UserService.authenticated();
    },
    computeWinHeight() {
      this.winHeight = window.innerHeight - 50 + "px";
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
html {
  font-size: 13px;
}

body {
  margin: 0;
  padding: 0;
  font-family: comfortaa !important;
  color: #f7f7f7;
  /* background-color: #010329 !important; */
  background-color: #192035 !important;
}

.absolute {
  position: absolute;
}

.inline-block {
  display: inline-block;
}

.dropdown-item {
  padding: 0 !important;
}

#player-color .dropdown-item {
  padding: 5px 9px !important;
}
#player-color .dropdown-item:hover {
  /* background-color: red; */
  background-color: rgba(145, 145, 145, 0.3);
}
#player-color button.btn {
  padding-top: 0!important;
  padding-bottom: 0!important;
}
/* rgb(92, 92, 92) */

.dropdown-item a,
.dropdown-item .a {
  display: block;
  color: inherit;
  padding: 0.25rem 1.5rem;
}

.dropdown-item a:hover {
  text-decoration: none;
}

.dropdown-item a:active,
.dropdown-item a:active a {
  color: inherit;
}

.modal-content {
  background-color: #202940 !important;
  color: #f7f7f7;
  padding: 10px;
}

.modal-content .modal-header,
.modal-content .modal-footer {
  border: none !important;
}

.modal-content .modal-header {
  font-size: 16.5px !important;
  letter-spacing: -0.3px;
}

.modal-platform .modal-footer {
  justify-content: center;
}
.modal-platform .modal-footer .footer-wrapper {
  justify-content: center;
}
.modal-platform .modal-sm {
  max-width: 400px !important;
}

.modal-button {
  border: none;
  padding: 8px 30px;
  color: #f7f7f7;
  background-color: transparent;
  text-transform: capitalize;
  font-size: 13.5px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 50px;
  outline: none !important;
}

.modal-button.bordered {
  border: 1px solid #31346b;
}

.modal-button-variant2 {
  padding-top: 9px;
  padding-bottom: 9px;
}

.modal-button-sm {
  padding: 5px 12px;
  font-size: 11.5px;
}

.modal-button-lg {
  font-size: 14.5px;
}
.modal-button-link {
  text-decoration: underline;
}

.modal-button:hover {
  background-color: rgb(13, 15, 61);
}

.modal-button:active {
  background-color: rgb(13, 15, 50);
}

.modal-button:disabled {
  cursor: not-allowed;
  background-color: rgb(13, 15, 61);
}
.modal-button:disabled:hover {
  background-color: rgb(13, 15, 61);
}

.modal-button.highlight {
  background-color: #ab3147;
}

.modal-button.highlight:hover {
  background-color: #8d1d32;
}

.text-dimm {
  color: #8789a8 !important;
  font-size: 12.5px;
}

.table {
  border: 1px solid #272a51;
  color: #f7f7f7 !important;
}

.table thead th {
  background-color: #192035 !important;
  border: none;
}

.table td {
  border: none !important;
  border-top: none !important;
  border-bottom: 1px solid #272a51 !important;
}

.table td:last-of-type {
  border-color: transparent;
}

.alert {
  font-size:14px;
  padding: 5px 10px !important;
  text-align: center !important;
}

.alert::first-letter,
.alert *::first-letter {
  text-transform: uppercase;
}

.alert.left {
  text-align: left !important;
}

.alert.inline {
  display: inline-block;
}

.alert-danger {
  color: #ffffff !important;
  background-color: #c6354f !important;
  border: none !important;
}

.page-placeholder {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-placeholder-content {
  display: inline-block;
  padding: 10px;
  height: 200px;
  font-size: 20px;
}

.vue-notification.info {
  /* background-color: #64aaf4; */
  background-color: rgb(40, 44, 131);
  border-color: rgb(21, 25, 97);
}

.region-dropdown,
.package-dropdown {
}

.region-dropdown .dropdown-menu,
.package-dropdown .dropdown-menu {
  width: 99%;
  border-radius: 0;
  left: 2px !important;
}

.package-dropdown .dropdown-menu {
  width: auto;
}

.region-dropdown .dropdown-menu .dropdown-item,
.package-dropdown .dropdown-menu .dropdown-item {
  outline: none !important;
}

.region-dropdown button,
.package-dropdown button {
  width: inherit;
  text-align: left;
  padding: 10px 14px;
  background-color: #010329;
  border: 1px solid transparent;
  outline: none !important;
}

.package-dropdown button {
  background-color: transparent;
  padding-left: 0;
  padding-top: 5px;
  padding-bottom: 5px;
}

.region-dropdown button:hover,
.package-dropdown button:hover {
  background-color: #010329;
  border-color: transparent;
}

.region-dropdown button:active,
.package-dropdown button:active {
  border-color: #007bff;
}

.region-dropdown .region-dropdown-item,
.package-dropdown .package-dropdown-item {
}

.region-dropdown-item.selected,
.region-dropdown-item:hover,
.package-dropdown-item.selected,
.package-dropdown-item:hover {
  background-color: #007bff;
  color: #ffffff;
}

.region-dropdown-item-placeholder,
.package-dropdown-item-placeholder {
  padding: 0 !important;
}

.region-dropdown-item-placeholder:hover,
.package-dropdown-item-placeholder:hover {
  background-color: transparent !important;
}

.region-dropdown-item-placeholder .region-flag {
  width: 22px !important;
  margin-top: -1px;
}

.region-dropdown-item-placeholder .region-name,
.package-dropdown-item-placeholder .package-name {
  font-size: inherit !important;
}

.region-dropdown-item .region-flag {
  display: inline-block;
  margin-right: 10px;
  width: 28px;
}

.region-dropdown-item .region-name,
.package-dropdown-item .package-name {
  display: inline-block;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.package-dropdown-item .package-price {
  display: inline-block;
  margin-left: 7px;
  letter-spacing: -0.5px;
  font-size: 14.5px;
}

.ringcaptcha.widget {
  background-color: #090b39 !important;
  border: none !important;
  color: #e4e8e9 !important;
}

.ringcaptcha.widget .brand {
  display: none !important;
}

.ringcaptcha.widget a {
  color: #007bff !important;
}

.ringcaptcha.widget .wizard .wizard-check-step .wizard-step-footer a {
  font-weight: 400 !important;
}

.ringcaptcha.widget .wizard .wizard-check-step .wizard-step-footer a:hover {
  color: #ffffff;
}

.ringcaptcha.widget .wizard .wizard-check-step .wizard-step-content {
  background-color: transparent !important;
  width: 110% !important;
}

.ringcaptcha.widget .wizard .wizard-check-step .wizard-step-content > div {
  width: 100% !important;
}

.modal-fullscreen1 .modal {
  padding: 0 !important;
}

.modal-fullscreen1 .modal-dialog {
  max-width: 100%;
  height: 100%;
  margin: 0;
  align-items: flex-start !important;
}

.modal-fullscreen1 .modal-header {
  /* padding-left: 65px; */
}

.modal-fullscreen1 .modal-content {
  border: 0;
  border-radius: 0;
  min-height: 100%;
  height: auto;
}

.modal-fullscreen1.modal-fullscreen-right .modal-dialog {
  position: absolute;
  right: 0;
  min-width: 350px;
}

.modal-fullscreen2 .modal {
  padding: 0 !important;
}

.modal-fullscreen2 .modal-dialog {
  max-width: 100%;
  height: 100%;
  margin: 0;
}

.modal-fullscreen2 .modal-content {
  width: calc(100% - 2rem);
  min-height: 100%;
  height: auto;
  margin: 1rem;
}

.blink {
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.to-right {
  float: right;
}
.form-group {
  margin-bottom: 0 !important;
}
.nav-menu-inline {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.nav-menu-inline li {
  padding: 0;
  margin: 0;
  margin-right: 20px;
  font-weight: normal;
  text-transform: uppercase;
  display: inline-block;
  cursor: pointer;
  opacity: 0.75;
}

.nav-menu-inline li:hover {
  opacity: 1;
}

.nav-menu-inline li.active {
  font-weight: 500;
  opacity: 1;
  font-weight: 600;
}
.nav-menu-inline li.li-disabled {
  color: #b0b0b0;
  /* cursor: not-allowed; */
}
.no-pointer {
  pointer-events: none;
}
</style>

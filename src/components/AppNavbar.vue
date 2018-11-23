<template>
  <div class="navbar container">
      <div class="row">
        <div class="col-md-4">
          <a href="/app/dashboard"><img class="logo-icon" src="../assets/castr.png" alt="castr"></a>
          <!-- <h3 class="logo">Castr</h3> -->
        </div>
        <div class="col-md-4"></div>
        <div class="col-md-4">
          <b-dropdown right
                      no-caret
                      id="navdd" 
                      variant="link" 
                      class="m-md-2 float-right"
                      style="margin:0 !important;">
              <template slot="button-content">
                <span style="color: white;">
                  <!-- Wahaj Dar&nbsp; <i class="fa fa-caret-down"></i> -->
                  <span class="avatar-badge">{{userInitials()}}</span>&nbsp; <i class="fa fa-caret-down"></i>
                </span>
              </template>
              <div class="desc" style="min-width: 180px;">
                <div>{{user.name}}</div>
                <!-- <div class="text-muted">{{user.email}}</div> -->
                <div class="text-muted">{{user.username}}</div>
              </div>
              <b-dropdown-item>
                <router-link to="/dashboard">Dashboard</router-link>
              </b-dropdown-item>
              <b-dropdown-item>
                <router-link to="/manage/account">Account</router-link>
              </b-dropdown-item>
              <b-dropdown-item>
                <router-link to="/manage/billing">Billing</router-link>
              </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item>
                <a href="#" @click="forceLogout">Logout</a>
              </b-dropdown-item>
          </b-dropdown>
          <router-link to="/subscribe">
            <button class="btn btn-danger float-right"
                   style="margin-top:5px;margin-right:5px;letter-spacing:1px;">UPGRADE</button>
          </router-link>
        </div>
      </div>
  </div>
</template>

<script>
import _ from "lodash";
import UserService from "../services/UserService";

export default {
  name: "AppNavbar",
  data() {
    return {
      user: UserService.getUser(),
      userInitials() {
        if (!this.user) return

        return _.split(this.user.name, " ")
          .map(str => _.capitalize(str).slice(0,1))
          .slice(0, 2)
          .join("");
      }
    }
  },
  methods: {
    forceLogout () {
      UserService.unsetSession()
      // this.$router.push({ name: 'Signin' })
      this.$notify({ group: "info", text: "Logged out" });
      
      // track event
      window.trackEvent('Logged Out')

      setTimeout(() => {
        window.location.href = '/signin'
      },1000)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.navbar {
  height: 60px;
  padding: 12px;
  padding-top: 20px;
  color: #f7f7f7;
  box-sizing: border-box;
  display: block;
}
.logo-icon {
  width: 122px;
  height: auto;
  display: inline-block;
  vertical-align: top;
}
.logo {
  font-size: 20px;
  margin: 0;
  padding: 0;
  font-weight: 400;
  margin-left: 10px;
  display: inline-block;
}
.avatar-badge {
  width: 42px;
  height: 42px;
  color: white;
  display: inline-block;
  text-align: center;
  background-color: rgb(57, 65, 89);
  border: 1px solid #171a25;
  margin-top: -5px;
  padding: 12px 10px;
  box-sizing: border-box;
  border-radius: 100px;
  font-size: 14px;
}
.desc {
  padding: 10px 20px;
  cursor: default;
}
</style>

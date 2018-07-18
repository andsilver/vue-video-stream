<template>
  <div class="view-wrapper" :style="{ 'min-height': minWindowHeight || 'auto' }">
    <div class="form">
      <div class="text-center">
        <h3 class="title">
          <!-- <img class="logo-icon" src="../assets/logo.png" alt="castr logo"> -->
          <img class="logo-icon" src="/static/images/castr_lg.png" alt="castr logo">
          <!-- <span>Castr</span> -->
        </h3>
        <p style="font-size:15px;">Single Ingest, Unlimited Platforms</p>
      </div>
      <br>
      <!-- error placeholder -->
      <b-alert v-if="error"
               show
               variant="danger"
               class="left inline"
               style="margin:15px 0;">{{error.message}}</b-alert>

      <div class="field-container">
        <div class="label">
          <span>username</span>
          <span style="text-transform:lowercase;"> / </span>
          <span>email</span>
        </div>
        <input v-model="form.user"
               type="email"
               class="input" 
               placeholder="username or email"
               @keypress="onInputChange('user')"
               @keypress.enter="tryLogin"/>

        <p v-show="formErrors.user" class="text-danger">identify yourself</p>
      </div>

      <div class="field-container" style="margin-bottom:10px;">
        <div class="label">password</div>
        <input v-model="form.password"
               type="password"
               class="input" 
               placeholder="Enter password"
               @keypress="onInputChange('password')"
               @keypress.enter="tryLogin"/>

        <p v-show="formErrors.password" class="text-danger">specify password</p>
      </div>
      <div v-if="!authenticated">
        <b-row v-if="!processing">
          <b-col>
            <b-button variant="primary" 
                      class="button"
                      style="padding: 10px 25px;font-weight:600;"
                      @click="tryLogin">SIGN IN</b-button>
          </b-col>
          <b-col style="padding-top:5px;">
            <router-link to="/forgot-password">Forgot password?</router-link>
          </b-col>
        </b-row>
            
        <b-progress v-if="processing"
                    :value="100" 
                    :max="100" 
                    animated
                    class="w-100" style="margin-top:5px;"></b-progress>
        
        <div style="margin-top:30px;">
          Don't have an account?
          <br>
          <router-link to="/signup">Get Started</router-link>
        </div>
      </div>
      <div v-else class="text-center">
        System will now redirect
      </div>

    </div>
  </div>
</template>

<script>
import UserService from "../services/UserService";

export default {
  name: "SignIn",
  mounted() {
    this.minWindowHeight = window.innerHeight + "px";
  },
  data() {
    return {
      minWindowHeight: null,
      error: null,
      processing: false,
      authenticated: false,
      formErrors: {
        user: false,
        password: false
      },
      form: {
        user: null,
        password: null
      },
      onInputChange(prop) {
        this.formErrors[prop] = false;
      }
    };
  },
  methods: {
    async tryLogin() {
      this.error = null;
      if (!this.validateForm()) return;

      this.processing = true;
      try {
        const { user, authKey } = await UserService.login(
          this.form.user,
          this.form.password
        );
        UserService.setSession(user, authKey);
        // this.$router.push({ name: 'Home' })
        this.$notify({ group: "success", text: "Successfully logged in" });
        this.authenticated = true;

        setTimeout(() => {
          window.location.href = window.location.origin + "/app/dashboard";
          // bootup intercom chat plugin
          if (!window._intercomActivated) window._activateIntercom();
        }, 1000);
      } catch (err) {
        this.error = err;
      }

      this.processing = false;
    },
    validateForm() {
      const props = _.keys(this.form);
      let valids = 0;
      _.each(props, prop => {
        const val = this.form[prop];
        if (val) valids++;
        this.formErrors[prop] = !val;
      });

      return valids === props.length;
    }
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.view-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background-color: #17193e;
}
.title {
  font-size: 42px;
  color: #f7f7f7;
  font-weight: 600;
  letter-spacing: -1px;
  text-align: center;
}
.logo-icon {
  width: 165px;
  margin-left: -5px;
}
.form {
  display: inline-block;
  align-self: center;
  padding: 60px 0;
}
.field-container {
  width: 300px;
  padding: 10px 0;
  /* border-bottom: 1px solid #22244d; */
}
.field-container:last-of-type {
  border-bottom: none;
}
.label {
  font-size: 12px;
  opacity: 0.65;
  text-transform: capitalize;
}
.input {
  display: block;
  width: 100%;
  margin: 7px 0;
  font-size: 14.5px;
  padding: 12px 14px;
  color: #ffffff;
  background-color: #010329;
  border: none;
  border-radius: 2px;
}
.input:focus {
  background-color: rgba(1, 3, 41, 0.47);
}
</style>

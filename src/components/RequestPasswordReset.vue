<template>
  <div class="view-wrapper" :style="{ 'min-height': minWindowHeight || 'auto' }">
    <div class="container">
      <a href="/"><img class="logo-icon" src="/static/images/castr_lg.png" alt="castr logo"></a>
      <div class="form">
        <div class="subtitle">Forgot Password</div>
        <p>
          We can help you reset your password and security info.<br>
          First, enter your registered email address and follow<br> the instructions mentioned.
        </p>
        <br>
        <!-- error placeholder -->
        <b-alert v-if="error"
                 show
                 variant="danger"
                 class="left inline"
                 style="margin:15px 0;">{{error.message}}</b-alert>

        <div class="field-container">
          <div class="label">* TYPE IN YOUR EMAIL ADDRESS</div>
          <input v-model="email"
                 type="email"
                 class="input" 
                 placeholder="example@mail.io"
                 @keypress="onInputChange('email')" />

          <p v-show="formErrors.email" class="text-danger">identify yourself</p>
        </div>

        <div v-if="!requested">
          <b-button v-if="!processing"
                    variant="primary" 
                    class="button"
                    style="padding: 10px 25px;font-weight:600;"
                    @click="requestReset">REQUEST RESET</b-button>
              
          <b-progress v-if="processing"
                      :value="100" 
                      :max="100" 
                      animated
                      style="margin-top:5px;width:300px;"></b-progress>
          
          <div style="margin-top:30px;">
            <!-- Getting few hints? try <router-link to="/signin">Sign in</router-link> instead -->
            Getting few hints? try <a href="/signin">Sign in</a> instead
          </div>
        </div>
        <div v-else>
          <div class="text-success"
               style="font-size:15px;">
            <i class="fa fa-check-circle"></i>
            Please check your mailbox
          </div>
          <div style="margin-top:20px;">
            <!-- back to <router-link to="/signin">Sign in</router-link> -->
            back to <a href="/signin">Sign in</a>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import UserService from "../services/UserService";

export default {
  name: "RequestPasswordReset",
  mounted () {
    this.minWindowHeight = window.innerHeight + 'px'
  },
  data() {
    return {
      minWindowHeight: null,
      error: null,
      requested: false,
      processing: false,
      email: null,
      formErrors: {
        email: false
      },
      onInputChange(prop) {
        this.formErrors[prop] = false;
      }
    };
  },
  methods: {
    async requestReset () {
      this.error = null;
      if (!this.validateForm()) return;

      this.processing = true;

      try {
        await UserService.requestPasswordReset(this.email)

        this.$notify({ group: "info", title: "Request Sent", text: "We have sent you an email for further instructions" });
        this.requested = true

      } catch (err) {
        this.error = err;
      }

      this.processing = false;
    },
    validateForm() {
      const prop = 'email'
      const valid = !!this[prop]
      this.formErrors[prop] = !valid;

      return valid;
    }
  },
  components: { }
};
</script>

<style scoped>
.view-wrapper {
  color: #ffffff;
  background-color: #17193e;
  padding-top:20px;
}
.subtitle {
  font-size: 26px;
  color: #f7f7f7;
  font-weight: 600;
  margin-bottom: 10px;
}
.logo-icon {
  width: 96px;
  margin-left: -5px;
}
.form {
  margin-top: 100px;
}
.field-container {
  width: 300px;
  padding: 10px 0;
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

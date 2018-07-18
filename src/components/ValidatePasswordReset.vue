<template>
  <div class="view-wrapper" :style="{ 'min-height': minWindowHeight || 'auto' }">
    <div class="container">
      <a href="/"><img class="logo-icon" src="/static/images/castr_lg.png" alt="castr logo"></a>
      <div class="form">
        <div class="subtitle">Reset Password</div>
        <!-- <p>
          We can help you reset your password and security info.<br>
          First, enter your registered email address and follow<br> the instructions mentioned.
        </p>
        <br> -->
        <!-- error placeholder -->
        <b-alert v-if="error"
                 show
                 variant="danger"
                 class="left inline"
                 style="margin:15px 0;">{{error.message}}</b-alert>

        <div class="field-container">
          <div class="label">New Password</div>
          <input v-model="form.password"
                 type="password"
                 class="input" 
                 placeholder="enter new password"
                 @keypress="onInputChange('password')" />

          <p v-show="formErrors.password" class="text-danger">specify new password</p>
        </div>
        
        <div class="field-container">
          <div class="label">Confirm Password</div>
          <input v-model="form.confirmPassword"
                 type="password"
                 class="input" 
                 placeholder="re-enter new password"
                 @keypress="onInputChange('confirmPassword')" />

          <p v-show="formErrors.confirmPassword" class="text-danger">please confirm new password</p>
        </div>

        <div v-if="!requested">
          <b-button v-if="!processing"
                    variant="primary" 
                    class="button"
                    style="padding: 10px 25px;font-weight:600;"
                    @click="requestReset">Reset Password</b-button>
              
          <b-progress v-if="processing"
                      :value="100" 
                      :max="100" 
                      animated
                      style="margin-top:5px;width:300px;"></b-progress>
          
          <div style="margin-top:30px;">
            <!-- Go to <router-link to="/signin">Sign in</router-link> instead -->
            Go to <a href="/signin">Sign in</a> instead
          </div>
        </div>
        <div v-else>
          <div class="text-success"
               style="font-size:15px;">
            <i class="fa fa-check-circle"></i>
            Password reset succesfully
          </div>
          <br>
          <!-- <div>Go to <router-link to="/signin">Sign in</router-link></div> -->
          <div>Go to <a href="/signin">Sign in</a></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import UserService from "../services/UserService";

export default {
  name: "ValidatePasswordReset",
  mounted () {
    this.minWindowHeight = window.innerHeight + 'px'
    console.log(this.$route.query)
  },
  data() {
    return {
      minWindowHeight: null,
      error: null,
      requested: false,
      processing: false,
      formErrors: {
        password: false,
        confirmPassword: false,
        matchPasswords: false
      },
      form: {
        password: null,
        confirmPassword: null
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

      const token = this.$route.query.resetToken
      const {password, confirmPassword} = this.form

      const passwordsMatched = password === confirmPassword
      if (!passwordsMatched) {
        this.error = { message: 'passwords do not match' }
        return 
      }

      this.processing = true;
      try {
        await UserService.validatePasswordReset(token, password, confirmPassword)

        this.$notify({ group: "success", text: "Password has been changed successfully" });
        this.requested = true

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

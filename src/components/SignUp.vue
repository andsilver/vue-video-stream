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
      <div class="subtitle">Register Now</div>
      <br>
      <!-- error placeholder -->
      <b-alert v-if="error"
               show
               variant="danger"
               class="left inline"
               style="margin:15px 0;">{{error.message}}</b-alert>

      <div class="field-container">
        <div class="label">Name</div>
        <input v-model="form.name"
               class="input" 
               placeholder="Enter full name"
               @keypress="onInputChange('name')"
               @keypress.enter="tryLogin"/>

        <p v-show="formErrors.name" class="text-danger">what we should call you</p>
      </div>
      
      <div class="field-container">
        <div class="label">email</div>
        <input v-model="form.user"
               type="email"
               class="input" 
               placeholder="Enter email"
               @keypress="onInputChange('user')"
               @keypress.enter="tryLogin"/>

        <p v-show="formErrors.user" class="text-danger">identify yourself</p>
      </div>

      <div class="field-container">
        <div class="label">password</div>
        <input v-model="form.password"
               type="password"
               class="input" 
               placeholder="Enter password"
               @keypress="onInputChange('password')"
               @keypress.enter="tryLogin"/>

        <p v-show="formErrors.password" class="text-danger">specify password</p>
      </div>
      
      <div class="field-container" style="margin-bottom:15px;">
        <div id="phone-captcha-wrapper" data-mode="verification"></div>
        <p v-show="formErrors.phone" class="text-danger">please authorize your phone</p>
      </div>


      <div v-if="!authenticated">
        <b-button v-if="!processing"
                  variant="primary" 
                  class="button"
                  style="padding: 10px 25px;font-weight:600;"
                  @click="tryLogin">GET ACCESS</b-button>
            
        <b-progress v-if="processing"
                    :value="100" 
                    :max="100" 
                    animated
                    class="w-100" style="margin-top:5px;"></b-progress>
        
        <div style="margin-top:30px;">
          Already have an account?
          <br>
          <!-- <router-link to="/signin">Sign In</router-link> -->
          <a href="/signin">Sign In</a>
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

let ringCaptchaWidget;
export default {
  name: "SignUp",
  mounted() {
    this.minWindowHeight = window.innerHeight + "px";

    const { query } = this.$route;
    if (query.name) {
      this.form.name = query.name;
    }

    if (query.email) {
      this.form.user = query.email;
    }

    // setup RingCaptcha
    setupPhoneCaptchaWidget.call(this)
  },
  data() {
    return {
      minWindowHeight: null,
      error: null,
      processing: false,
      authenticated: false,
      formErrors: {
        name: false,
        user: false,
        password: false,
        phone: false
      },
      form: {
        name: null,
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

      const payload = {
        name: this.form.name,
        email: this.form.user,
        password: this.form.password,
        phoneCaptchaResponse: this.getPhoneCaptchaParams()
      };

      this.processing = true;
      try {
        const { user, authKey } = await UserService.register(payload);
        UserService.setSession(user, authKey);
        // this.$router.push({ name: 'Home' })
        this.$notify({ group: "success", text: "Successfully logged in" });
        this.authenticated = true;

        setTimeout(checkRedirect);
      } catch (err) {
        this.error = err;
        
        // reboot phone widget
        if (/phone/gi.test(err.message))
          setupPhoneCaptchaWidget.call(this)

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

      // manual validate phone captcha
      const phoneParams = this.getPhoneCaptchaParams();
      this.formErrors.phone = !phoneParams.code;

      return valids === props.length && !this.formErrors.phone;
    },
    getPhoneCaptchaParams() {
      const token = document.querySelector("input[name=ringcaptcha_session_id]")
        .value;
      const code = document.querySelector("input[name=ringcaptcha_pin_code]")
        .value;
      const phone = document.querySelector(
        "input[name=ringcaptcha_phone_number]"
      ).value;

      return { token, code, phone };
    }
  },
  components: {}
};

function setupPhoneCaptchaWidget() {
  ringCaptchaWidget = new RingCaptcha.Widget("#phone-captcha-wrapper", {
      app: "ufykalamu1o2i2y8eje4",
      events: {
        verified: () => {
          this.formErrors.phone = false;
        }
      }
    }).setup();
}

function checkRedirect() {
  let redirectPath = "dashboard";
  let qs = "?";

  const { search } = window.location;
  let searchParams = {};
  if (search) {
    _.each(_.split(search, "&"), chunk => {
      let [key, value] = _.split(chunk, "=");
      key = _.replace(key, /^\?/g, "");

      if (key === "continue") {
        searchParams[key] = value;
      } else if (/^_/g.test(key)) {
        key = _.replace(key, /^_/g, '')
        qs += `${key}=${value}&`
      }
    });
  }

  redirectPath = searchParams.continue || redirectPath;
  qs = _.replace(qs, /(\?|\&)$/gi, '')

  setTimeout(() => {
    window.location.href = window.location.origin + "/app/" + redirectPath + qs;
    // bootup intercom chat plugin
    if (!window._intercomActivated) window._activateIntercom();
  }, 1000);
}
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
.subtitle {
  font-size: 24px;
  color: #f7f7f7;
  font-weight: 600;
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

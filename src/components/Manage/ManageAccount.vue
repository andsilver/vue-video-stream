<template>
  <div class="view">
    <div class="row">
      <div class="col-sm-5">
        <div class="title">Account</div>
        <div>          
          <div class="field-container">
            <div class="label">Name</div>
            <input class="input" 
                   v-model="form.name"
                   placeholder="#full_name"/>
            <b-button variant="primary" 
                      @click="changeName"
                      :disabled="nameProcessing || !form.name || user.name == form.name">{{nameProcessing ? 'saving ..' : 'Change'}}</b-button>
          </div>
          <div class="field-container">
            <div class="label">username</div>
            <input class="input" 
                   placeholder="#username" 
                   v-model="form.username"
                   @keypress="onUsernameChange()"/>
            <b-button variant="primary" 
                      @click="changeUsername"
                      :disabled="unameProcessing || !form.username || user.username == form.username">{{unameProcessing ? 'saving ..' : 'Change'}}</b-button>
            <br>
            <div v-if="formErrors.username" 
                 class="text-danger" style="margin-top:10px;">{{formErrors.username.message}}</div>
            <!-- <b-form-input v-model="account.username" placeholder="@username" class="input"></b-form-input> -->
            <!-- <b-button variant="primary" disabled="">Change</b-button> -->
            
            <br>
            <br>
            <div class="label">email</div>
            <input class="input" placeholder="#email" :value="user && user.email" readonly />
          </div>
          
          <div class="field-container">
            <div class="label">Language</div>
            <div class="input">English</div>
          </div>
        </div>
      </div>
      <div class="col-sm-7">
        <!-- <div class="promo-banner">
          <p>
            <a target="_blank" href="https://en.wikipedia.org/wiki/Multi-factor_authentication">Two-factor authentication</a> adds another layer of security to your account so if your password is compromised or stolen, only you can log in.
          </p>
          <p>
            Castr supports two-factor authentication by using one-time passwords that must be generated with using the <a target="_blank" href="https://en.wikipedia.org/wiki/Time-based_One-time_Password_algorithm">TOTP</a> algorithm. That means you can use any mobile application that implements that algorithm.
          </p>

          <br>
          <a target="_blank" href="https://en.wikipedia.org/wiki/Multi-factor_authentication">
            <b-button variant="primary" class="button">Learn more</b-button>
          </a>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "../../services/UserService";

export default {
  name: "ManageAccount",
  mounted() {
    this.user = UserService.getUser();
    this.form.name = this.user.name
    this.form.username = this.user.username

    // track event
    window.trackEvent(`Account Page`)
  },
  data() {
    return {
      processing: false,
      nameProcessing: false,
      unameProcessing: false,
      user: null,
      form: {
        name: null,
        username: null
      },
      formErrors: {
        username: null
      }
    };
  },
  methods: {
    onUsernameChange () {
      this.formErrors.username = null
    },
    async changeName () {

      this.nameProcessing = true
      try {
        const {name} = this.form
        await UserService.changeName(name)

        // track event
        window.trackEvent(`Changed account name ${this.user.name} -> ${name}`)

        this.$notify({ group:'success', text: 'Account name saved' })
        this.user.name = name
      
      } catch (e) {
        this.form.name = this.user.name
        this.$notify({ group:'error', text: 'Counld not change account name' })
      }

      this.nameProcessing = false
    },
    async changeUsername () {
      this.formErrors.username = null
      
      const {username} = this.form
      if (username.length < 5) {
        this.formErrors.username = {
          message: 'must have atleast 5 letters'
        }
        return
      } 

      this.unameProcessing = true

      try {
        const {username} = this.form
        await UserService.changeUsername(username)

        // track event
        window.trackEvent(`Changed account username ${this.user.username} -> ${username}`)

        this.$notify({ group:'success', text: 'Account username saved' })
        this.user.username = username
      
      } catch (e) {
        this.formErrors.username = e
        // this.form.username = this.user.username
        this.$notify({ group:'error', text: 'Counld not change account username' })
      }

      this.unameProcessing = false
    }
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.view {
  color: #f7f7f7;
}
.title {
  color: inherit;
  font-size: 20px;
}
.field-container {
  width: 235px;
  padding: 32px 0;
  border-bottom: 1px solid #22244d;
}
.field-container:last-of-type {
  border-bottom: none;
}
.label {
  font-size: 12px;
  opacity: 0.65;
  text-transform: capitalize;
}
.input-container {
  width: 100%;
  margin: 7px 0 14px 0;
  padding: 10px 14px;
  color: #ffffff;
  background-color: #010329;
}
.input-container .input {
  padding: unset;
  color: #ffffff;
  background-color: transparent;
  width: 100%;
  margin: 0;
  text-align: center;
  outline: none !important;
  background-color: #0a0d49;
  border-bottom: 1px solid transparent;
}
.input-container .input:focus {
  background-color: #0a0d49;
  border-bottom-color: #ffffff;
}
.input-container .value-placeholder {
  display: inline-block;
}
.input {
  display: block;
  width: 100%;
  height: auto !important;
  margin: 10px 0 10px 0;
  padding: 10px 14px;
  color: #ffffff;
  background-color: #192035;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
  outline-color: #0074fc;
}
.input:focus {
  background-color: rgba(18, 23, 37, 0.67);
}
.input:read-only:focus {
  background-color: rgba(18, 23, 37, 0.67);
}
.field-container button {
  font-size: 12px;
  padding-right: 12px;
  padding-left: 12px;
}
.promo-banner {
  background-color: #101238;
  padding: 20px;
  width: 500px;
  font-size: 12.5px;
}
.promo-banner p {
  opacity: 0.85;
}
.promo-banner a:hover {
  text-decoration: none;
}
/* .promo-banner .button a {
  color: inherit;
}
.promo-banner .button a:hover {
  text-decoration: none;
} */
</style>

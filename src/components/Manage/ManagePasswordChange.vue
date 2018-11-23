<template>
  <div class="view">
    <div class="row">
      <div class="col-sm-5">
        <div class="title">Change Password</div>
        <div>
          <!-- error placeholder -->
          <b-alert v-if="error"
                   show
                   variant="danger"
                   class="left inline"
                   style="margin-top:25px;">{{error.message}}</b-alert>

          <div class="field-container">
            <div class="label">Current Password</div>
            <input v-model="form.currentPassword"
                   type="password" 
                   class="input" 
                   placeholder="current password"
                   @keypress="onInputChange('currentPassword')" />

            <p v-show="formErrors.currentPassword" class="text-danger">specify current password</p>
          </div>

          <div class="field-container">
            <div class="label">New Password</div>
            <input v-model="form.newPassword"
                   type="password" 
                   class="input" 
                   placeholder="new password"
                   @keypress="onInputChange('newPassword')" />
            
            <p v-show="formErrors.newPassword" class="text-danger">specify new password</p>
          </div>
          
          <div class="field-container">
            <div class="label">Confirm New Password</div>
            <input v-model="form.newPasswordConfirm"
                   type="password" 
                   class="input" 
                   placeholder="confirm password"
                   @keypress="onInputChange('newPasswordConfirm')" />
            
            <p v-show="formErrors.newPasswordConfirm" class="text-danger">please confirm new password</p>
          </div>

          <br>

          <b-button v-if="!processing"
                    variant="primary" 
                    class="button"
                    @click="savePassword">Save & Change</b-button>
          
          <b-progress v-if="processing"
                    :value="100" 
                    :max="100" 
                    animated
                    class="w-50"></b-progress>

        </div>
      </div>
      <div class="col-sm-7"></div>
    </div>
  </div>
</template>

<script>
import UserService from "../../services/UserService";
export default {
  name: "ManagePasswordChange",
  mounted() {
    // track event
    window.trackEvent(`Password Settings`)
  },
  data() {
    return {
      error: null,
      processing: false,
      formErrors: {
        currentPassword: false,
        newPassword: false,
        newPasswordConfirm: false
      },
      form: {
        currentPassword: null,
        newPassword: null,
        newPasswordConfirm: null
      },
      onInputChange(prop) {
        this.formErrors[prop] = false;
      }
    };
  },
  methods: {
    async savePassword() {
      this.error = null;
      if (!this.validateForm()) return;

      this.processing = true;
      try {
        await UserService.changePassword(this.form);
        this.$notify({ group: "success", title: "password reset successfully" });
        
        // track event
        window.trackEvent(`Changed account password`)

      } catch (err) {
        this.error = err;
      }

      this.processing = false;
    },
    validateForm() {
      const props = ["currentPassword", "newPassword", "newPasswordConfirm"];

      let valids = 0;
      _.each(props, prop => {
        const val = this.form[prop];
        if (val) valids++;
        this.formErrors[prop] = !val;
      });

      return valids === props.length;
    }
  }
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
  padding: 5px 0;
}
.field-container:first-of-type {
  padding-top: 32px;
}
.label {
  font-size: 12px;
  opacity: 0.65;
  text-transform: capitalize;
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
.button {
  font-size: 12px;
  padding-right: 12px;
  padding-left: 12px;
}
</style>

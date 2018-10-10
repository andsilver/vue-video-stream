<template>
  <div class="">
    <!-- Modal Component -->
    <b-modal ref="modalAddLiveChannel" 
             id="modal-add-live-channel"
             class="modal-fullscreen1 modal-fullscreen-right modal-platform"
             size="sm"
             centered
             no-close-on-backdrop>
      <template slot="modal-header">
        <div style="width: 100%">
          <b-row>
            <!-- <b-col><span v-html="modalTitle()"></span></b-col> -->
            <b-col><span>New LiveStream</span></b-col>
          </b-row>
        </div>
      </template>
      <div>
        <!-- error placeholder -->
        <b-alert v-if="error" show variant="danger">
          <div v-show="error.message">{{error.message}}</div>
          <div v-if="error.subscription"
               class="text-center" style="margin-top:10px">
            <router-link to="/subscribe?category=live">
              <button class="btn btn-sm btn-link" style="text-transform:uppercase;color: gold;"><strong>upgrade now</strong></button>
            </router-link>
          </div>

          <div v-else-if="error.role"
               class="" style="margin-top:10px">
            <p>You do not have an active Live Streaming subscription. Please subscribe if you wish to use this feature.</p>
            <br>
            <button class="modal-button" @click="dismiss">cancel</button>
            <router-link to="/subscribe?category=live">
              <button class="modal-button highlight">subscribe</button>
            </router-link>
            <br>
            <br>
          </div>
        </b-alert>

        <div v-show="operational">
          <!-- form -->
          <div class="field-container">
            <div class="label">stream name</div>
            <input v-model="channel.name"
                  class="input"
                  placeholder="#stream_name"
                  @keypress="onInputChange('name')" />
            <p v-show="formErrors.name"
              class="text-danger">specify stream name</p>
          </div>
          <div class="field-container">
            <div class="label">hosting region</div>
            
            <b-dropdown no-caret class="region-dropdown w-100" style="margin:7px 0;">
              <template slot="button-content">
                <div v-if="!selectedRegion">Select Region</div>
                <div v-else class="region-dropdown-item region-dropdown-item-placeholder">
                  <img :src="getCountryFlag(selectedRegion)" class="region-flag"/>
                  <span class="region-name">{{selectedRegion.name}}</span>
                </div>
              </template>
              <b-dropdown-item v-for="(region, index) in regions || []"
                              :key="index"
                              @click="selectRegion(region)"
                              :disabled="!!region.status">
                <div class="a region-dropdown-item" 
                    :class="{ selected: selectedRegion === region }">
                  <img :src="getCountryFlag(region)" class="region-flag"/>
                  <span class="region-name">
                    {{region.name}}
                    <span v-if="region.status" 
                          class="badge">&nbsp;{{region.status}}</span>
                  </span>
                </div>
              </b-dropdown-item>
            </b-dropdown>

            <p v-show="formErrors.region"
              class="text-danger">specify hosting region</p>
          </div>
        </div>
        <!-- <br> -->
      </div>

      <template slot="modal-footer" class="text-left">
        <div v-show="operational">
          <!-- <br> -->
          <b-progress v-if="processing" 
                      :value="100" 
                      :max="100" 
                      animated
                      class="w-75"></b-progress>
          <div v-else>
            <button type="button" 
                    class="modal-button" 
                    @click="dismiss">Cancel</button>
            <button @click="onSaveChannel"
                    type="submit"
                    class="modal-button highlight">Save</button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import _ from "lodash";
import StreamService from "../services/StreamService";
import SubscriptionService from "../services/SubscriptionService";

export default {
  name: "AddLiveChannelModal",
  async mounted() {
    this.$refs.modalAddLiveChannel.$on("hide", this.onDismiss);
    this.$refs.modalAddLiveChannel.$on("shown", this.onInit);
    this.regions = await StreamService.getAvailableRegions('live');
  },
  data() {
    return {
      processing: false,
      operational: true,
      error: null,
      channel: {
        name: null,
        region: null
      },
      selectedRegion: null,
      regions: [],
      formErrors: { name: false, region: false },
      onInputChange(prop) {
        this.formErrors[prop] = false;
      }
    };
  },
  methods: {
    async onInit() {
      this.operational = true
      this.error = null
      this.processing = true

      const sub = await SubscriptionService.getUserSubscriptions()
      this.processing = false

      const hasLiveStreamSub = !!_.find(sub.addonSubscriptions, { category: 'live' })
      if (!hasLiveStreamSub) {
        this.operational = false
        this.error = {role: true}
        return
      }
    },
    selectRegion(region) {
      this.selectedRegion = region;
      this.channel.region = region._id;
      this.onInputChange("region");
    },
    getCountryFlag(region) {
      return `https://countryflags.io/${region.identifier}/flat/24.png`;
    },
    async onSaveChannel() {
      this.error = null;

      if (!this.validateForm()) return;

      this.processing = true;

      try {
        const stream = await StreamService.addLiveStream(
          this.channel.name,
          this.channel.region
        );
        this.$emit("new-channel", stream, this.selectedRegion);
        this.dismiss();
      } catch (err) {
        this.error = err;
        this.processing = false;
        // check if subscripiton error
        if (err && err.message.indexOf('subscription') > -1) {
          this.error.subscription = true
        }
      }
    },
    dismiss() {
      this.$refs.modalAddLiveChannel.hide();
      this.onDismiss();
    },
    onDismiss() {
      this.resetForm();
      this.clearErrors();
      // lazy clear
      setTimeout(() => {
        this.processing = false;
      }, 1000);
    },
    validateForm() {
      const props = ["name", "region"];

      let valids = 0;
      _.each(props, prop => {
        const val = this.channel[prop];
        if (val) valids++;
        // else this.formErrors[prop] = true;

        this.formErrors[prop] = !val;
      });

      return valids === props.length;
    },
    clearErrors() {
      this.error = null
      this.formErrors.name = false;
      this.formErrors.region = false;
    },
    resetForm() {
      this.channel.name = null;
      this.channel.region = null;
      this.selectedRegion = null;
    }
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal-button {
  border: none;
  padding: 7px 30px;
  font-size: 15.5px;
  color: #f7f7f7;
  background-color: transparent;
  text-transform: capitalize;
  font-size: 13.5px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 50px;
  outline: none;
}
.modal-button:hover {
  background-color: rgb(13, 15, 61);
}
.modal-button:active {
  background-color: rgb(13, 15, 50);
}
.modal-button.highlight {
  background-color: #ab3147;
}
.modal-button.highlight:hover {
  background-color: #8d1d32;
}
.field-container {
  width: 100%;
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
  height: auto !important;
  margin: 7px 0 7px 0;
  padding: 10px 14px;
  color: #ffffff;
  background-color: #010329;
  border: none;
  border-radius: 2px;
}
.input:focus {
  background-color: rgba(1, 3, 41, 0.47);
}
.badge {
  font-size: 13px;
  display: inline-block;
  background: #ff738d;
  padding: 5px 8px;
  border-radius: 25px;
  color: white;
  margin-left: 11px;
  text-transform: capitalize;
}
</style>
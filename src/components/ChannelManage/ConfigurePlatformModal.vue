<template>
  <div class="">
    <!-- Modal Component -->
    <b-modal ref="modalConfigurePlatform" 
             id="modal-configure-platform"
             class="modal-fullscreen1 modal-platform"
             size="sm"
             centered
             no-close-on-backdrop>
      <template slot="modal-header">
        <div style="width: 100%">
          <b-row>
            <b-col><span v-html="modalTitle()"></span></b-col>
          </b-row>
        </div>
      </template>
      <div>
        <!-- error placeholder -->
          <b-alert v-if="error"
                   show
                   variant="danger">{{error.message}}</b-alert>
        <!-- form -->
        <div v-if="platform.custom || hasMultipleServers() || platform.customServer" class="field-container">
          <div class="label">streaming {{ platform.custom && 'platform address' || 'server' }} </div>

          <input v-if="platform.custom"
                 v-model="platformConfig.server"
                 class="input"
                 placeholder="rtmp://braodcaster_addr/"
                 @keypress="onInputChange('server')" />

          <input v-else-if="platform.customServer"
                 v-model="platformConfig.server"
                 class="input"
                 :placeholder="platform.serverInputPlaceholder || 'rtmp://braodcaster_addr/'"
                 @keypress="onInputChange('server')" />

          <div v-else-if="serverKeySegments" 
                 class="input-container"
                 @click="focusServerKeySegment">
              <div v-for="(segment, index) in serverKeySegments" :key="index">
                <input v-if="segment.input"
                       ref="segment"
                       class="input" 
                       v-model="serverKeySegmentValues[index]"
                       @change="computePlatformServerFromSegments"
                       @keypress="onInputChange('server')"
                       :placeholder="segment.placeholder"
                       :style="{width: (segment.width || 20) + 'px' }"/>
                <div v-else-if="!segment.hidden" class="value-placeholder">{{segment.text || segment}}</div>
              </div>
            </div>
                         <!-- :options="getPlatformServers(platform.template)" -->
          <b-form-select v-else
                         v-model="platformConfig.server"
                         :options="platformServers"
                         class="input"
                         @change="onInputChange('server')"></b-form-select>

          <p v-show="formErrors.server"
             class="text-danger">
            invalid {{ platform.custom && 'destination' || platform.name }} ingest address
          </p>
        </div>
        <div class="field-container">
          <div class="label">streaming key</div>
          <input v-model="platformConfig.key"
                 class="input"
                 placeholder="#streaming_key"
                 @keypress="onInputChange('key')" />
          <p v-show="formErrors.key"
             class="text-danger">specify stream key</p>
        </div>
        <br>
        <br>
      </div>

      <template slot="modal-footer" class="text-left">
        <br>
        <b-progress v-if="processing" 
                    :value="100" 
                    :max="100" 
                    animated
                    class="w-75"></b-progress>
        <div v-else>
          <button type="button" 
                  class="modal-button" 
                  @click="dismiss">Cancel</button>
          <button @click="onSavePlatform"
                  type="submit"
                  class="modal-button highlight">Save</button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import _ from "lodash";
import StreamService from "../../services/StreamService";
import platformConfigurations from "./platformConfigurations";
import utils from "@/utils";

const Platforms = platformConfigurations.platforms;
export default {
  name: "AddPlatformModal",
  props: ["stream", "platform"],
  mounted() {
    this.$refs.modalConfigurePlatform.$on("shown", this.onInit);
    this.$refs.modalConfigurePlatform.$on("hide", () => {
      this.resetForm();
      this.clearErrors();
    });
  },
  data() {
    return {
      error: null,
      processing: false,
      platformConfig: { server: null, key: null },
      serverKeySegments: null,
      serverKeySegmentValues: null,
      platformServers: [],
      formErrors: { server: false, key: false },
      modalTitle() {
        return this.platform.name;
        let title;
        if (this.platform.custom) title = this.platform.name;
        else
          title =
            `<i class="fab fa-${this.platform.name}"></i> &nbsp;` +
            _.capitalize(this.platform.name);

        return title;
      },
      onInputChange(prop) {
        this.formErrors[prop] = false;

        // remove unnecessary key chars
        if (prop === "key") {
          setTimeout(() => {
            this.platformConfig[prop] = utils.resolveStreamKey(
              this.platformConfig[prop]
            );
          });
        }
      }
    };
  },
  methods: {
    onInit() {
      this.platform.custom = this.platform.template == "custom";

      // if (!this.platformConfig.server)
      const serverAddr = this.platform.server;
      this.platformConfig.server = serverAddr;

      // if (!this.platformConfig.key)
      this.platformConfig.key = this.platform.key;

      const platformTemplate = _.find(Platforms, {
        name: this.platform.template
      });
      if (platformTemplate) {
        if (platformTemplate.customServer) {
          this.platform.customServer = true;
          this.platform.serverInputPlaceholder =
            platformTemplate.serverInputPlaceholder;
        }

        let { serverKeySegments, serverKeySegmentValues } = platformTemplate;
        if (serverKeySegments) {
          this.serverKeySegments = serverKeySegments;
          this.serverKeySegmentValues = getServerUrlSegmentValues(
            serverAddr,
            serverKeySegments
          );
        } else {
          this.platformServers = platformTemplate.servers;
        }
      }
    },
    hasMultipleServers() {
      return _.size(this.platformServers) > 1 || _.size(this.serverKeySegments);
    },
    focusServerKeySegment(event) {
      let soruceElement = event.target || event.srcElement;
      if (soruceElement instanceof HTMLInputElement) return;

      this.$refs.segment[0].focus();
    },
    computePlatformServerFromSegments() {
      let { serverKeySegments, serverKeySegmentValues } = this;
      let inputSegments = _.filter(serverKeySegments, { input: true });
      let validSegmentValues = _.compact(serverKeySegmentValues);

      if (_.size(inputSegments) !== _.size(validSegmentValues)) {
        this.platformConfig.server = null;
        return;
      }

      let serverAddr = "";
      _.each(this.serverKeySegments, (segment, index) => {
        if (segment.exclude) return;

        if (segment.input) {
          serverAddr += serverKeySegmentValues[index];
        } else {
          serverAddr += segment.text || segment;
        }
      });

      this.platformConfig.server = serverAddr;
    },
    getPlatformServers(templateName) {
      const platform = _.find(Platforms, { name: templateName });
      console.log(platform);
      return (platform && platform.servers) || [];
    },
    async onSavePlatform() {
      this.error = null;
      if (!this.validateForm()) return;

      let { server, key } = this.platformConfig;

      if (this.platform.server === server && this.platform.key === key) {
        this.dismiss();
        return;
      }

      let serverAddr = server;
      serverAddr = utils.resolveURL(serverAddr, true);

      let streamKey = key;
      streamKey = utils.resolveStreamKey(streamKey);

      this.processing = true;

      try {
        const updates = { server: serverAddr, key: streamKey }
        await StreamService.setStreamPlatformAddress(
          this.stream._id,
          this.platform._id,
          updates
        )

        // this.$emit("platform-updated", this.platform, this.platformConfig);
        this.$emit("platform-updated", this.platform, updates);
        this.dismiss();
      } catch (err) {
        this.error = err;
        this.processing = false;
      }
    },
    dismiss() {
      this.$refs.modalConfigurePlatform.hide();
      // clear up cache
      this.resetForm();
      this.clearErrors();

      // lazy clear
      setTimeout(() => {
        this.processing = false;
      }, 1000);
    },
    validateForm() {
      const props = ["server", "key"];

      let valids = 0;
      _.each(props, prop => {
        let val = this.platformConfig[prop];
        if (prop === "server") {
          let { valid } = utils.validateURL(val);
          if (!valid) val = null;
        }

        if (val) valids++;

        this.formErrors[prop] = !val;
      });

      return valids === props.length;
    },
    clearErrors() {
      this.formErrors.server = false;
      this.formErrors.key = false;
    },
    resetForm() {
      this.platformServers = [];
      this.platformConfig.key = null;
      this.platformConfig.server = null;
      this.serverKeySegments = null;
      this.serverKeySegmentValues = null;
    }
  },
  components: {}
};

function getServerUrlSegmentValues(serverAddr, serverKeySegments) {
  const pos = [];
  const url = serverAddr;

  _.each(serverKeySegments, (param, index) => {
    if (!param || param.exclude) return;

    let val = undefined;
    if (!param.input) {
      let text = param.text || param;
      let si = url.indexOf(text);
      let n = _.size(text);
      val = [si, si + n, n];
    }

    pos.push(val);
  });

  const values = [];
  _.each(pos, (each, index) => {
    let val = undefined;

    if (!each) {
      let pnode = pos[index - 1];
      let nnode = pos[index + 1];

      let si = pnode ? pnode[1] : 0;
      let ei = nnode ? nnode[0] : url.length;

      val = url.substr(si, ei - si);
    }

    values[index] = val;
  });

  return values;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.platforms-template-list {
  padding-bottom: 30px;
}

.platform-item {
  display: inline-block;
  padding: 7px;
  width: 120px;
  height: 110px;
  box-sizing: border-box;
  /* border-right: 1px solid rgb(13, 15, 61); */
  text-align: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 3px;
}
.platform-item:hover {
  /* background-color: rgb(20, 21, 59); */
  background-color: rgb(13, 15, 61);
  border-color: rgb(20, 21, 59);
}
.platform-item:last-of-type {
  border-color: transparent;
}
.platform-icon {
  font-size: 42px;
  height: 65px;
  padding-top: 7px;
}
.platform-label {
  opacity: 0.75;
  font-size: 12px;
  text-transform: capitalize;
  font-weight: 600;
}
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
  /* width: 235px; */
  width: 100%;
  padding: 10px 0;
}
.field-container:last-of-type {
  border-bottom: none;
}
.input-container {
  width: 100%;
  margin: 7px 0 14px 0;
  padding: 10px 14px;
  color: #ffffff;
  background-color: #010329;
}
.input-container > * {
  display: inline-block;
}
.input-container .input {
  padding: unset;
  color: #ffffff;
  background-color: transparent;
  width: 20px;
  margin: 0;
  text-align: center;
  outline: none !important;
  background-color: #141642;
  border-radius: 0;
  border-bottom: 1px solid transparent;
  margin-left: 2px;
  margin-right: 2px;
}
.input-container .input:focus {
  background-color: #0a0d49;
  border-bottom-color: #ffffff;
}
.input-container .value-placeholder {
  color: #b7b7b7;
  font-size: 12.5px;
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
</style>

<template>
  <div class="">
    <!-- Modal Component -->
    <b-modal ref="modalAddPlatform" 
             id="modal-add-platform"
             class="modal-fullscreen1 modal-platform"
             :size="modalSize()"
             centered
             no-close-on-backdrop>
      <template slot="modal-header">
        <div style="width: 100%">
          <b-row>
            <b-col>
              <span v-html="modalTitle()"></span>
              &nbsp;
              <b-button v-if="stage > 0"
                        variant="link" 
                        size="sm"
                        @click="stepBack">
                <i class="fa fa-angle-left"></i> back
              </b-button>
            </b-col>
            <!-- <b-col v-if="stage==1" class="text-right"></b-col> -->
          </b-row>
        </div>
      </template>
      <div>
        <section v-if="stage==0">
          <div class="platforms-template-list">
            <div class="platform-item"
                 @click="onPlatformSelect()">
              <div class="platform-icon">
                <i class="fa fa-cog"></i>
              </div>
              <div class="platform-label">Custom</div>
            </div>
            <div v-for="(platform, index) in platformTemplates"
                :key="index"
                @click="onPlatformSelect(platform)"
                class="platform-item">
              <div class="platform-icon">
                <img v-if="platform.iconUrl" :src="platform.icon" />
                <i v-else class="fab" :class="'fa-'+platform.icon"></i>
              </div>
              <div class="platform-label">{{platform.name}}</div>
            </div>
          </div>
        </section>

        <section v-else-if="stage==1">
          <!-- error placeholder -->
          <b-alert v-if="error"
                   show
                   variant="danger">
            <div>{{error.message}}</div>
            <div v-if="error.subscription"
                 class="text-center" style="margin-top:10px">
              <router-link to="/subscribe">
                <button class="btn btn-sm btn-link" style="text-transform:uppercase;color: gold;"><strong>upgrade now</strong></button>
              </router-link>
            </div>
          </b-alert>
          <!-- form -->
          <!-- <div v-if="platform.canLinkService" -->
          <!-- <div v-if="shouldShowServiceLinkingPrompt()" -->
          <div v-if="!configRequired"
               class="text-center">
              
            <br>
            <div v-if="serviceLinkProcessing">
              <p v-if="serviceLinkError">
                sorry, couldn't link with specified {{platform.name}} account
              </p>
              <p v-else>
                <span v-if="linkedServiceCreds">{{ platform.name|capitalize }} connected, saving platform</span>
                <span v-else>Connecting to {{ platform.name|capitalize }}</span>

                &nbsp; <i class="fas fa-spinner fa-spin" style="font-size:16px;"></i>
              </p>
              <button v-if="!linkedServiceCreds || serviceLinkError" 
                      type="button" 
                      class="modal-button highlight" 
                      @click="cancelServiceLinking">Cancel</button>
              <!-- <a :href="getServiceOAuthUrl()" target="_blank">
                <b-button @click="onServiceAuthURLTap"
                          variant="primary" 
                          size="lg">Connect to {{platform.name|capitalize}}</b-button>
              </a> -->
            </div>
            <div v-else>
              <div>
                <p>I would connect to my {{platform.name|capitalize}} account</p>
                <p v-if="isServiceAlreadyLinked()" class="text-danger">
                  {{platform.name|capitalize}} is already linked for this stream
                </p>
                <a v-else 
                   :href="getServiceOAuthUrl()" target="_blank">
                  <button @click="onServiceAuthURLTap"
                          class="modal-button modal-button-variant2 highlight">
                    Connect to {{platform.name|capitalize}}
                  </button>
                </a>
              </div>
              <div style="margin: 25px 0;">OR</div>
              <div>
                <p>I would provide server and stream key</p>
                <button @click="ignoreServiceLinking"
                        type="submit"
                        class="modal-button bordered">Setup with Server/Key</button>
              </div>
            </div>

          </div>
          <div v-else>
            <!-- <div v-if="customPlatform || hasMultiplePlatformServers(platform) || platform.customServer" -->
            <div v-if="shouldConfigureServer()"
                 class="field-container">
              <div class="label">streaming {{ customPlatform && 'platform address' || 'server' }} </div>

              <!-- <input v-if="customPlatform || platform.customServer" -->
              <input v-if="checkServerInputMode('input')" 
                     v-model="platform.server"
                     class="input"
                     :placeholder="platform.serverInputPlaceholder || 'rtmp://braodcaster_addr/'"
                     @keypress="onInputChange('server')" />
              
              <!-- <input v-else-if="platform.customServer"
                     v-model="platform.server"
                     class="input"
                     :placeholder="platform.serverInputPlaceholder || 'rtmp://braodcaster_addr/'"
                     @keypress="onInputChange('server')" /> -->
              
              <!-- <div v-else-if="platform.serverKeySegments"  -->
              <div v-else-if="checkServerInputMode('chunks')" 
                   class="input-container"
                   @click="focusServerKeySegment">
                <div v-for="(segment, index) in platform.serverKeySegments" :key="index">
                  <input v-if="segment.input"
                         ref="segment"
                         class="input" 
                         v-model="platform.serverKeySegmentValues[index]"
                         @change="computePlatformServerFromSegments"
                         @keypress="onInputChange('server')"
                         :placeholder="segment.placeholder"
                         :style="{width: (segment.width || 20) + 'px' }"/>
                  <div v-else-if="!segment.hidden" class="value-placeholder">{{segment.text || segment}}</div>
                </div>
              </div>
                             <!-- :options="getPlatformServers(platform.name)" -->
              <!-- <b-form-select v-else -->
              <b-form-select v-else-if="checkServerInputMode('select')"
                             v-model="platform.server"
                             :options="platform.servers"
                             class="input"
                             @keypress="onInputChange('server')"></b-form-select>

              <p v-show="formErrors.server"
                 class="text-danger">
                <!-- specify {{ customPlatform && 'destination' || platform.name }} server -->
                invalid {{ customPlatform && 'destination' || platform.name }} ingest address
              </p>
            </div>
            <p v-if="linkedServiceCreds">
              <code style="font-size:14px;">
                Some ingest details captured from connected {{platform.name|capitalize}} account
              </code>
            </p>
            <div v-else class="field-container">
              <div class="label">streaming key</div>
              <input v-model="platform.streamKey"
                     class="input"
                     :placeholder="platform.streamKeyPlaceholder || '#streaming_key'"
                     @keypress="onInputChange('streamKey')" />
              <p v-show="formErrors.streamKey"
                 class="text-danger">specify stream key</p>
            </div>

            <!-- stream metadata form -->
            <div v-if="canConfigureMetadata()">
              <div class="field-container">
                <div class="label">Stream Title</div>
                <input v-if="canConfigureMetadata('title')"
                       v-model="platform.configurableMetadata.title"
                       class="input"
                       placeholder="Enter stream title"/>
                <div v-else class="input">
                  <div class="value-placeholder">{{getMetadataPropValue('title')}}</div>
                </div>
                <!-- <p v-show="formErrors.metaTitle"
                   class="text-danger">specify stream title</p> -->
              </div>
              
              <div v-if="hasMetaProp('description')" class="field-container">
                <div class="label">Stream Description</div>

                <!-- <input v-if="canConfigureMetadata('description')"
                       v-model="platform.configurableMetadata.description"
                       class="input"
                       placeholder="Enter stream description"
                       :disabled="!canConfigureMetadata('description')"/> -->
                <textarea v-if="canConfigureMetadata('description')"
                       v-model="platform.configurableMetadata.description"
                       class="input"
                       placeholder="Enter stream description"
                       :disabled="!canConfigureMetadata('description')"></textarea>

                <!-- <input v-if="canConfigureMetadata('game')"
                       v-model="platform.configurableMetadata.game"
                       class="input"
                       placeholder="Enter stream description"
                       :disabled="!canConfigureMetadata('description')"/> -->

                <div v-else>
                  <div class="input">
                    <div class="value-placeholder">{{getMetadataPropValue('description')}}</div>
                  </div>
                  <p class="text-info" style="font-size:12.5px;">we don't want you to change this ;)</p>
                </div>
              </div>
              
              <div v-if="hasMetaProp('game')" class="field-container">
                <div class="label">Streaming Game</div>

                <input v-model="platform.configurableMetadata.game"
                       class="input"
                       placeholder="Enter game name"
                       :disabled="!canConfigureMetadata('game')"/>
              </div>
            </div>

            <b-form-checkbox v-if="!linkedServiceCreds" 
                             v-model="platform.enabled"
                             :value="true"
                             :unchecked-value="false">Push immediately</b-form-checkbox>
            <br>
          </div>
          <br>
        </section>

      </div>
      <template slot="modal-footer" class="text-left">
        <br>
          <b-progress v-if="processing" 
                      :value="100" 
                      :max="100" 
                      animated
                      class="w-75"></b-progress>
          <!-- <div v-else-if="!serviceLinkProcessing || !platform.canLinkService"> -->
          <div v-else-if="!serviceLinkProcessing || configRequired">
            <button type="button" 
                    class="modal-button" 
                    @click="dismiss">Cancel</button>
            <button v-if="canSave()"
                    @click="onSavePlatform"
                    type="submit"
                    class="modal-button highlight">Save</button>
          </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Vue from "vue";
import _ from "lodash";
import platformConfigurations from "./platformConfigurations";
import UserService from "../../services/UserService";
import StreamService from "../../services/StreamService";
import IntegrationService from "../../services/IntegrationService";
import utils from '@/utils'

const Platforms = platformConfigurations.platforms;
const ModalTitles = ["Select Streaming Platform", ""];
_.each(Platforms, plat => {
  plat.id = _.replace(plat, /\s/gi, "_");
  plat.iconUrl = true;
});

export default {
  name: "AddPlatformModal",
  props: ["stream"],
  mounted() {
    this.$refs.modalAddPlatform.$on("hide", this.onDismiss.bind(this));
    this.$refs.modalAddPlatform.$on("show", this.onInit.bind(this));
  },
  data() {
    return {
      stage: 0,
      processing: false,
      error: null,
      serviceLinkError: false,
      serviceLinkConflict: false,
      platformServerInputMode: null,
      configRequired: false,
      linkedServiceCreds: null,
      serviceLinkProcessing: false,
      platform: { enabled: false },
      customPlatform: false,
      platformTemplates: Platforms,
      formErrors: { server: false, streamKey: false },
      oauthConnectId: null,
      modalSize() {
        return this.stage > 0 ? "sm" : "lg";
      },
      modalTitle() {
        let title = ModalTitles[this.stage];
        if (this.stage === 1) {
          if (this.customPlatform) title = "Custom Platform";
          else
            title +=
              `<i class="fab fa-${this.platform.name}"></i> &nbsp;` +
              _.capitalize(this.platform.name);
        }

        return title;
      },
      onInputChange(prop) {
        this.formErrors[prop] = false;
        
        // remove unnecessary key chars
        if (prop === 'streamKey') {
          setTimeout(() => {
            this.platform[prop] = utils.resolveStreamKey(this.platform[prop])
          })
        }
      },
      canSave() {
        const validStage = this.stage > 0
        return validStage;
      }
    };
  },
  methods: {
    onInit() {},
    stepBack() {
      this.stage--;

      this.clearErrors();
      this.resetPlatform();
    },
    focusServerKeySegment(event) {
      let soruceElement = event.target || event.srcElement;
      if (soruceElement instanceof HTMLInputElement) return;

      this.$refs.segment[0].focus();
    },
    computePlatformServerFromSegments() {
      const { platform } = this;

      let { serverKeySegments, serverKeySegmentValues } = platform;
      let inputSegments = _.filter(serverKeySegments, { input: true });
      let validSegmentValues = _.compact(serverKeySegmentValues);

      if (_.size(inputSegments) !== _.size(validSegmentValues)) {
        this.platform.server = null;
        return;
      }

      let serverAddr = "";
      _.each(platform.serverKeySegments, (segment, index) => {
        if (segment.exclude) return;

        if (segment.input) {
          serverAddr += serverKeySegmentValues[index];
        } else {
          serverAddr += segment.text || segment;
        }
      });

      this.platform.server = serverAddr;
    },
    onPlatformSelect(platform) {

      this.customPlatform = !platform;
      // if (!platform) this.customPlatform = true;
      // if (!this.customPlatform)
      this.platform = _.assign({}, this.platform, _.cloneDeep(platform));
      this.platform.configurableMetadata = {}

      // compute `platformServerInputMode`
      let platformServerInputMode = 'input'
      if (_.size(this.platform.serverKeySegments))
        platformServerInputMode = 'chunks'
      else if (this.platform.servers) 
        platformServerInputMode = 'select'

      this.platformServerInputMode = platformServerInputMode

      if (this.canConfigureMetadata()) {
        this.platform.configurableMetadata = {
          title: this.getMetadataPropValue('title'),
          description: this.getMetadataPropValue('description'),
        }
      }

      let preselectedServer = this.platform.servers && this.platform.servers[0];
      if (preselectedServer) {
        preselectedServer = preselectedServer.value || preselectedServer;
        this.platform.server = preselectedServer;
      }

      this.configRequired = !this.platform.canLinkService

      // move to next step
      this.stage = 1;
    },
    shouldConfigureServer () {
      const haveConfigured = this.platform.server && this.platformServerInputMode === 'auto'

      return !haveConfigured &&
             (this.customPlatform ||
             this.platform.customServer ||
             this.hasMultiplePlatformServers(this.platform))
    },
    checkServerInputMode (matchInputMode) {
      return this.platformServerInputMode && 
             this.platformServerInputMode === matchInputMode
    },
    shouldShowServiceLinkingPrompt() {
      return !this.configRequired
      // return this.platform.canLinkService && !this.configRequired
      // return this.platform.canLinkService;
      // const bool = this.platform.canLinkService && !this.platform.ignoreServiceLinking
      // console.log('shouldShowServiceLinkingPrompt', bool)
      // return bool
    },
    ignoreServiceLinking() {
      this.configRequired = true
      this.platform.customServer = true
      console.log(this.platform.platformServerInputMode)
      // this.platform.canLinkService = false;
      // this.platform.ignoreServiceLinking=true
      // console.log(this.platform);
    },
    hasMultiplePlatformServers(platform) {
      return _.size(platform.servers) > 1 || _.size(platform.serverKeySegments);
    },
    getPlatformServers(platformId) {
      const config = PlatformConfigurations[platformId] || {};
      return config.servers || [];
    },
    getServiceOAuthUrl() {
      const { protocol, hostname } = window.location;
      const pathname = `integrations/${this.platform.name}/oauth`;

      const connectId = Date.now();
      this.oauthConnectId = connectId;

      const searchParams = `redirect=1&user=${UserService.getUserId()}&stream=${this.stream._id}&connectId=${connectId}`;
      return `${protocol}//${hostname}:22777/${pathname}?${searchParams}`;
    },
    cancelServiceLinking () {
      this.serviceLinkError = false
      this.serviceLinkConflict = false
      this.serviceLinkProcessing = false
    },
    onServiceAuthURLTap() {
      this.serviceLinkConflict = false
      this.serviceLinkProcessing = true;

      // const serviceName = this.platform.name;
      const connectId = this.oauthConnectId;

      const ackTag = "oauth-link";
      Vue.appEvents.emit("ack.listen", ackTag, connectId);

      const subkey = [ackTag, connectId].join('.')

      // #DISABLED FOR DEBUG
      Vue.appEvents.on(subkey, this.onServiceAuthResponse);

      // #ENABLED FOR DEBUG
      // this.onServiceAuthResponse({linkedMeta: "5b7414021f7c1701c0f89123"})

    },
    hasMetaProp (propname) {
      if (!this.linkedServiceCreds || 
          !this.platform.serviceAuthorization || 
          !propname) return

      const {metadata} = this.platform.serviceAuthorization
      
      let canConfigure = false
      const {fields} = metadata

      // perform multi key matching `OR`
      if (!_.isArray(propname))
        propname = [propname]

      let keyFound = false
      _.each(propname, (key) => {
        // check for property existences
        if (keyFound) return
        let field = _.find(fields, { key })
        keyFound = !!field
      })

      return keyFound
    },
    canConfigureMetadata (propname) {
      if (!this.linkedServiceCreds || 
          !this.platform.serviceAuthorization) return

      const {metadata} = this.platform.serviceAuthorization
      if (propname === undefined)
        return !!metadata
      
      let canConfigure = false
      const {fields} = metadata

      // check for property being disabled
      let field = _.find(fields, { key: propname })
      canConfigure = field && !field.disabled

      return canConfigure
    },
    getMetadataPropValue (propname, getDefinition) {
      const {fields} = this.platform.serviceAuthorization.metadata
      const field = _.find(fields, { key: propname })
      return getDefinition ? field : field && field.value
    },
    async onServiceAuthResponse (response) {
      if (!response || response.error) {
        this.serviceLinkError = true;
        return
      }

      const oauthMetaId = response.linkedMeta;
      // acknowledge UI, authorization was successful 
      this.linkedServiceCreds = oauthMetaId

      // check for linking conflicts
      let linkResult
      try {
        linkResult = await IntegrationService.checkIntegrationConflict(this.stream._id, oauthMetaId)

      } catch (E) {
        debugger
      }
      
      if (!linkResult || linkResult.linked) {
        // conflicts are there
        this.serviceLinkError = true;
        this.serviceLinkConflict = true
        this.linkedServiceCreds = null
        return
      }

      // const linkedMetaId = response.linkedMeta;
      // get ingest config
      let ingest;
      try {
        ingest = await IntegrationService.getServiceIngest(oauthMetaId);
      } catch (e) {
        this.serviceLinkError = true;
        return;
      }

      if (!ingest) {
        this.serviceLinkError = true
        return
      }

      // console.log('ingest', ingest)
      // return
      // setup service ingest
      this.platform.enabled = true;
      this.platform.streamKey = ingest.key;
      this.platform.server = ingest.server;
      this.linkedServiceCreds = ingest._id;

      // if (!ingest.server)
      // this.platformServerInputMode = 'auto'

      // check if serice supports metadata integration
      const {serviceAuthorization} = this.platform
      let configRequired = false

      // if (serviceAuthorization.metadata) {
      //   this.ignoreServiceLinking()
      //   return
      // }

      if (serviceAuthorization && serviceAuthorization.metadata) {
        configRequired = true

        // get existing metadata details
        try {
          const streamMetadata = await IntegrationService.getIntegrationMetadata(oauthMetaId)
          this.platform.configurableMetadata = streamMetadata

          // check for fixed/disabled fields
          _.each(['title', 'description', 'game'], (propname) => {
            const metaField = this.getMetadataPropValue(propname, true)
            const { disabled, value } = metaField || {}
            if (disabled)
              this.platform.configurableMetadata[propname] = value
          })

        } catch (e) {
          console.log(e)
        }
      }

      if (ingest.server)
        this.platformServerInputMode = 'auto'
      else
        configRequired = true

      this.configRequired = configRequired
      if (configRequired) return
      
      this.onSavePlatform();
    },
    isServiceAlreadyLinked() {
      const currentTemplate = this.platform.name;
      const linked = _.find(
        this.stream.platforms,
        platform =>
          platform.template === currentTemplate && platform.linkedServiceCreds
      );
      // return !!linked;
      return false;
    },
    async onSavePlatform() {
      this.error = null;
      if (!this.validateForm()) return;

      this.processing = true;

      // let serverAddr = this.platform.server
      // serverAddr = _.replace(serverAddr, /^rtmps/gi, 'rtmp')
      // serverAddr = _.replace(serverAddr, /\:443/gi, ':80')
      let serverAddr = this.platform.server
      serverAddr = utils.resolveURL(serverAddr, true)

      let streamKey = this.platform.streamKey
      streamKey = utils.resolveStreamKey(streamKey)

      const payload = {
        enabled: this.platform.enabled,
        server: serverAddr,
        key: streamKey,
        template: this.customPlatform ? "custom" : this.platform.name
      };

      if (this.canConfigureMetadata()) {
        const {title, description, game} = this.platform.configurableMetadata
        const metaUpdates = {}
        if (title) 
          metaUpdates.title = title
        if (description) 
          metaUpdates.description = description
        if (game) 
          metaUpdates.game = game

        payload.serviceMeta = metaUpdates
      }

      // debugger
      // return

      if (this.linkedServiceCreds) {
        payload.enabled = true;
        payload.linkedServiceCreds = this.linkedServiceCreds;
      }

      try {
        const platform = await StreamService.addStreamPlatform(this.stream._id, payload);
        this.$emit("platform-saved", platform);
        this.dismiss();
      } catch (err) {
        this.error = err;
        this.processing = false;
        // check if subscripiton error
        if (err && err.message.indexOf("subscription") > -1) {
          this.error.subscription = true;
        }
      }
    },
    dismiss() {
      this.$refs.modalAddPlatform.hide();
      this.onDismiss();
    },
    validateForm() {
      const props = ["server", "streamKey"];

      let valids = 0;
      _.each(props, prop => {
        let val = this.platform[prop];
        if (prop === 'server') {
          let {valid} = utils.validateURL(val)
          if (!valid) val = null
        }

        if (val) valids++;
        // else this.formErrors[prop] = true;

        this.formErrors[prop] = !val;
      });

      return valids === props.length;
    },
    onDismiss() {
      // clear up cache
      this.resetPlatform();
      this.clearErrors();

      // lazy clear
      setTimeout(() => {
        this.stage = 0;
        this.processing = false;
      }, 1000);
    },
    clearErrors() {
      this.error = null;
      this.formErrors.server = false;
      this.formErrors.streamKey = false;
    },
    resetPlatform() {
      this.platform = { enabled: false };
      this.serviceLinkError = false;
      this.linkedServiceCreds = null;
      this.serviceLinkProcessing = false;
    }
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.platforms-template-list {
  padding-top: 30px;
  padding-right: 50px;
  padding-bottom: 30px;
  padding-left: 50px;
}

.platform-item {
  display: inline-block;
  padding: 7px;
  width: 185px;
  height: 105px;
  box-sizing: border-box;
  text-align: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 3px;
  border: 1px solid #31336c;
  margin-right: 10px;
  margin-bottom: 10px;
}
.platform-item:hover {
  background-color: rgb(40, 44, 131);
  border-color: rgb(20, 21, 59);
}
.platform-icon {
  font-size: 36px;
  height: 65px;
  padding-top: 7px;
}
.platform-icon img {
  max-width: 128px;
  max-height: 36px;
  margin-bottom: 10px;
  filter: grayscale(1);
}
.platform-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
  opacity: 0.9;
}
.field-container {
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
textarea.input {
  min-height: 100px !important; 
  height: auto !important; 
}
.input:focus {
  background-color: rgba(1, 3, 41, 0.47);
}
</style>

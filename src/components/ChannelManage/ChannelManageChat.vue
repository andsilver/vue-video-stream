<template>
  <div class="container view-wrapper">

    <b-row>
      <b-col>
        <div class="webchat-wrapper">
          <div class="wrapper-title">
            <span class="webchat">Web</span> Chat Overlay
          </div>
          <br>
          <p>Copy this URL to the browser plugin of your encoding software 
            or open it in a browser.</p>
          <input class="chat-href" :value="chatOverlayURL" readonly/>
          <div class="buttons-container">
            <button class="btn btn-lg btn-info variant1"
                    :class="{ 'copied' : chatOverlayURLCopied }"
                    @click="copyChatOverlayURL">
              <span v-show="!chatOverlayURLCopied">Copy Overlay URL</span>
              <strong v-show="chatOverlayURLCopied">Copied</strong>
            </button>
            <button class="btn btn-lg btn-primary variant2"
                    @click="openChatWindow">Open Chat App</button>
          </div>

          <br>

          <!-- customisations & preview -->
          <!-- <div class="webchat-settings">
            <div class="heading">Customizations & Preview</div>
            <div class="webchat-preview"
                 :class="'font-'+webchatPreviewFontSize">
              <span>@youtube</span>
              <span>@george</span>&nbsp;
              <span>But this does put a smile on my face</span>
            </div>
          </div> -->

        </div>
      </b-col>
      <b-col>
        <div class="discordchat-wrapper">
          <div class="wrapper-title">
            sync with 
            <img class="discord-icon"
               src="/static/images/discord.png" />
          </div>
          <br>

          <div v-if="!discordIntegrations.length">
            <div class="discord-text">
              <p>Forward all your chats to a <code>Discord</code> channel instead</p>
              <p>Once integrated, Castr will send every message to your configured <code>Discord</code> channel</p>
            </div>
          </div>
          <div v-else>
              <div class="discord-channel-list">
                <div v-for="channel in discordIntegrations"
                     :key="channel.channelName"
                     class="discord-channel">
                  <div class="channel-name">
                    <code style="font-size:inherit;">{{channel.channelName}}</code>
                  </div>
                  <div class="channel-status">
                    <button @click="requestDiscordChannelDelete(channel)"
                            :disabled="channel.processing"
                            class="btn btn-link btn-xs"
                            style="font-size:10px;padding:0;">REMOVE</button>
                    &nbsp;
                    <span @click="toggleDiscordChannelStatus(channel)"
                          class="fas toggle-control"
                          :class="{ 'fa-toggle-on enabled': channel.enabled, 
                                    'fa-toggle-off': !channel.enabled,
                                    'status-processing': channel.processing }"></span>
                  </div>
                  <div class="channel-desc">added {{channel.time|ago}}</div>
                </div>
              </div>
          </div>

          <br>
          <button class="btn btn-lg btn-primary discord-setup"
                  @click="setupDiscordIntegration">
            <span v-if="discordIntegrations.length">ADD #CHANNEL</span>
            <span v-else>SYNC #DISCORD</span>
          </button>

        </div>
      </b-col>
    </b-row>

    <discord-integration-modal :stream="stream"
                               @new-channel="onNewDiscordChannel"></discord-integration-modal>
    
    <confirm-modal modal-id="discord-channel-delete-modal"
                   message="This channel will no longer receive chat messages from Castr."
                   @modal-confirm="deleteDiscordChannel"></confirm-modal>

  </div>
</template>

<script>
import StreamService from "@/services/StreamService";
import UserService from "@/services/UserService";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DiscordIntegrationModal from "./DiscordIntegrationModal.vue";
import IntegrationService from "@/services/IntegrationService";
import platformConfigurations from "./platformConfigurations";

export default {
  name: "ChannelManageChat",
  props: ["stream"],
  async mounted() {
    // event tracking
    window.trackEvent(this.stream.name + " - Chat Page", this.stream);

    this.streamId = this.stream._id;

    // populate discord integrations
    let discordIntegrations = await IntegrationService.getDiscordIntegrations(
      this.streamId
    );
    
    _.each(discordIntegrations, (discordChannel) => {
      discordChannel._enabled = discordChannel.enabled;
      discordChannel.processing = false
    });

    this.discordIntegrations = discordIntegrations;
    this.hasDiscordIntegrations = _.size(discordIntegrations) > 0;
  },
  destroyed() {},
  data() {
    return {
      streamId: null,
      processing: true,
      userSubscription: null,
      processingMessage: null,
      webchatPreviewFontSize: 'md',
      discordIntegrations: [],
      selectedDiscordChannel: null,
      hasDiscordIntegrations: false,
      chatOverlayURLCopied: false,
      getPlatformIcon(platform) {
        return this.isCustomPlatform(platform)
          ? "fa fa-cog"
          : platformConfigurations.getPlatformIcon(platform.template);
      }
    };
  },
  methods: {
    async toggleDiscordChannelStatus(channel) {
      if (channel.processing) return;

      const oldState = channel.enabled;
      const newState = !oldState;

      channel.processing = true;
      try {
        await IntegrationService.updateDiscordIntegration(channel._id, {enabled:newState})
        channel.enabled = newState;
      } catch (e) {
        this.$notify({
          group: "error",
          text: "Failed to toggle channel status"
        });
      }

      channel.processing = false;
    },
    requestDiscordChannelDelete(channel) {
      this.selectedDiscordChannel = channel;
      this.$root.$emit("bv::show::modal", "discord-channel-delete-modal");
    },
    onNewDiscordChannel(discordChannel){
      this.discordIntegrations.unshift(discordChannel)
    },
    async deleteDiscordChannel() {
      let channel = this.selectedDiscordChannel;
      channel.procesing = true;
      try {
        await IntegrationService.deleteDiscordIntegration(channel._id)
        const channelId = this.discordIntegrations.indexOf(channel);
        this.discordIntegrations.splice(channelId, 1);
      } catch (e) {
        this.$notify({
          group: "error",
          text: "Failed to toggle channel status"
        });
      }

      channel = null;
      this.selectedDiscordChannel = null;
    },
    copyChatOverlayURL() {
      if (this.chatOverlayURLCopied) return;

      try {
        this.$copyText(this.chatOverlayURL);
        this.chatOverlayURLCopied = true;
        setTimeout(() => (this.chatOverlayURLCopied = false), 2000);
      } catch (e) {
        this.$notify({
          group: "error",
          text: "Couldn't copy Chat Overlay Url"
        });
      }
    },
    openChatWindow() {
      const chatAppUrl = this.chatOverlayURLCopied;
      const chatAppTitle = `${this.stream.name} Chat`;
      const chatAppPopupOptions =
        "toolbar,scrollbars,resizable,top=100,left=100,width=450,height=700";

      window.open(chatAppUrl, chatAppTitle, chatAppPopupOptions);
    },
    setupDiscordIntegration() {
      this.$root.$emit("bv::show::modal", "modal-add-discord");
    }
  },
  computed: {
    chatOverlayURL() {
      const { protocol, hostname } = window.location;
      const chatAppUrl = `${protocol}//${hostname}/chat/web?token=${
        this.stream._id
      }__${UserService.getUserToken()}`;

      return chatAppUrl;
    }
  },
  components: {
    ConfirmModal,
    DiscordIntegrationModal
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.wrapper-title {
  font-size: 24px;
  letter-spacing: -1px;
  text-transform: capitalize;
}
.wrapper-title .webchat {
  color: #e8234f;
  font-weight: 600;
}
.webchat-wrapper,
.discordchat-wrapper {
  padding: 5px 0;
  padding-right: 40px;
}
.webchat-wrapper .chat-href {
  padding: 10px 12px;
  border: 1px solid #050619;
  border-radius: 4px;
  background-color: #191c4c;
  color: #f7fff7;
  width: 90%;
}
.webchat-wrapper .buttons-container {
  margin-top: 20px;
  display: flex;
}
.buttons-container button {
  display: inline-block;
  margin-right: 15px;
  border-radius: 3px !important;
  font-size: 13.5px;
  /* font-weight: 600; */
  padding-top: 8px;
  width: 175px;
}
.buttons-container button.variant1 {
  background-color: transparent;
  border: none;
}
.buttons-container button.variant2 {
  background-color: #334ed2;
  border: #334ed2;
}
button.variant1.copied {
  border-color: transparent;
  color: #0f9c19 !important;
  cursor: default;
}
.discordchat-wrapper {
}
.discord-icon {
  width: 115px;
}
.discord-icon-lg {
  width: 135px;
  margin-top: -10px;
}
code {
  font-size: 14px;
}
button.discord-setup {
  background-color: #334ed2;
  width: 185px;
  border-color: #334ed2;
  font-size: 13px;
  font-weight: 600;
  padding-top: 10px;
}
.discord-text p {
  margin-bottom: 8px;
}
.discord-channel-list {
}
.discord-channel-list .discord-channel {
  padding: 15px;
  margin-bottom: 10px;
  /* border: 2px dashed rgba(255, 255, 255, 0.5); */
  border: 1.75px dashed rgba(112,150,232, 0.53);
  border-radius: 4px;
}
.discord-channel .channel-name {
  display: inline-block;
  font-size: 15.5px;
  /* font-weight: 600; */
  letter-spacing: -0.5px;
  color: #7096e8;
}
.discord-channel .channel-name code {
  color: inherit;
}
.discord-channel .channel-status {
  float: right;
  margin-top: 4px;
}
.discord-channel .channel-desc {
  font-size: 12px;
  opacity: 0.75;
}
.toggle-control {
  float: right;
  color: #ffffff;
  font-size: 18px;
  margin: 0 0 0 5px;
  transition: all 0.2s linear;
}
.toggle-control.enabled {
  color: #02ffa2;
  /* color: greenyellow; */
}
.toggle-control.status-processing {
  cursor: not-allowed;
  opacity: 0.65;
  color: #ffffff;
}
.webchat-settings {
  margin-top:20px;
}
.webchat-settings .heading {
  font-size: 13.5px;
  margin-bottom: 10px;
  text-transform: uppercase;
}
.webchat-settings .webchat-preview {
  padding: 8px 14px;
  border-radius: 4px;
  background-color: #0d2360;
}
.webchat-preview.font-sm {font-size:12.5px;}
.webchat-preview.font-md {font-size:14.5px;}
.webchat-preview.font-lg {font-size:16.5px;}
.webchat-preview.font-xl {font-size:18.5px;}
</style>

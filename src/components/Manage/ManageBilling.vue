<template>
  <div class="view">
    <div class="title">Billing</div>
    <br>
    <!-- <div class="row-container">
      <b-row>
        <b-col>
          <div class="para-title">Payment Method</div>
        </b-col>
        <b-col class="text-right text-dimm">
          <span v-if="paymentMethod">
             <strong class="text-uppercase">visa</strong> ending in
          </span>
          <span v-else>Not available</span>
        </b-col>
      </b-row>
    </div>-->
    <div class="row-container">
      <b-row>
        <b-col>
          <div class="para-title">Subscriptions</div>
        </b-col>
        <b-col class="text-right text-dimm">
          <div v-if="processing">Please wait ..</div>
          <div v-else>
            <div :class="{expired: !isSubEnabled()}">
              <div>
                <div
                    v-if="!isSubEnabled()"
                    class="inline-block"
                  >Expired&nbsp;&nbsp;</div>

                <div class="subscription-badge package-category-badge sm">restream</div>
                <span class="subscription-badge">{{getSubscriptionName()}}</span>&nbsp;
                <a href="/#pricing" target="_blank">
                  <b-badge style="padding:5px 6px;border-radius:50px;">?</b-badge>
                </a>

                <router-link :to="subscriptionManagePage(null, 'restream')">
                  <!-- <b-button variant="link" size="sm">{{ sub.enabled ? 'CHANGE' : 'PAY NOW' }}</b-button> -->
                  <b-button variant="link" size="sm">
                      <span v-if="isSubEnabled()">
                        {{isPaidSubscription() ? 'CHANGE' : 'Upgrade'}}
                      </span>
                      <span v-else>PAY NOW</span>
                  </b-button>
                </router-link>
                <!-- <router-link v-if="isPaidSubscription()"
                            :to="subscriptionManagePage('cancel')">
                  <b-button variant="link" size="sm">CANCEL</b-button>
                </router-link>-->
                <b-button v-show="isSubEnabled()"
                          variant="link" 
                          size="sm" 
                          onclick="Intercom('show')">CANCEL</b-button>
              </div>
              <div v-show="isSubEnabled()" style="margin-top:7px;">
                <code style="font-size:12.5px;">USD ${{getSubscriptionFee()}}/month</code>&nbsp;
                <span v-if="isPaidSubscription()">
                  valid through
                  <strong>{{ getSubscriptionAge() | date('DD MMM, YYYY') }}</strong>
                </span>
              </div>
            </div>
            <div v-if="hasAddonSubscripitons()">
              <hr>
              <div v-for="sub in userSubscription.addonSubscriptions" :key="sub._id">
                <div :class="{expired: !sub.enabled}">
                  <div
                    v-if="!sub.enabled"
                    class="inline-block"
                    style="color:red;"
                  >Expired&nbsp;&nbsp;</div>
                  <div class="subscription-badge package-category-badge sm">{{sub.category}}</div>
                  <span class="subscription-badge">{{getSubscriptionName(sub)}}</span>&nbsp;
                  <a href="/#pricing" target="_blank">
                    <b-badge style="padding:5px 6px;border-radius:50px;">?</b-badge>
                  </a>

                  <!-- <router-link :to="subscriptionManagePage(null, sub.category'live')"> -->
                  <router-link
                    :to="subscriptionManagePage(sub.enabled ? null : 'resubscribe', sub.category)"
                  >
                    <b-button variant="link" size="sm">{{ sub.enabled ? 'CHANGE' : 'PAY NOW'}}</b-button>
                  </router-link>
                  <b-button
                    v-if="sub.enabled"
                    variant="link"
                    size="sm"
                    onclick="Intercom('show')"
                  >CANCEL</b-button>
                </div>
                <div v-show="sub.enabled" style="margin-top:7px;">
                  <code style="font-size:12.5px;">USD ${{getSubscriptionFee(sub)}}/month</code>&nbsp;
                  <span>
                    valid through
                    <strong>{{ getSubscriptionAge(sub) | date('DD MMM, YYYY') }}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </div>
    <br>
    <div class="row-container" style="border:none;">
      <div class="para-title">Transactions</div>
      <div class="text-dimm">Below are the billing transactions debited through Castr</div>
    </div>
    <br>
    <p v-if="transactionsProcessing" class="text-center">retreiving billing history</p>
    <b-table
      v-if="!transactionsProcessing"
      :fields="transactionsTableFields"
      :items="paymentHistory"
      :hover="true"
      class
    >
      <template slot="time" slot-scope="data">{{data.value | date('DD/MM/YYYY')}}</template>
      <template slot="package" slot-scope="data">
        <code class="subscription-badge sm">{{data.value.name}}</code>
      </template>
      <template slot="cycle" slot-scope="data">
        <span>{{data.item.time | date('DD/MM/YYYY')}}</span>
        <code>&nbsp;through&nbsp;</code>
        <span>{{getCycleEnd(data.item.time) | date('DD/MM/YYYY')}}</span>
      </template>
      <template slot="amount" slot-scope="data">
        <span style="font-size:12px;">USD</span>
        ${{data.value}}
      </template>
      <template slot="actions" slot-scope="data">
        <b-button variant="link" size="sm" disabled>--</b-button>
      </template>
    </b-table>
    <p
      v-if="!transactionsProcessing && !paymentHistory.length"
      class="text-center"
    >no transactions to display</p>
  </div>
</template>

<script>
import SubscriptionService from "../../services/SubscriptionService";

export default {
  name: "ManageBilling",
  async mounted() {
    try {
      // get user subscription
      this.userSubscription = await SubscriptionService.getUserSubscriptions(
        true
      );
      this.processing = false;

      const isPaid = this.isPaidSubscription();
      const packages = await SubscriptionService.getSubscriptionPackages();

      if (!isPaid) {
        const starterPack = _.chain(packages)
          .filter(p => p.baseCharge > 0)
          .sortBy(p => p.baseCharge)
          .head()
          .value();
        if (starterPack) this.superiorPackage = starterPack;
      } else {
        const basicPack = _.find(packages, { baseCharge: 0 });
        if (basicPack) this.basicPackage = basicPack;
      }

      // get user billing transactions
      this.paymentHistory = await SubscriptionService.getUserBillingHistory();
      this.transactionsProcessing = false;

      // track event
    } catch (e) {
      window.alert("error: " + e.message);
      console.log("error", e);
    }

    window.trackEvent(`Billing Details`);
  },
  data() {
    return {
      processing: true,
      transactionsProcessing: true,

      paymentMethod: null,
      basicPackage: null,
      superiorPackage: null,
      userSubscription: null,
      paymentHistory: [
        // {
        //   id: 'm87jdhcw0e8r7',
        //   cycle: { start: new Date(Date.now()-(30*24*3600000)), end: new Date() },
        //   bill: { net: 19.99 },
        //   time: new Date()
        // },
        // {
        //   id: 'cimosyndnfy',
        //   cycle: { start: new Date(Date.now()-(2*30*24*3600000)), end: new Date(Date.now()-(30*24*3600000)) },
        //   bill: { net: 19.99 },
        //   time: new Date(Date.now()-(30*24*3600000))
        // }
      ],
      transactionsTableFields: [
        { key: "time", label: "Date" },
        { key: "package", label: "subscription" },
        { key: "cycle", label: "cycle" },
        { key: "amount", label: "Billed" },
        { key: "actions", label: " " }
      ],
      getCycleEnd(cstart) {
        const cend = new Date(cstart);
        cend.setMonth(cend.getMonth() + 1);

        return cend.toString();
      },
      subscriptionManagePage(action, category) {
        let suffix = "?";
        if (action === "cancel") {
          const freePack = this.basicPackage;
          suffix += (freePack && `package=${freePack._id}&`) || "";
        } else if (action === "upgrade") {
          if (category === "restream") {
            const supPack = this.superiorPackage;
            suffix += (supPack && `package=${supPack._id}&`) || "";
          } else {
            suffix += "action=upgrade&";
          }
        } else if (action) {
          suffix += `action=${action}&`;
        }

        if (category) {
          suffix += `category=${category}`;
        }

        return "/subscribe" + suffix;
      }
    };
  },
  methods: {
    isSubEnabled(sub) {
      sub = sub || this.userSubscription.subscription;
      return sub.enabled;
    },
    getSubscriptionName(sub) {
      sub = sub || this.userSubscription.subscription;
      return sub.package.name;
    },
    getSubscriptionAge(sub) {
      sub = sub || this.userSubscription.subscription;
      return sub.cend;
    },
    isPaidSubscription() {
      return this.getSubscriptionFee() > 0;
    },
    getSubscriptionFee(sub) {
      sub = sub || this.userSubscription.subscription;
      return sub.package.baseCharge;
    },
    hasAddonSubscripitons() {
      return _.size(this.userSubscription.addonSubscriptions) > 0;
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
.row-container {
  padding: 15px 5px;
  border-bottom: 1px solid #26284f;
}
.para-title {
  font-size: 15.5px;
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
  margin: 7px 0 14px 0;
  padding: 10px 14px;
  color: #ffffff;
  background-color: #010329;
  border: none;
  border-radius: 2px;
}
.input:focus {
  background-color: rgba(1, 3, 41, 0.47);
}
.button {
  font-size: 12px;
  padding-right: 12px;
  padding-left: 12px;
}
.subscription-badge {
  border-radius: 2px;
  padding: 4px 7px;
  font-size: 13px;
  letter-spacing: -0.5px;
  background: #dc3545;
  color: #ffffff;
  display: inline-block;
  text-transform: uppercase;
}
.subscription-badge.sm {
  font-size: 12px;
  padding: 2px 6px;
}

.package-category-badge {
  background: #282c83;
  margin-right: 5px;
  letter-spacing: 0;
  text-transform: lowercase;
}
.expired {
  padding: 10px;
  background-color: rgba(220, 220, 220, 0.09);
}
</style>

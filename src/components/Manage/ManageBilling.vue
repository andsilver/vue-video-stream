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
      <div class="para-title">Subscriptions</div>
      <br>
      <div v-if="!userSubscription">
        <div class="page-placeholder" style="height: 200px">
          <div class="page-placeholder-content">Please wait ..
            <br>
            <b-progress :value="100" :max="100" animated class="w-100 mt-2" style="height: 7px;"></b-progress>
          </div>
        </div>
      </div>
      <div v-else class="user-sub-list">
        <!-- <div class="user-sub-item head">
          <b-row>
            <b-col cols="4"><span>subscription</span></b-col>
            <b-col cols="2">streaming type</b-col>
            <b-col cols="4">subscription age</b-col>
            <b-col></b-col>
          </b-row>
        </div>-->
        <div class="user-sub-item" :class="{ disabled: !isSubEnabled() }">
          <b-row>
            <b-col cols="6">
              <div>
                <!-- <div class="subscription-badge">{{getSubscriptionName()}}</div> -->
                <div class="pack-name">
                  {{getSubscriptionName()}}
                  &nbsp;
                  <span v-if="isSubEnabled()" class="expired-badge inverse">active</span>  
                  <span v-else class="expired-badge">expired</span>
                </div>
                <div>
                  <code style="font-size:13px;">
                    USD ${{getSubscriptionFee()}}/{{ isAnnualPackage() ? 'year' : 'month' }}
                  </code>
                </div>
                <div class="subscription-badge package-category-badge">restream</div>
              </div>
            </b-col>
            <!-- <b-col cols="2">
              <div class="subscription-badge package-category-badge">restream</div>
            </b-col>-->
            <b-col cols="4">
              <div v-if="isPaidSubscription()">
                Valid untill
                <code
                  style="font-size:inherit;margin: 10px;"
                >{{ getSubscriptionAge() | date('DD MMM, YYYY') }}</code>
                <!-- <span v-if="!isSubEnabled()" class="expired-badge">expired</span> -->
              </div>
            </b-col>
            <b-col class="text-right">
              <div v-if="isBundledSub()">
                <span class="expired-badge inverse">Bundled</span>
              </div>
              <div v-else>
                <router-link :to="subscriptionManagePage(null, 'restream')">
                  <b-button :variant="isSubEnabled() ? 'link' : 'danger'" size="sm">
                    <span v-if="isSubEnabled()">{{isPaidSubscription() ? 'CHANGE' : 'UPGRADE'}}</span>
                    <span v-else>PAY NOW</span>
                  </b-button>
                </router-link>

                <b-button
                  v-if="isSubEnabled()"
                  variant="link"
                  size="sm"
                  onclick="Intercom('show')"
                >CANCEL</b-button>&nbsp;
              </div>
            </b-col>
          </b-row>
        </div>
        <div v-if="hasAddonSubscripitons()">
          <div
            v-for="(sub, index) in userSubscription.addonSubscriptions"
            :key="index"
            class="user-sub-item"
            :class="{ disabled: !isSubEnabled(sub) }">
            <b-row>
              <b-col cols="6">
                <div>
                  <!-- <div class="subscription-badge">{{getSubscriptionName()}}</div> -->
                  <div class="pack-name">
                    {{getSubscriptionName(sub)}}
                    &nbsp;
                    <span v-if="isSubEnabled(sub)" class="expired-badge inverse">active</span>  
                    <span v-else class="expired-badge">expired</span>
                  </div>
                  <div v-if="getSubscriptionFee(sub) > 0">
                    <code style="font-size:13px;">
                      USD ${{getSubscriptionFee(sub)}} /{{ isAnnualPackage(sub) ? 'year' : 'month' }}
                    </code>
                  </div>
                  <div class="subscription-badge package-category-badge">{{sub.category}}</div>
                </div>
              </b-col>
              <!-- <b-col cols="2">
                <div class="subscription-badge package-category-badge">{{sub.category}}</div>
              </b-col>-->
              <b-col cols="4">
                <div v-if="isPaidSubscription()">
                  Valid untill
                  <code
                    style="font-size:inherit;margin: 10px;"
                  >{{ getSubscriptionAge(sub) | date('DD MMM, YYYY') }}</code>
                  <!-- <span v-if="!isSubEnabled(sub)" class="expired-badge">expired</span> -->
                </div>
              </b-col>
              <b-col class="text-right">
                <div v-if="isBundledSub(sub)">
                  <span class="expired-badge inverse">Bundled</span>
                </div>
                <div v-else>
                  <router-link :to="subscriptionManagePage(null, sub.category)">
                    <b-button :variant="isSubEnabled(sub) ? 'link' : 'danger'" size="sm">
                      <span
                        v-if="isSubEnabled(sub)"
                      >{{isPaidSubscription(sub) ? 'CHANGE' : 'UPGRADE'}}</span>
                      <span v-else>PAY NOW</span>
                    </b-button>
                  </router-link>

                  <b-button
                    v-if="isSubEnabled(sub)"
                    variant="link"
                    size="sm"
                    onclick="Intercom('show')"
                  >CANCEL</b-button>&nbsp;
                </div>
              </b-col>
            </b-row>
            <br>
            <div class="sub-usage-container">
              <b-row>
                <b-col cols="6">
                  <div>
                    <code>
                      <u>USAGE QUOTA</u>
                    </code>
                  </div>
                  <div class="sub-usage">
                    <div v-for="(usageProp, index) in usageProps" :key="index">
                      <div v-if="hasUsageProp(usageProp, sub)" class="item-usage-row">
                        <b-row>
                          <b-col cols="4">
                            <label class="item-name">{{usageProp.name || usageProp}}&nbsp;&nbsp;</label>
                          </b-col>
                          <b-col>
                            <span class="item-usage">
                              <span v-if="usageProp.nousage">
                                <span class="value">{{getAllowedPropUsage(usageProp, sub)}}</span>
                                <span v-if="usageProp.unit">{{usageProp.unit}}</span> 
                                assigned
                              </span>
                              <span v-else>
                                <span class="value">{{getPropUsage(usageProp, sub)}}</span> used from
                                <span
                                  class="value"
                                >{{getAllowedPropUsage(usageProp, sub)}}</span>
                              </span>
                            </span>
                          </b-col>
                        </b-row>
                        <div v-if="usageProp.explicit" class="item-usage-explicit">

                          <b-row>
                            <b-col offset="4">
                              <div class="explicit-usage-wrapper">
                                
                                <div class="explicit-usage">
                                  <div class="value">
                                    <i v-if="!hasExplicitUsageProp(usageProp, sub)" class="fas fa-spinner fa-spin"></i>
                                    <span v-else>
                                      <code>{{ getExplicitUsageProp(usageProp, sub).value}}</code>
                                      <span style="font-size:0.6em" class="text-uppercase">{{getExplicitUsageProp(usageProp, sub).unit}}</span>
                                    </span>
                                  </div>
                                  <div>Usage</div>
                                </div>

                                <div class="explicit-usage">
                                  <div class="value">
                                    <!-- <code>1.00</code> -->
                                    <code>{{getAllowedPropUsage(usageProp, sub)}}</code>
                                    <span style="font-size:0.6em">TB</span>
                                  </div>
                                  <div>Assigned</div>
                                </div>
                                
                              </div>
                            </b-col>
                          </b-row>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </b-col>
              </b-row>
            </div>
          </div>
        </div>
      </div>
    </div>
    <br>
    <section class="hidden">
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
          <code class="subscription-badge">{{data.value.name}}</code>
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
    </section>
  </div>
</template>

<script>
import UserService from "../../services/UserService";
import SubscriptionService from "../../services/SubscriptionService";
import MetricsService from "../../services/MetricsService";

export default {
  name: "ManageBilling",
  async mounted() {
    try {
      // get user subscription
      const usersub = await SubscriptionService.getUserSubscriptions(true);
      usersub.addonSubscriptions = _.map(usersub.addonSubscriptions, (addonSub) => {
        return _.assign(addonSub, { usage: {
          // bandwidth: null
        }})
      })

      this.userSubscription = usersub
      
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
      // this.paymentHistory = await SubscriptionService.getUserBillingHistory();
      this.transactionsProcessing = false;

      _.each(this.userSubscription.addonSubscriptions, async (addonSub, index) => {
        
        const bwLimit =  _.get(addonSub, 'package.definition.bandwidth')
        if (bwLimit) {
          // let bytes = '-'
          let bytes = 0
          try {
            // let res = await MetricsService.getUserBandwidth(UserService.getUserId())
            let res = await MetricsService.getSubscriptionBandwidth(UserService.getUserId(), addonSub.package._id)
            bytes = res && res.bytes || 0
          } catch(e) { console.log('e', e) }
  
          addonSub.usage = {
            bandwidth: this.$options.filters.bytes(bytes, true, 3, true) 
          }
        }
      })

      // this.userSubscription.addonSubscriptions = updatedAddonSubList

      // track event
    } catch (e) {
      window.alert("error: " + e.message);
      console.log("error", e);
    }

    window.trackEvent(`Billing Details`);
  },
  data() {
    return {
      usageProps: [
        "streams",
        { name: "bandwidth", key: "bandwidth", nousage: true, unit: 'TB', mapFn: gb => (gb/1000).toFixed(2), explicit: true },
        { name: "storage", key: "storage", nousage: true, unit: 'GB' },
        {
          name: "concurrent viewers",
          key: "maxConcurrentUsers",
          nousage: true,
          unit: 'Conns'
        },
        { name: "dvr", key: "dvrUnits", nousage: true, unit: 'GB' }
      ],
      processing: true,
      transactionsProcessing: true,

      paymentMethod: null,
      basicPackage: null,
      superiorPackage: null,
      userSubscription: null,
      paymentHistory: [],
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
    hasExplicitUsageProp (usageProp, baseSub) {
      let prop = usageProp.key || usageProp;
      return prop in baseSub.usage
    },
    getExplicitUsageProp (usageProp, baseSub) {
      let prop = usageProp.key || usageProp;
      return baseSub.usage[prop]
    },
    isAnnualPackage (sub) {
      sub = sub || this.userSubscription.subscription;
      return /yearly/i.test(sub.package.name)
    },
    hasUsageProp(usageProp, baseSub) {
      let prop = usageProp.key || usageProp;
      return (
        baseSub.package &&
        baseSub.package.definition &&
        baseSub.package.definition[prop]
      );
    },
    getAllowedPropUsage(usageProp, baseSub) {
      let prop = usageProp.key || usageProp;
      let value = _.get(baseSub, "package.definition." + prop);
      return usageProp.mapFn ? usageProp.mapFn(value) : value
    },
    getPropUsage(usageProp, baseSub) {
      let prop = usageProp.key || usageProp;
      return 1;
    },
    isBundledSub(sub) {
      sub = sub || this.userSubscription.subscription;
      return sub.parentPackage;
    },
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
    isPaidSubscription(sub) {
      return this.getSubscriptionFee(sub) > 0;
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
  /* background: #dc3545; */
  color: #ffffff;
  display: inline-block;
  text-transform: uppercase;
}
.subscription-badge.sm {
  font-size: 12px;
  padding: 2px 6px;
}

.expired-badge {
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 13px;
  /* letter-spacing: -0.5px; */
  /* background-color: #dc3545; */
  /* color: #ffffff; */
  border: 1px solid red;
  color: red;
  display: inline-block;
}

.expired-badge.inverse {
  border: 1px solid #ffb204;
  color: #ffb204;
}

.package-category-badge {
  /* background: #282c83; */
  /* background: #2159d1; */
  /* background: #dc3545; */
  /* margin-right: 5px; */
  border:1px solid #9698c7;
  border-radius: 2px;
  color: #e2e3f1;
  letter-spacing: 0;
  text-transform: uppercase;
  font-size: 12px;
  margin-top: 7px;
  line-height: 18px;
}
.user-sub-list {
}
.user-sub-item.head {
  font-size: 13px;
  color: #eeeeee;
  background-color: #192035;
}
.user-sub-item {
  padding: 15px 20px;
  /* border-bottom:1px dashed rgba(255,255,255,0.4); */
  /* border-bottom: 1px solid #37395f; */
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  background-color: #29344e;
  margin-bottom: 20px;
  border-radius: 2px;
}
.pack-name {
      font-size: 17.5px;
    text-transform: capitalize;
    margin-bottom: 4px;
}
.user-sub-item.disabled {
  background-color: rgba(220, 220, 220, 0.09);
}
.sub-usage-container {
    padding: 15px 20px;
    margin-top: 10px;
    margin-left: -20px;
    margin-right: -20px;
    background: rgba(32, 41, 64, 0.4);
    /* margin-bottom: -14px; */
    border-top: 1px solid #19203570;
}
.sub-usage {
  margin-top: 5px;
}
.item-usage-row {
  padding-top: 5px;
  font-size: 12.5px;
}
.item-usage-row .item-name {
  text-transform: capitalize;
  /* opacity: 0.8; */
  font-size: 13px;
}
.item-usage-row .item-usage {
  font-size: 1em;
  padding-left: 5px;
}
.item-usage-row .item-usage .value {
  display: inline-block;
  /* background: aliceblue; */
  /* padding: 0px 7px; */
  margin: 0 2px;
  font-size: 15px;
  font-weight: 700;
}
.explicit-usage-wrapper {
  margin-left:7px;
}
.explicit-usage {
  background: #202940;
  margin: 10px 0;
  margin-right: 10px;
  padding: 15px;
  border-radius: 3px;
  display: inline-block;
  text-align: center;
  font-size:11px;
}
.explicit-usage .value {
  font-size: 22px;
  /* font-weight: 600; */
}
.explicit-usage .value code {
  /* color: #006ee8; */
  letter-spacing: -0.5px;
}
</style>


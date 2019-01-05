<template>
  <div class="view-wrapper container text-center" :style="{ 'min-height': minWindowHeight || 'auto' }">
    <div class="form">
      <div class="text-center">
        
        <h3 class="title">
          Package Subscription
        </h3>
        <p style="font-size:13px;">* All charges are inclusive of any mentioned or hidden tax</p>
      </div>
      <br>

     <div v-if="processing"
          style="display:flex;justify-content:center;align-items:center;">
          <b-progress :value="100"
                    :max="100" 
                    animated
                    class="w-50 mt-2"
                    style="height: 10px;"></b-progress>
     </div>
     <div v-else >
       <div class="receipt-wrapper">
         <div class="reciept-row">
           <b-row class="reciept-row">
             <b-col class="key">package type</b-col>
             <b-col class="value">

               <b-dropdown class="package-dropdown w-100" 
                           :disabled="checkoutStep==3">
                <template slot="button-content">
                  <div v-if="!packCategory" style="display:inline-block;">Select</div>
                  <div v-else 
                       class="package-dropdown-item package-dropdown-item-placeholder text-uppercase" 
                       style="display: inline-block;margin-right: 10px;">
                    <span class="package-name">{{packCategory.label}}</span>
                  </div>
                </template>
                <b-dropdown-item v-for="(packCat, index) in packCategories"
                                 :key="index"
                                 @click="selectSubscriptionPackageCategory(packCat)">
                  <div class="a package-dropdown-item" 
                       :class="{ selected: packCategory && packCategory.value === packCat.value }">
                    <span class="package-name">{{packCat.label}}</span>
                  </div>
                </b-dropdown-item>
              </b-dropdown>

             </b-col>
           </b-row>
         </div>
         <div class="reciept-row">
           <b-row class="reciept-row">
             <b-col class="key">subscription</b-col>
             <b-col class="value">

               <b-dropdown class="package-dropdown w-100" 
                           :disabled="!packCategory || checkoutStep==3">
                <template slot="button-content">
                  <div v-if="!subscriptionPackage" style="display:inline-block;">Select</div>
                  <div v-else 
                       class="package-dropdown-item package-dropdown-item-placeholder text-uppercase" 
                       style="display: inline-block;margin-right: 10px;">
                    <span class="package-name">{{subscriptionPackage.name}}</span>
                  </div>
                </template>
                <b-dropdown-item v-for="(pack, index) in packages || []"
                                 :key="index"
                                 @click="selectSubscriptionPackage(pack)">
                                 <!-- :disabled="isCurrentSubscription(pack)"> -->
                  <div class="a package-dropdown-item" 
                       :class="{ selected: subscriptionPackage === pack }">
                    <span class="package-name">{{pack.name}}</span>
                    <span v-if="pack.baseCharge > 0" class="package-price">${{pack.baseCharge}} <small style="text-transform:none;">/mon</small> </span>
                    <code v-else class="package-price">free</code>
                    &nbsp;
                    <code v-if="isCurrentSubscription(pack)" 
                          class="text-muted text-lowercase">(current)</code>
                  </div>
                </b-dropdown-item>
              </b-dropdown>

             </b-col>
           </b-row>
         </div>
         <!-- <div class="reciept-row">
           <b-row class="reciept-row">
             <b-col class="key">subscription</b-col>
             <b-col class="value">
               <span>{{subscriptionPackage.name}}</span>
               &nbsp; 
               <a href="/#pricing" 
                  target="_blank" 
                  style="font-size:12px;text-transform:none;">Details</a>
             </b-col>
           </b-row>
         </div> -->
         <!-- <div v-if="hasFee()" class="reciept-row">
           <b-row class="reciept-row">
             <b-col class="key">subscription packs</b-col>
             <b-col class="value">
               <b-select v-model="quantity" 
                         size="sm" 
                         :disabled="checkoutStep!=0"
                         style="width:35%;">
                 <option v-for="count in [1,2,4,5,6,7,8,9,10,11,12]" :key="count">{{count}}</option>
               </b-select>
             </b-col>
           </b-row>
         </div> -->
         <div v-if="hasFee()" class="reciept-row">
           <b-row class="reciept-row">
             <b-col class="key">Valid till</b-col>
             <b-col class="value">{{getEndingDate() | date('DD-MM-YYYY')}}</b-col>
           </b-row>
         </div>
         <div class="reciept-row">
           <b-row class="reciept-row">
             <b-col class="key">base charge</b-col>
             <b-col class="value currency sm">
               <div v-if="subscriptionPackage">
                 <span>${{getSubscriptionFee()}}</span>
                 <!-- <code v-if="hasFee()" style="font-size:13px;">x{{quantity}}</code> -->
               </div>
               <div v-else>--</div>
             </b-col>
           </b-row>
         </div>
         <!-- <div class="reciept-row">
           <b-row class="reciept-row">
             <b-col class="key">discount</b-col>
             <b-col class="value currency sm">$0.00</b-col>
           </b-row>
         </div> -->
         <div class="reciept-row">
           <b-row class="reciept-row">
             <b-col class="key">payable amount</b-col>
             <b-col class="value currency">
               <div v-if="subscriptionPackage">${{getTotalFee()}}</div>
               <div v-else>--</div>
             </b-col>
           </b-row>
         </div>
       </div>
       <div class="text-center" style="background: #202940;padding: 20px;">
         <div v-if="checkoutStep==0 && subscriptionPackage">
           <b-button size="lg"
                     variant="success"
                     @click="requestCheckout">
                     <!-- :disabled="isCurrentSubscription()"> -->
              &nbsp; 
              <i v-if="hasFee()" class="far fa-check-circle"></i>
              <span>{{ hasFee() ? 'Pay Now' : 'Change Package' }}</span>
              &nbsp;
           </b-button>
           <div v-if="hasFee() && packCategory.value === 'restream'" 
                style="margin: 10px;">
                or use <a :href="gerPermalink()">Paypal</a>
           </div>
           <br>
           <br>
         </div>
         <div v-else-if="checkoutStep==1" class="text-info message">Request is being validated</div>
         <div v-else-if="checkoutStep==2" class="text-info message">{{ hasFee() ? 'Validating payment' : 'Changing subscription' }}</div>
         <div v-else-if="checkoutStep==3">
           <div class="alert alert-success ">
             <div class="message"><strong>Successfully Subscribed</strong></div>
             <p>Great, we have enabled your selected package to your account.</p>
           </div>
           <br>
           <p>Back to <router-link to="/dashboard">Dashboard</router-link></p>
         </div>
        
        <div v-if="checkoutStep==1 || checkoutStep==2"
             style="display:flex;justify-content:center;align-items:center;margin-top:5px;">
                <b-progress :value="100"
                            :max="100" 
                            animated
                            class="w-50 mt-2"
                            style="height: 10px;"></b-progress>
       </div>

       <div v-if="checkoutStep!==3" style="margin-top:15px;">
         Not willing to change? Go to <router-link to="/manage/billing">accounts</router-link>
       </div>

      </div>
     </div>

      <!-- error placeholder -->
      <b-alert v-if="error"
               show
               variant="danger"
               class="left inline"
               style="margin:15px 0;max-width:500px;">{{error.message}}</b-alert>

    </div>
  </div>
</template>

<script>
import UserService from "../services/UserService";
import SubscriptionService from "../services/SubscriptionService";

export default {
  name: "Payments",
  async mounted() {
    this.minWindowHeight = window.innerHeight + "px";
    
    try {
      // fetch available subscriptions packages
      let packages = await SubscriptionService.getSubscriptionPackages()
      // this.packages = _.filter(packages, p => p.baseCharge > 0)
      // this.packages = packages
      packages = _.sortBy(packages, p => p.name[0])

      this.subscriptionPackages = packages

      // set selected subscription
      const packageId = this.$route.query && this.$route.query.package
      if (packageId) {
        this.subscriptionPackage = _.find(packages, { _id: packageId })
      }

      // read url query params
      this.processURLSearchParams()

      // fetch user subscriptions
      const userSubscription = await SubscriptionService.getUserSubscriptions(true)
      this.userSubscription = userSubscription
      
      this.updateUserBaseSubscription()
      let baseSub = this.userBaseSubscription
      // let baseSub = userSubscription.subscription
      // const packCategoryType = this.packCategory.value
      // if (packCategoryType !== 'restream') {
      //   baseSub = _.find(userSubscription.addonSubscriptions, { category: packCategoryType })
      //   baseSub = baseSub || { package: { baseCharge: 0 } }
      // }

      // this.userBaseSubscription = baseSub

      const action = this.$route.query && this.$route.query.action
      const baseCharge = parseFloat(this.$route.query.bycharge)

      if (action === 'upgrade') {
        // const userPackage = userSubscription.subscription.package
        const userPackage = baseSub.package
        const superiorPackage = _.find(this.packages, p => p.baseCharge > userPackage.baseCharge)
        if (superiorPackage) {
          this.subscriptionPackage = superiorPackage
        }
      } else if (action === 'resubscribe') {
        // const userPackage = userSubscription.subscription.package
        const userPackage = baseSub.package
        const curPack = _.find(this.packages, p => p.baseCharge === userPackage.baseCharge)
        this.subscriptionPackage = curPack
      } else if (baseCharge) {
        const subPack = _.find(this.packages, p => p.baseCharge === baseCharge)
        if (subPack) {
          this.subscriptionPackage = subPack
        }
      }

      this.processing = false

    } catch (e) {
      this.error = e
    }

    window.trackEvent(`Payments Page`)
  },
  data() {
    return {
      error: null,
      minWindowHeight: null,
      checkoutStep: 0,
      processing: true,
      cardValidated: false,
      packages: [],
      userSubscription: null,
      userBaseSubscription: null,
      packCategory: null,
      subscriptionPackage: null,
      subscriptionPackages: [],
      packCategories: [
        { label: 'restreaming', value: 'restream' },
        { label: 'live streaming', value: 'live' },
        { label: 'ip camera', value: 'ipcam' },
      ],
      quantity: 1,
      getEndingDate() {
        const today = new Date();
        today.setMonth(today.getMonth() + this.quantity);
        return today;
      },
      getSubscriptionFee() {
        return this.subscriptionPackage.baseCharge;
      },
      getTotalFee() {
        let fee = this.quantity * this.subscriptionPackage.baseCharge;
        fee = fee.toFixed(2);
        return fee;
      },
      hasFee() {
        return this.subscriptionPackage && this.getTotalFee() > 0
      },
      onInputChange(prop) {
        this.formErrors[prop] = false;
      }
    };
  },
  methods: {
    processURLSearchParams () {
      const searchParams = _.reduce((window.location.search||'').split('&'), (o, e) => {
        let pars = _.split(e, '=')
        return _.assign({}, o, { [_.replace(pars[0], /^\?/, '')]: pars[1] } )
      } , {})

      const predefinedCat = searchParams.category || 'restream'
      if (predefinedCat) {
        const packCat = _.find(this.packCategories, { value: predefinedCat })
        if (packCat) {
          this.selectSubscriptionPackageCategory(packCat)
        }
      }
    },
    gerPermalink () {
      const route = window.location
      const host = `${route.protocol}//${route.hostname}`
      return `${host}/billing/pay?userId=${UserService.getUserId()}&packageId=${this.subscriptionPackage._id}`
    },
    isCurrentSubscription (pack) {
      pack = pack || this.subscriptionPackage
      // return pack && this.userBaseSubscription.package._id
      let userSubNode = this.userBaseSubscription
      if (!userSubNode || !pack) return

      return userSubNode.enabled && userSubNode.package._id === pack._id
      // return pack && _.get(this, 'userSubscription.subscription.package') === pack._id
    },
    selectSubscriptionPackage (pack) {
      this.subscriptionPackage = pack
    },
    selectSubscriptionPackageCategory (packCat) {
      const oldPackCat = this.packCategory
      this.packCategory = packCat
      this.filterSubscriptionPacks()

      if (oldPackCat && oldPackCat !== packCat)
        this.selectSubscriptionPackage(null)

      this.updateUserBaseSubscription()
    },
    updateUserBaseSubscription () {
      const packCategoryType = this.packCategory.value
      const userSub = this.userSubscription
      if (!userSub) return

      let baseSub = userSub.subscription
      if (packCategoryType !== 'restream') {
        baseSub = _.find(userSub.addonSubscriptions, { category: packCategoryType })
        baseSub = baseSub || { package: { baseCharge: 0 } }
      }

      this.userBaseSubscription = baseSub
    },
    filterSubscriptionPacks () {
      const packCat = this.packCategory
      const catPackages = _.filter(this.subscriptionPackages, { category: packCat.value })
      this.packages = catPackages
    },
    requestCheckout() {
      this.checkoutStep = 1;

      if (!this.hasFee()) {
        this.validatePayment();
        return
      }

      // this.$checkout.close()
      // is also available.
      // let checkoutLabel = `${_.toUpper(this.subscriptionPackage.name)} x${
      //   this.quantity
      // }`;
      const checkoutLabel = `${_.toUpper(this.subscriptionPackage.name)}`;

      const amount = this.getTotalFee() * 100;

      this.$checkout.open(
        {
          amount,
          name: checkoutLabel,
          currency: "USD",
          token: token => {
            this.cardValidated = true;
            const tok = token.id;
            this.validatePayment(tok);
          }
        },
        () => {
          if (this.cardValidated) return;
          this.checkoutStep = 0;
        }
      );
    },
    async validatePayment(token='__token__') {
      this.error = null
      this.checkoutStep = 2;
      this.error = null
      try {
        const packageId = this.subscriptionPackage._id
        const quantity = this.quantity
        // return console.log(packageId, quantity, token)

        await SubscriptionService.orderSubscription(packageId, quantity, token)
        this.checkoutStep = 3

        // event tracking
        const charge = this.getTotalFee()
        window.trackEvent(`User piad $${charge} for package ${this.subscriptionPackage._id}`)
        window.trackEvent(`Subscription Package changed to ${this.subscriptionPackage._id}`)
        // track user charge
        mixpanel.people.track_charge(charge);

      } catch (e) {
        this.error = e
        this.checkoutStep = 0
      }
    }
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.view-wrapper {
  color: #ffffff;
  /* padding-top: 25px; */
}
.title {
  font-size: 32px;
  color: #f7f7f7;
  font-weight: 600;
  letter-spacing: -1px;
  text-align: center;
}
.receipt-wrapper {
  width: 500px;
  background-color: #202940;
  text-align: left;
  border-radius: 5px;
  /* margin-bottom: 30px; */
}
.receipt-wrapper .reciept-row {
  padding: 8px 16px;
  border-bottom: 1px solid rgba(25, 32, 53, 0.63);
}
.receipt-wrapper .reciept-row:last-of-type {
  border-bottom-color: transparent;
}
.receipt-wrapper .key {
  text-transform: capitalize;
  opacity: 0.65;
}
.receipt-wrapper .value {
  text-transform: uppercase;
}
.receipt-wrapper .value.currency {
  font-size: 24px;
  font-family: monaco;
}
.receipt-wrapper .value.currency.sm {
  font-size: 16px;
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
.message {
  font-size: 15px;
}
</style>

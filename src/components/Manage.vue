<template>
  <div>
    <div class="container menu-wrapper">
      <ul class="menu-list">
        <li v-for="(menuItem, index) in menu"
            v-bind:key="index"          
            class="menu-item"
            style="padding-left:0;">
          <router-link v-bind:to="menuItem.href">{{menuItem.name}}</router-link>
        </li>
      </ul>
    </div>
    <div class="content-wrapper">
      <div class="container">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AppManage",
  data() {
    return {
      menu: [
        { name: "account", href: "/manage/account" },
        { name: "change password", href: "/manage/change-password" },
        { name: "billing", href: "/manage/billing" }
      ],
      account: {}
    };
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.menu-wrapper {
  padding-top: 30px;
}
.menu-list {
  margin: 0;
  padding: 0;
}
.menu-item {
  display: inline-block;
  color: #9ba0be;
  margin-right: 25px;
  text-transform: capitalize;
}
.menu-item a {
  color: inherit;
  padding: 12px 0;
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.menu-item a:hover,
.menu-item a.router-link-active {
  display: block;
  color: #f7f7f7;
  border-bottom-color: #3d9bff;
  font-weight: 500;
  cursor: pointer;
}
.content-wrapper {
  background-color: #202940;
  padding: 60px 0;
  min-height: 600px;
}
.title {
  padding: 5px 7px;
  font-size: 20px;
  color: #f7f7f7;
}
</style>

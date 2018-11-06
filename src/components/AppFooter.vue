<template>
  <div class="footer">
    <div class="container">
      <b-row>
        <b-col cols="3">
          <a href="/app/dashboard"><img class="logo-icon" src="../assets/castr.png" alt="castr"></a>
          <!-- <h3 class="logo-text"><a href="/">Castr</a></h3> -->
        </b-col>
        <b-col>
          <div class="nav-links">
            <!-- <div class="nav-link"><a href="/">company</a></div>
            <div class="nav-link"><a href="/#pricing">pricing</a></div>
            <div class="nav-link"><a href="/#faq">FAQ</a></div> -->
            <div class="nav-link"><router-link to="/">Dashboard</router-link></div>
            <div class="nav-link"><router-link to="/manage/account">Account</router-link></div>
            <div class="nav-link"><router-link to="/manage/billing">Billing</router-link></div>
          </div>
        </b-col>
        <b-col cols="3">
          <div class="nav-links nav-links-socials">
            <div class="nav-link"><a href="https://facebook.com/castrlive" target="_blank"><i class="fab fa-facebook"></i></a></div>
            <div class="nav-link"><a href="https://twitter.com/castrHQ" target="_blank"><i class="fab fa-twitter"></i></a></div>
            <!-- <div class="nav-link"><a href="#" target="_blank"><i class="fab fa-google"></i></a></div> -->
            <div class="nav-link"><a href="https://www.linkedin.com/company/castrlive" target="_blank"><i class="fab fa-linkedin"></i></a></div>
          </div>
        </b-col>
      </b-row>
      <!-- <hr/> -->
      <div class="text-center text-muted" 
           style="margin: 5px 0;">© 2018 Castr. All rights reserved</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "AppFooter",
  data() {
    return {}
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.footer {
  position: absolute;
  /* height: 100px; */
  bottom: 0;
  width: 100%;
  padding: 20px 15px;
  color: #f7f7f7;
  box-sizing: border-box;
  display: block;
}
.logo-icon {
  width: 112px;
  height: auto;
  display: inline-block;
  vertical-align: top;
}
.logo-text {
  font-size: 18px;
  margin: 0;
  padding: 0;
  font-weight: 400;
  margin-left: 5px;
  display: inline-block;
}
.logo-text a {
  color: inherit;
}
.logo-text a:hover {
  text-decoration: none;
}
.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-links-socials {
  justify-content: flex-end;
  align-items: flex-end;
}
.nav-link {
  font-size: 12px;
  text-transform: capitalize;
}
.nav-links-socials .nav-link {
  font-size: 16px;
}
.nav-link, 
.nav-link * {
  color: #bacaff
}
</style>

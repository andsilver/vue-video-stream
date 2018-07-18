<template>
  <div>
    <b-dropdown :text="placeholder">
        
        <b-dropdown-item>
          <div class="a">Action</div>
        </b-dropdown-item>
        <b-dropdown-item href="#">Another action</b-dropdown-item>
        <b-dropdown-item href="#">Something else here</b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "DropdownSelect",
  props: ["items", "selected", "itemTemplate", "placeholder"],
  mounted () {
    this.placeholder = this.placeholder || this.defaultPlaceholder
    
  },
  data() {
    return {
      defaultPlaceholder: "Please Select"
    }
  },
  methods: {
    selectItem(item) {
      this.selected = item
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

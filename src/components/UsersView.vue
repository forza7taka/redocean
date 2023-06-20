<template>
  <div>
    <v-list v-if="props.users">
      <v-list-item v-for="(f, fIndex) in   props.users  " :key="fIndex">
        <UserView :user="f"/>
        <v-divider/>
      </v-list-item>
    </v-list>
  </div>
</template>


<script setup>
import { defineProps } from 'vue'
import UserView from "./UserView"

const props = defineProps({
  users: Array
})

</script>
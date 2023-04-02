<template>
    <div>
      <form>
        <div>
          <input type="email" id="email" v-model="email">
        </div>
        <div>
          <input type="password" id="password" v-model="password">
        </div>
        <button type="submit" @click.prevent="login">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: '',
      }
    },
    methods: {
      login() {
        // ログイン処理を実装する
        // 成功した場合は、ダッシュボード画面にリダイレクトする
        this.$router.push('/dashboard');
      }
    }
  }
  </script>
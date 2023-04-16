<template>
  <FeedView :timeline="timeline"></FeedView>
  <infinite-loading @infinite="infiniteHandler" :firstload="false">
      <template #spinner>
        <span>loading...</span>
      </template>
      <template #complete>
        <span>No more data found!</span>
      </template>
  </infinite-loading>
</template>

<script >
// import { onBackupState } from 'vue-history-state'
// import { ref, reactive, onMounted } from 'vue'
import FeedView from "./FeedView.vue"
import InfiniteLoading from 'v3-infinite-loading'
export default {
  components: {
    FeedView,
    InfiniteLoading
  },
  setup() {
    // // refを使用してリアクティブな変数を定義する
    // const historyState = ref(null)
    // const data = reactive({ key: "value" })

    // // コンポーネントがマウントされたときにデータのフェッチや復元を行う
    // onMounted(async () => {
    //   // historyStateにデータをバックアップ
    //   historyState.value = this.timeline
    // })

    // // historyStateの値が変更された場合にデータをバックアップする
    // onBackupState(() => data)

    // // コンポジションAPIのリターン値としてdataオブジェクトを返す
    // return { data }
  },
  name: 'App',
  data() {
    return {
      complated: false,
      timeline: { feed: [] },
      cursor: null,
    };
  },
  beforeMount() {
    this.getTimeline(this.cursor)
  },
  methods: {
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        await this.getTimeline(this.cursor)
        $state.loaded()
      }
    },
    async getTimeline(cursor) {
      let params = {}
      if (!cursor) {
        params = {}
      } else {
        params = { cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.feed.getTimeline", { params })
        console.log(response)
        this.timeline.feed = this.timeline.feed.concat(response.data.feed)
        this.cursor = response.data.cursor
        if (response.data.feed.length == 0) {
          this.complated = true
        }
      } catch (e) {
        this.$toast.show(e, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    }
  }
};
</script>
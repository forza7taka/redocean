import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  state: {
    handle: '',
    did: '',
    accessJwt: '',
    refreshJwt: '',
    follows: [],
    likes: new Map()
  },
  getters: {
    getHandle(state) {
      return state.handle;
    },
    getDid(state) {
      return state.did;
    },
    getAccessJwt(state) {
      return state.accessJwt;
    },
    getRefreshJwt(state) {
      return state.refreshJwt;
    },
    getFollows(state) {
      return state.follows;
    },
    getLikes(state) {
      return state.likes;
    },
    hasLike: (state) => (key) => {
      if (!(state.likes instanceof Map)) {
        return false;
      }
      if (state.likes.size == 0) {
        return false;
      }
      return state.likes.has(key);
    }
  },
  mutations: {
    createSession(state, session) {
      state.did = session.did
      state.handle = session.handle
      state.accessJwt = session.accessJwt
      state.refreshJwt = session.refreshJwt
    },
    addFollows(state, session) {
      session.follows.forEach(element => {
        state.follows.push(element.did)
      });
    },
    removeFollow(state, index) {
      state.follows.splice(index, 1);
    },
    addLikes(state, session) {
      session.records.forEach(element => {
        state.likes.set(element.value.subject.uri, element.uri)
      });
    },
    addLike(state, {key, value}) {
      console.log("addLike: "+ key + " " + value)
      return state.likes.set(key, value);
    },

    removeLike(state, key) {
      console.log("removeLike: "+ key)
      state.likes.delete(key);
    },

    setHandle(state, session) {
      state.handle = session.handle;
    }

  },
  actions: {
    doCreateSession({
      commit
    }, session) {
      commit('createSession', 
        session
      )
    },
    doAddFollows({
      commit
    }, session) {
      commit('addFollows', 
        session
      )
    },
    removeFollow({ commit, state }, did) {
      const index = state.follows.indexOf(did);
      if (index > -1) {
        commit('removeFollow', index);
      }
    },
    doSetHandle({
      commit
    }, session) {
      commit('setHandle', 
        session
      )
    },
    doAddLikes({
      commit
    }, session) {
      commit('addLikes', 
        session
      )
    },
    doAddLike({ commit }, { key, value }) {
      commit('addLike', { key, value }
      )
    },
    doRemoveLike({ commit }, key) {
      commit('removeLike',
        key
      )
    }
  },
  modules: {
  },
  plugins: [createPersistedState({storage: window.sessionStorage})]
})

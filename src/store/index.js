import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  state: {
    handle: '',
    did: '',
    accessJwt: '',
    refreshJwt: '',
    follows: []
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
    }
  },
  mutations: {
    createSession (state, session) {
      state.did = session.did
      state.handle = session.handle
      state.accessJwt = session.accessJwt
      state.refreshJwt = session.refreshJwt
    },
    addFollows (state, session) {
      session.follows.forEach(element => {
        state.follows.push(element.did)
      });
    },
    removeFollow(state, index) {
      state.follows.splice(index, 1);
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
    }
  },
  modules: {
  },
  plugins: [createPersistedState({storage: window.sessionStorage})]
})

import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  state: {
    handle: '',
    did: '',
    accessJwt: '',
    refreshJwt: '',
    server: '',
    follows: [],
    blocks: [],
    likes: new Map(),
    reposts: new Map(),
    mutes: [],
    color: null,
    profile: null,
    translationApiKey: null,
    translationLang: null
  },
  getters: {
    getServer(state) {
      return state.server;
    },
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
    getColor(state) {
      return state.color;
    },
    getProfile(state) {
      return state.profile;
    },
    getTranslationLang(state) {
      return state.translationLang;
    },
    getTranslationApiKey(state) {
      return state.translationApiKey;
    },
    getFollows(state) {
      return state.follows;
    },
    getBlocks(state) {
      return state.blocks;
    },
    getLikes(state) {
      return state.likes;
    },
    getReposts(state) {
      return state.reposts;
    },

    hasLike: (state) => (key) => {
      if (!(state.likes instanceof Map)) {
        return false;
      }
      if (state.likes.size == 0) {
        return false;
      }
      return state.likes.has(key);
    },
    hasRepost: (state) => (key) => {
      if (!(state.reposts instanceof Map)) {
        return false;
      }
      if (state.reposts.size == 0) {
        return false;
      }
      return state.reposts.has(key);
    },

    getMutes(state) {
      return state.mutes;
    },
  },
  mutations: {
    createSession(state, session) {
      state.did = session.did
      state.handle = session.handle
      state.accessJwt = session.accessJwt
      state.refreshJwt = session.refreshJwt
    },
    setColor(state, session) {
      state.color = session
    },
    setProfile(state, session) {
      state.profile = session
    },
    setTranslationLang(state, session) {
      state.translationLang = session
    },
    setTranslationApiKey(state, session) {
      state.translationApiKey = session
    },
    addFollows(state, session) {
      session.follows.forEach(element => {
        state.follows.push(element.did)
      });
    },
    removeFollow(state, index) {
      state.follows.splice(index, 1);
    },
    addBlocks(state, session) {
      session.blocks.forEach(element => {
        state.blocks.push(element.did)
      });
    },
    removeBlock(state, index) {
      state.blocks.splice(index, 1);
    },

    setHandle(state, session) {
      state.handle = session.handle;
    },

    setServer(state, session) {
      state.server = session;
    },

    addLikes(state, session) {
      if (!(state.likes instanceof Map)) {
        state.likes = new Map(Object.entries(state.likes))
      }
      session.records.forEach(element => {
        state.likes.set(element.value.subject.uri, element.uri)
      });
    },
    addLike(state, { key, value }) {
      if (!(state.likes instanceof Map)) {
        state.likes = new Map(Object.entries(state.likes))
      }
      return state.likes.set(key, value);
    },

    removeLike(state, key) {
      state.likes.delete(key);
    },

    removeAllLikes(state) {
      state.likes = new Map();
    },

    addReposts(state, session) {
      if (!(state.reposts instanceof Map)) {
        state.reposts = new Map(Object.entries(state.reposts))
      }
      session.records.forEach(element => {
        state.reposts.set(element.value.subject.uri, element.uri)
      });
    },
    addRepost(state, { key, value }) {
      if (!(state.reposts instanceof Map)) {
        state.reposts = new Map(Object.entries(state.reposts))
      }
      return state.reposts.set(key, value);
    },

    removeRepost(state, key) {
      state.reposts.delete(key);
    },

    removeAllReposts(state) {
      state.reposts = new Map();
    },

    addMutes(state, session) {
      session.mutes.forEach(element => {
        state.mutes.push(element.did)
      });
    },
    removeMute(state, index) {
      state.mutes.splice(index, 1);
    },
  },
  actions: {
    doCreateSession({ commit }, session) {
      commit('createSession', session)
    },
    doSetColor({ commit }, session) {
      console.log(session)
      commit('setColor', session)
    },
    doSetProfile({ commit }, session) {
      commit('setProfile', session)
    },
    doSetTranslationLang({ commit }, session) {
      commit('setTranslationLang', session)
    },
    doSetTranslationApiKey({ commit }, session) {
      commit('setTranslationApiKey', session)
    },
    doAddFollows({ commit }, session) {
      commit('addFollows', session)
    },
    removeFollow({ commit, state }, did) {
      const index = state.follows.indexOf(did);
      if (index > -1) {
        commit('removeFollow', index);
      }
    },
    doAddBlocks({ commit }, session) {
      commit('addBlocks', session)
    },
    removeBlock({ commit, state }, did) {
      const index = state.blocks.indexOf(did);
      if (index > -1) {
        commit('removeBlock', index);
      }
    },
    doSetServer({ commit }, session) {
      commit('setServer', session)
    },
    doSetHandle({ commit }, session) {
      commit('setHandle', session)
    },
    doAddLikes({ commit }, session) {
      commit('addLikes', session)
    },
    doAddLike({ commit }, { key, value }) {
      commit('addLike', { key, value })
    },
    doRemoveLike({ commit }, key) {
      commit('removeLike', key)
    },
    doRemoveAllLikes({ commit }, session) {
      commit('removeAllLikes', session)
    },
    doAddReposts({ commit }, session) {
      commit('addReposts', session)
    },
    doAddRepost({ commit }, { key, value }) {
      commit('addRepost', { key, value })
    },
    doRemoveRepost({ commit }, key) {
      commit('removeRepost', key)
    },
    doRemoveAllReposts({ commit }, session) {
      commit('removeAllReposts', session)
    },

    doAddMutes({ commit }, session) {
      commit('addMutes', session)
    },
    removeMute({ commit, state }, did) {
      const index = state.mutes.indexOf(did);
      if (index > -1) {
        commit('removeMute', index);
      }
    },
  },
  modules: {
  },
  plugins: [createPersistedState({ storage: window.sessionStorage })]
})

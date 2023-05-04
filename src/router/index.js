import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/LoginView.vue';
import TimeLine from '@/components/TimeLineView.vue';
import Search from '@/components/SearchView.vue';
import Profile from '@/components/ProfileView.vue';
import Followers from '@/components/FollowersView.vue';
import Follows from '@/components/FollowsView.vue';
import Popular from '@/components/PopularFeedView.vue';
import Suggestions from '@/components/SuggestionsView.vue';
import PrivacyPolicy from '@/components/PrivacyPolicyView.vue';
import AccountCreate from '@/components/AccountCreateView.vue';
import ProfileEdit from '@/components/ProfileEditView.vue';
import HandleEdit from '@/components/HandleEditView.vue';
import Notification from '@/components/NotificationView.vue'
import Likes from '@/components/LikesView.vue'
import Thread from '@/components/ThreadView.vue'
import Mutes from '@/components/MutesView.vue'
import InviteCodes from '@/components/InviteCodesView.vue'
import Post from '@/components/PostFormView.vue'

import { trackRouter } from "vue-gtag-next";
const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: TimeLine
  },
  {
    path: '/timeline/:uri',
    name: 'timeline_uri',
    component: TimeLine
  },
  {
    path: '/thread/:uri',
    name: 'thread_uri',
    component: Thread
  },

  {
    path: '/popular/',
    name: 'popular',
    component: Popular
  },
  {
    path: '/suggestions/',
    name: 'suggestions',
    component: Suggestions
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile
  },
  {
    path: '/profile/:handle',
    name: 'profile_handle',
    component: Profile
  },
  {
    path: '/profileEdit',
    name: 'profileEdit',
    component: ProfileEdit
  },
  {
    path: '/handleEdit',
    name: 'handleEdit',
    component: HandleEdit
  },
  {
    path: '/logout',
    name: 'logout',
    component: TimeLine
  },
  {
    path: '/followers/:handle',
    name: 'followers',
    component: Followers
  },
  {
    path: '/follows/:handle',
    name: 'follows',
    component: Follows
  },
  {
    path: '/search',
    name: 'search',
    component: Search
  },
  {
    path: '/privacypolicy',
    name: 'privacypolicy',
    component: PrivacyPolicy
  },
  {
    path: '/suggestions',
    name: 'suggestions',
    component: Suggestions
  },
  {
    path: '/accountCreate',
    name: 'accountCreate',
    component: AccountCreate
  },
  {
    path: '/notification',
    name: 'notification',
    component: Notification
  },
  {
    path: '/likes',
    name: 'likes',
    component: Likes
  },
  {
    path: '/likes/:handle',
    name: 'likes_handle',
    component: Likes
  },
  {
    path: '/mutes',
    name: 'mutes',
    component: Mutes
  },
  {
    path: '/inviteCodes',
    name: 'inviteCodes',
    component: InviteCodes
  },
  {
    path: '/post',
    name: 'post',
    component: Post
  },
  {
    path: '/reply/:uri',
    name: 'reply',
    component: Post
  },
  {
    path: '/quoteRepost/:uri',
    name: 'quoteRepost',
    component: Post
  },
  {
    path: '/',
    name: 'login',
    component: Login
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
trackRouter(router);
export default router;
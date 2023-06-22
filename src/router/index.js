import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/LoginView.vue';
import TimeLine from '@/components/TimeLineView.vue';
import Profile from '@/components/ProfileView.vue';
import Followers from '@/components/FollowersView.vue';
import Follows from '@/components/FollowsView.vue';
import Popular from '@/components/PopularFeedView.vue';
import Suggestions from '@/components/SuggestionsView.vue';
import PrivacyPolicy from '@/components/PrivacyPolicyView.vue';
import ProfileEdit from '@/components/ProfileEditView.vue';
import Notification from '@/components/NotificationView.vue'
import Likes from '@/components/LikesView.vue'
import Thread from '@/components/ThreadView.vue'
import Mutes from '@/components/MutesView.vue'
import InviteCodes from '@/components/InviteCodesView.vue'
import Post from '@/components/PostFormView.vue'
import Settings from '@/components/SettingsView.vue'
import Blocks from '@/components/BlocksView.vue'
import Moderation from '@/components/ModerationView.vue'
import AccountSetting from '@/components/AccountSettingsView.vue'
import AccountSettingsPush from '@/components/AccountSettingsPushView.vue'
import AccountSettingsFilter from '@/components/AccountSettingsFilterView.vue'
import CustomFeed from '@/components/CustomFeedView.vue'
import { trackRouter } from "vue-gtag-next";
import Sync from "@/components/SyncView.vue"
import CustomFeedList from "@/components/CustomFeedListView"
import AccountSettingsMuteWords from '@/components/AccountSettingsMuteWordsView'
import FunctionDescription from '@/components/FunctionDescriptionView'
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
    path: '/blocks',
    name: 'blocks',
    component: Blocks
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
    path: '/editPost/:uri',
    name: 'editPost',
    component: Post
  },
  {
    path: '/quoteRepost/:uri',
    name: 'quoteRepost',
    component: Post
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings
  },
  {
    path: '/reportPost/:uri',
    name: 'reportPost',
    component: Moderation
  },
  {
    path: '/reportUser/:handle',
    name: 'reportUser',
    component: Moderation
  },
  {
    path: '/accountSetting/:did/:handle',
    name: 'accountSetting',
    component: AccountSetting
  },
  {
    path: '/accountSettingsPush/:did/:handle',
    name: 'accountSettingsPush',
    component: AccountSettingsPush
  },
  {
    path: '/accountSettingsFilter/:did/:handle',
    name: 'accountSettingsFilter',
    component: AccountSettingsFilter
  },
  {
    path: '/customFeed/',
    name: 'customFeed',
    component: CustomFeed
  },
  {
    path: '/sync',
    name: 'sync',
    component: Sync
  },
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/customFeedList/:did/:handle',
    name: 'customFeedList',
    component: CustomFeedList
  },
  {
    path: '/accountSettingsMuteWords/:did/:handle',
    name: 'accountSettingsMuteWords',
    component: AccountSettingsMuteWords
  },
  {
    path: '/functionDescription',
    name: 'functionDescription',
    component: FunctionDescription
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
trackRouter(router);
export default router;
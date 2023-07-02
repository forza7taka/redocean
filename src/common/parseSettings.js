import { ref } from 'vue'
import Parse from "parse"
import { useStorage } from '@vueuse/core'

export function useParseSettings() {

    async function upload() {
        const settings = ref(null)
        useStorage('redocean', settings, undefined,
            {
                serializer: {
                    read: (v) => JSON.parse(v),
                    write: (v) => JSON.stringify(v)
                },
            })
        if (!settings.value) {
            return
        }
        const current = Parse.User.current();
        if (!current) {
            return
        }
        current.setACL(new Parse.ACL(current));

        const Setting = Parse.Object.extend("setting");
        const settingQuery = new Parse.Query(Setting);
        settingQuery.equalTo("userId", current.id);
        let setting = await settingQuery.first();
        if (!setting) {
            setting = new Setting();
        }
        setting.setACL(new Parse.ACL(Parse.User.current()));
        setting.set("translationApiKey", settings.value.translationApiKey)
        setting.set("translationLang", settings.value.translationLang)
        setting.set("handed", settings.value.handed)
        setting.set("userId", current.id)
        setting.save()

        console.log(settings.value.users)

        const AccountSetting = Parse.Object.extend("accountSetting");
        const map = new Map()
        for (let i = 0; i < settings.value.users.length; i++) {
            const u = settings.value.users[i]
            const accountSettingQuery = new Parse.Query(AccountSetting);
            accountSettingQuery.equalTo("did", u.did);
            let accountSetting = await accountSettingQuery.first();
            if (!accountSetting) {
                accountSetting = new AccountSetting();
            }
            accountSetting.setACL(new Parse.ACL(Parse.User.current()));
            accountSetting.set("index", i)
            accountSetting.set("server", u.server)
            accountSetting.set("did", u.did)
            accountSetting.set("handle", u.handle)
            accountSetting.set("avatar", u.avatar)
            accountSetting.set("color", u.color)
            accountSetting.set("parent", setting)
            if (u.push) {
                accountSetting.set("pushEnable", u.push.enable)
                accountSetting.set("pushEnableFollowed", u.push.enableFollowed)
                accountSetting.set("pushEnableReposted", u.push.enableReposted)
                accountSetting.set("pushEnableReplied", u.push.enableReplied)
                accountSetting.set("pushEnableLiked", u.push.enableLiked)
                accountSetting.set("pushEnableMention", u.push.enableMention)
            }
            if (u.langs[0]) {
                accountSetting.set("langs1", u.langs[0])
            } else{
                accountSetting.set("langs1", "")
            }
            if (u.langs[1]) {
                accountSetting.set("langs2", u.langs[1])
            } else{
                accountSetting.set("langs2", "")
            }
            if (u.langs[2]) {
                accountSetting.set("langs3", u.langs[2])
            } else{
                accountSetting.set("langs3", "")
            }
            accountSetting.save()
            map.set(u.did, u.did)
        }

        const accountSettingQuery = new Parse.Query(AccountSetting);
        accountSettingQuery.equalTo("parent", setting.id);
        const accountSettings = await accountSettingQuery.find();
        for (let i = 0; i < accountSettings.length; i++) {
            const accountSetting = accountSettings[i];
            if (map.get(accountSetting.get("did"))) {
                continue
            }
            accountSetting.destroy();
        }

        const LabelsSetting = Parse.Object.extend("labelsSetting");
        const labelsSettingQuery = new Parse.Query(LabelsSetting);
        labelsSettingQuery.equalTo("parent", setting.id);
        const labelsSettings = await labelsSettingQuery.find();
        for (let i = 0; i < labelsSettings.length; i++) {
            labelsSettings[i].destroy();
        }
        for (let i = 0; i < settings.value.users.length; i++) {
            const u = settings.value.users[i]
            if (!u.labels) {
                continue
            }
            for (let j = 0; j < u.labels.length; j++) {
                const label = u.labels[j]
                if (label.name) {
                    continue
                }
                const labelsSetting = new LabelsSetting();
                labelsSetting.setACL(new Parse.ACL(Parse.User.current()));
                labelsSetting.set("did", u.did)
                labelsSetting.set("labelId", label.id)
                labelsSetting.set("value", label.value)
                labelsSetting.set("parent", setting);
                labelsSetting.save()
            }
        }

        // const FeedsSetting = Parse.Object.extend("feedsSetting");
        // const feedsSettingQuery = new Parse.Query(FeedsSetting);
        // feedsSettingQuery.equalTo("parent", setting.id);
        // const feedsSettings = await feedsSettingQuery.find();
        // for (let i = 0; i < feedsSettings.length; i++) {
        //     feedsSettings[i].destroy();
        // }
        // for (let i = 0; i < settings.value.users.length; i++) {
        //     const u = settings.value.users[i]
        //     if (!u.feeds) {
        //         continue
        //     }
        //     for (let j = 0; j < u.feeds.length; j++) {
        //         const feed = u.feeds[j]
        //         const feedsSetting = new FeedsSetting();
        //         feedsSetting.setACL(new Parse.ACL(Parse.User.current()));
        //         feedsSetting.set("did", u.did)
        //         feedsSetting.set("uri", feed)
        //         feedsSetting.set("parent", setting);
        //         feedsSetting.save()
        //     }
        // }
        const MuteWordsSetting = Parse.Object.extend("muteWordsSetting");
        const muteWordsSettingQuery = new Parse.Query(MuteWordsSetting);
        muteWordsSettingQuery.equalTo("parent", setting.id);
        const muteWordsSettings = await muteWordsSettingQuery.find();
        for (let i = 0; i < muteWordsSettings.length; i++) {
            muteWordsSettings[i].destroy();
        }
        for (let i = 0; i < settings.value.users.length; i++) {
            const u = settings.value.users[i]
            if (!u.muteWords) {
                continue
            }
            for (let j = 0; j < u.muteWords.length; j++) {
                const muteWord = u.muteWords[j]
                const muteWordsSetting = new MuteWordsSetting();
                muteWordsSetting.setACL(new Parse.ACL(Parse.User.current()));
                muteWordsSetting.set("did", u.did)
                muteWordsSetting.set("index", j)
                muteWordsSetting.set("value", muteWord.value)
                muteWordsSetting.set("parent", setting);
                muteWordsSetting.save()
            }
        }

    }

    async function download() {
        const user = ref([{
            did: null,
            server: null,
            handle: null,
            avatar: null,
            color: null,
            labels: null,
            feeds: null,
            langs: null
        }])
        const settings = ref({
            translationApiKey: null,
            translationLang: null,
            handed: true,
            users: user
        })
        const storageSettings = useStorage('redocean', settings)

        const u = Parse.User.current();
        if (!u) {
            return
        }
        u.setACL(new Parse.ACL(u));

        const Setting = Parse.Object.extend("setting");
        const query = new Parse.Query(Setting);
        query.equalTo("userId", u.id);
        const object = await query.first();
        if (!object) {
            return
        }
        settings.value.translationApiKey = object.get("translationApiKey")
        settings.value.translationLang = object.get("translationLang")
        settings.value.handed = object.get("handed")

        const AccountSetting = Parse.Object.extend("accountSetting");
        const query2 = new Parse.Query(AccountSetting);
        query2.equalTo("parent", object.id);
        query2.ascending("index")
        const results2 = await query2.find();
        settings.value.users = []
        for (let i = 0; i < results2.length; i++) {
            settings.value.users.push({
                did: results2[i].get("did"),
                server: results2[i].get("server"),
                handle: results2[i].get("handle"),
                avatar: results2[i].get("avatar"),
                labels: null,
                color: results2[i].get("color"),
                push: {
                    enable: results2[i].get("pushEnable"),
                    enableFollowed: results2[i].get("pushEnableFollowed"),
                    enableReposted: results2[i].get("pushEnableReposted"),
                    enableReplied: results2[i].get("pushEnableReplied"),
                    enableLiked: results2[i].get("pushEnableLiked"),
                    enableMention: results2[i].get("pushEnableMention")
                },
                langs: [results2[i].get("langs1"),
                        results2[i].get("langs2"),
                        results2[i].get("langs3")] 
            })
        }
        const LabelsSetting = Parse.Object.extend("labelsSetting");
        const query3 = new Parse.Query(LabelsSetting);
        query3.equalTo("parent", object.id);
        const results3 = await query3.find();
        for (let i = 0; i < settings.value.users.length; i++) {
            settings.value.users[i].labels = []
            for (let j = 0; j < results3.length; j++) {
                if (results3[j].get("did") != settings.value.users[i].did) {
                    continue
                }
                settings.value.users[i].labels.push({
                    id: results3[j].get("labelId"),
                    value: results3[j].get("value")
                })
            }
        }
        // const FeedsSetting = Parse.Object.extend("feedsSetting");
        // const query4 = new Parse.Query(FeedsSetting);
        // query4.equalTo("parent", object.id);
        // const results4 = await query4.find();
        // for (let i = 0; i < settings.value.users.length; i++) {
        //     settings.value.users[i].feeds = []
        //     for (let j = 0; j < results4.length; j++) {
        //         if (results4[j].get("did") != settings.value.users[i].did) {
        //             continue
        //         }
        //         settings.value.users[i].labels.push(results4[j].get("uri"))
        //     }
        // }

        const MuteWordsSetting = Parse.Object.extend("muteWordsSetting");
        const query5 = new Parse.Query(MuteWordsSetting);
        query5.equalTo("parent", object.id);
        query5.ascending("index")
        const results5 = await query5.find();
        for (let i = 0; i < settings.value.users.length; i++) {
            settings.value.users[i].muteWords = []
            for (let j = 0; j < results5.length; j++) {
                if (results5[j].get("did") != settings.value.users[i].did) {
                    continue
                }
                settings.value.users[i].muteWords.push({ value: results5[j].get("value") })
            }
        }

        storageSettings.value = settings.value
    } return { upload, download }

}

import { ref } from 'vue'
import Parse from "parse"
import { useStorage } from '@vueuse/core'

export function useParseSettings() {

    async function upload() {
        const user = ref(null)
        const settings = ref({
            translationApiKey: null,
            translationLang: null,
            handed: true,
            users: user
        })
        useStorage('redocean', settings)

        const u = Parse.User.current();
        if (!u) {
            return
        }
        u.setACL(new Parse.ACL(u));

        await del(u);

        const Setting = Parse.Object.extend("setting");
        const setting = new Setting();
        setting.setACL(new Parse.ACL(Parse.User.current()));
        setting.set("translationApiKey", settings.value.translationApiKey)
        setting.set("translationLang", settings.value.translationLang)
        setting.set("handed", settings.value.handed)
        setting.save()

        const AccountSetting = Parse.Object.extend("accountSetting");
        for (let i = 0; i < settings.value.users.length; i++) {
            const u = settings.value.users[i]
            const accountSetting = new AccountSetting();
            accountSetting.setACL(new Parse.ACL(Parse.User.current()));
            accountSetting.set("server", u.server)
            accountSetting.set("did", u.did)
            accountSetting.set("handle", u.handle)
            accountSetting.set("avatar", u.avatar)
            accountSetting.set("color", u.color)
            accountSetting.set("parent", setting);
            accountSetting.save()
        }

        const LabelsSetting = Parse.Object.extend("labelsSetting");
        for (let i = 0; i < settings.value.users.length; i++) {
            const u = settings.value.users[i]
            if (!u.labels) {
                continue
            }
            for (let j = 0; j < u.labels.length; j++) {
                const label = u.labels[j]
                const labelsSetting = new LabelsSetting();
                labelsSetting.setACL(new Parse.ACL(Parse.User.current()));
                labelsSetting.set("did", u.did)
                labelsSetting.set("labelId", label.id)
                labelsSetting.set("value", label.value)
                labelsSetting.set("parent", setting);
                labelsSetting.save()
            }
        }
    }

    async function del(user) {
        const Setting = Parse.Object.extend("setting");
        const query1 = new Parse.Query(Setting);
        query1.equalTo("userId", user.id);
        const object = await query1.first();
        if (!object) {
            return
        }
        const AccountSetting = Parse.Object.extend("accountSetting");
        const query2 = new Parse.Query(AccountSetting);
        query2.equalTo("parent", object.id);
        const results2 = await query2.find();
        for (let i = 0; i < results2.length; i++) {
            results2[i].destroy();
        }
        const LabelsSetting = Parse.Object.extend("labelsSetting");
        const query3 = new Parse.Query(LabelsSetting);
        query3.equalTo("parent", object.id);
        const results3 = await query3.find();
        for (let i = 0; i < results3.length; i++) {
            results3[i].destroy();
        }
        object.destroy()
    }

    async function download() {
        const user = ref([{ did: null, server: null, handle: null, avatar: null, color: null, labels: null }])
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
        const results2 = await query2.find();
        settings.value.users = []
        for (let i = 0; i < results2.length; i++) {
            settings.value.users.push({
                did: results2[i].get("did"),
                server: results2[i].get("server"),
                handle: results2[i].get("handle"),
                avatar: results2[i].get("avatar"),
                labels: null,
                color: results2[i].get("color")
            })
        }
        const LabelsSetting = Parse.Object.extend("labelsSetting");
        const query3 = new Parse.Query(LabelsSetting);
        query3.equalTo("parent", object.id);
        const results3 = await query3.find();
        for (let i = 0; i < results3.length; i++) {
            for (let j = 0; j < settings.value.users.length; j++) {
                if (results3[i].get("did") == settings.value.users[j].did) {
                    settings.value.users[j].labels.push({
                        id: results3[i].get("labelId"),
                        value: results3[i].get("value")
                    })
                }
            }
        }
        storageSettings.value = settings.value
    }
    return { upload, download }

}

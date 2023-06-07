export default class settings {
    // userID
    // translationApiKey
    // translationLang
    // handed
    // users = [[
    //     did,
    //     server,
    //     handle,
    //     password,
    //     avatar,
    //     labels = [{ id, value }],
    //     color]]

    constructor(settings) {
        if (!settings) {
            return {
                userID: null,
                translationApiKey: null,
                translationLang: null,
                handed: null,
                users: []
            }
        }
        this.userID = settings.userID
        this.translationApiKey = settings.translationApiKey
        this.translationLang = settings.translationLang
        this.handed = settings.handed
        this.users = settings.users
    }

    async getUser(did, handle) {
        let index = await this.getHandleUserIndex(handle)
        if (index == -1) {
            index = await this.getUserIndex(did)
        }
        if (index == -1) {
            return {}
        }
        return this.users[index]
    }

    async getColor(did, handle) {
        const user = await this.getUser(did, handle)
        if (!user) {
            return null
        }
        return user.color
    }

    async getUserIndex(did) {
        if (!this.users) {
            return -1
        }
        for (let i = 0; i < this.users.length; i++) {
            const el = this.users[i]
            if (el.did == did) {
                return i
            }
        }
        return -1
    }

    async getHandleUserIndex(handle) {
        if (!this.users) {
            return -1
        }
        for (let i = 0; i < this.users.length; i++) {
            const el = this.users[i]
            if (el.handle == handle) {
                return i
            }
        }
        return -1
    }

    async updateUser(did, server, handle, avator) {
        let index = await this.getHandleUserIndex(handle)
        if (index == -1) {
            index = await this.getUserIndex(did)
        }
        if (index == -1) {
            this.users.push({ did: did, server: server, handle: handle, avator: avator })
            return
        }
        let user = this.users[index]
        user.did = did
        user.server = server
        user.handle = handle
        user.avator = avator
        this.users.splice(index, 0, user)
    }

    async updateUserSetting(did, handle, labels, color) {
        let index = -1
        if (did) {
            index = await this.getUserIndex(did)
        }
        if (handle) {
            index = await this.getHandleUserIndex(handle)
        }
        let user
        if (index == -1) {
            user = { did: did, server: null, handle: handle, avator: null, labels: labels, color: color }
            this.users.push(user)
        } else {
            user = this.users[index]
            user.labels = labels
            user.color = color
            this.users.splice(index, 0, user)
        }
    }
}
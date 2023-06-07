
export function useSettings(obj) {

    async function getUser(did, handle) {
        let index = await getHandleUserIndex(handle)
        if (index == -1) {
            index = await getUserIndex(did)
        }
        if (index == -1) {
            return {}
        }
        return obj.users[index]
    }

    async function getColor(did, handle) {
        const user = await getUser(did, handle)
        if (!user) {
            return null
        }
        return user.color
    }

    async function getUserIndex(did) {
        if (!obj.users) {
            return -1
        }
        for (let i = 0; i < obj.users.length; i++) {
            const el = obj.users[i]
            if (el.did == did) {
                return i
            }
        }
        return -1
    }

    async function getHandleUserIndex(handle) {
        if (!obj.users) {
            return -1
        }
        for (let i = 0; i < obj.users.length; i++) {
            const el = obj.users[i]
            if (el.handle == handle) {
                return i
            }
        }
        return -1
    }

    async function updateUser(did, server, handle, avatar) {
        let index = await getHandleUserIndex(handle)
        if (index == -1) {
            index = await getUserIndex(did)
        }
        if (index == -1) {
            obj.users.push({ did: did, server: server, handle: handle, avatar: avatar })
            return
        }
        let user = obj.users[index]
        user.did = did
        user.server = server
        user.handle = handle
        user.avatar = avatar
        obj.users[index] = user
    }

    async function deleteUser(did, handle) {
        let index = await getHandleUserIndex(handle)
        if (index == -1) {
            index = await getUserIndex(did)
        }
        if (index == -1) {
            return
        }
        obj.users.splice(index, 1)
    }


    async function updateUserSetting(did, handle, labels, color) {
        let index = -1
        if (did) {
            index = await getUserIndex(did)
        }
        if (handle) {
            index = await getHandleUserIndex(handle)
        }
        let user
        if (index == -1) {
            user = { did: did, server: null, handle: handle, avatar: null, labels: labels, color: color }
            obj.users.push(user)
        } else {
            user = obj.users[index]
            user.labels = labels
            user.color = color
            obj.users.splice(index, 0, user)
        }
    }

    return { getUser, getColor, updateUser, updateUserSetting, deleteUser }

}

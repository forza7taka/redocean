export class Setting {
    userID = null
    translationApiKey = null
    translationLang = null
    handed = null
    users = [new User()]
}

export class User {
    did = null
    server = null
    handle = null
    avatar = null
    color = null
    labels = null
    push = new Push()
    feeds = null
    muteWords = null
    langs = null
}

export class Push {
    enable = null
    enableFollowed = null
    enableReposted = null
    enableReplied = null
    enableLiked = null
    enableMention = null
}
export default class Timeline{
  constructor() {
    this.array = new Array()
    this.map = new Map()
  }

  async add(feed) {
    let key = feed.post.uri
    let indexedAt = feed.post.indexedAt
    if (feed.reason) {
      key = feed.reason.$type + "#" + feed.reason.by.did + "#" + key
      indexedAt = feed.reason.indexedAt
    }
    if (this.map.has(key)) {
      return
    }
    if (this.array.length == 0) {
      this.array.push(feed)
      this.map.set(key, null)
      return
    }
    for (let i = 0; i < this.array.length; i++) {
      const el = this.array[i]
      let elIndexedAt = el.post.indexedAt
      if (el.reason) {
        elIndexedAt = el.reason.indexedAt
      }
      if (indexedAt > elIndexedAt) {
        this.array.splice(i, 0, feed)
        this.map.set(key, null)
        return
      }
    }
    if (!this.map.has(feed.post.uri)) {
      this.array.push(feed)
      this.map.set(key, null)
    }
    return
  }

  async setArray(array) {
    array.forEach(el => {
      this.add(el)
    });
  }
}
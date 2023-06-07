export default class Users {
  constructor() {
    this.array = new Array()
    this.map = new Map()
  }

  async add(user) {
    let key = user.did
    if (this.map.has(key)) {
      return
    }
    this.array.push(user)
    this.map.set(key, null)
  }

  async setArray(array) {
    array.forEach(el => {
      this.add(el)
    });
  }

  async delete(did) {
    for (let i = 0; i < this.array.length; i++) {
      const el = this.array[i]
      if (el.did == did) {
        this.array.splice(i, 1)
        this.map.delete(did)
      }
    }
  }
}
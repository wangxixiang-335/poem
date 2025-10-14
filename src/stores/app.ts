import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: '诗词鉴赏平台'
  }),
  actions: {
    setTitle(t: string) {
      this.title = t
    }
  }
})
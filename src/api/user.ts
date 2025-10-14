import http from './http'

export interface User {
  id: string
  name: string
}

export function fetchUser(id: string) {
  return http.get<User>(`/users/${id}`)
}
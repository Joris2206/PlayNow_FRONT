import axios from "axios"

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE ??
    process.env.PUBLIC_API_BASE ??
    "http://localhost:8000",
  withCredentials: true,
})

export const setAuthHeader = (token?: string) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  else delete api.defaults.headers.common["Authorization"]
}
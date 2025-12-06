import { getAuthUser } from '@/services/firebase/firebaseServices.js'
import axios from 'axios'

export class HTTPClient {
  axiosInstance

  constructor(baseURL) {
    this.axiosInstance = axios.create({ baseURL: baseURL })
  }

  async createHeaders() {
    const user = getAuthUser()
    const token = await user?.getIdToken()
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    if (user?.uid) {
      headers['X-User-Id'] = user.uid
    }
    return {
      headers: headers,
    }
  }

  async post(url, body) {
    const headers = await this.createHeaders()
    return await this.axiosInstance.post(url, body, headers)
  }

  async put(url, body) {
    const headers = await this.createHeaders()
    return await this.axiosInstance.put(url, body, headers)
  }

  async get(url, params = {}) {
    const headers = await this.createHeaders()
    const response = await this.axiosInstance.get(url, {
      headers: headers.headers,
      params: params,
    })
    return response
  }

  async delete(url) {
    const headers = await this.createHeaders()
    return await this.axiosInstance.delete(url, headers)
  }

  async patch(url, body) {
    const headers = await this.createHeaders()
    return await this.axiosInstance.patch(url, body, headers)
  }
}

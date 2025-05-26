import api from '@/services/axiosConfig'

const state = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  status: '' // 'loading', 'success', 'error'
}

const getters = {
  isAuthenticated: state => !!state.token,
  isAdmin: state => state.user && state.user.role === 'admin',
  authStatus: state => state.status,
  currentUser: state => state.user
}

const mutations = {
  AUTH_REQUEST(state) {
    state.status = 'loading'
  },
  AUTH_SUCCESS(state, { token, user }) {
    state.status = 'success'
    state.token = token
    state.user = user
  },
  AUTH_ERROR(state) {
    state.status = 'error'
  },
  LOGOUT(state) {
    state.status = ''
    state.token = null
    state.user = null
  }
}

const actions = {
  async login({ commit }, credentials) {
    commit('AUTH_REQUEST')
    try {
      const response = await api.post('/users/sign_in', {
        user: credentials
      })

      const token = response.headers['authorization'] || response.data.token
      const userData = response.data.user

      if(token && userData) {
        const user = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'guest'
        }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        commit('AUTH_SUCCESS', { token, user })
        return response
      }
    } catch (error) {
      commit('AUTH_ERROR')
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      let errorMessage = ''
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      }

      throw new Error(errorMessage)
    }
  },

  async register({ commit }, userData) {
    commit('AUTH_REQUEST')
    try {
      const response = await api.post('/users', {
        user: userData
      })
      return response.data
    } catch (error) {
      commit('AUTH_ERROR')

      let errorMessage = 'Erro ao registrar'
      if (error.response) {
        if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join(', ')
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      }

      throw new Error(errorMessage)
    }
  },

  async forgotPassword({ commit }, email) {
    commit('AUTH_REQUEST')
    try {
      await api.post('/users/password', {
        user: { email }
      })
      return true
    } catch (error) {
      commit('AUTH_ERROR')
      throw error
    }
  },

  async resetPassword({ commit }, { token, password, passwordConfirmation }) {
    commit('AUTH_REQUEST')
    try {
      const response = await api.put('/users/password', {
        user: {
          reset_password_token: token,
          password,
          password_confirmation: passwordConfirmation
        }
      })
      return response.data
    } catch (error) {
      commit('AUTH_ERROR')
      throw error
    }
  },

  async logout({ commit }) {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      commit('LOGOUT')

      await api.delete('/users/sign_out')

      return { success: true }
    } catch (error) {
      commit('LOGOUT')

      let errorMessage = 'Logout concluído (erro na comunicação com o servidor)'
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage
      }

      return { success: false, message: errorMessage }
    }
  },

  async resendConfirmationEmail({ commit }, { email }) {
    commit('AUTH_REQUEST')
    try {
      const response = await api.post('/users/confirmation', {
        user: { email }
      })
      return response.data
    } catch (error) {
      commit('AUTH_ERROR')
      let errorMessage = 'Erro ao reenviar e-mail de confirmação'
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage
      }
      throw new Error(errorMessage)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
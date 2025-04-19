  const state = {
    notifications: []
  }
  
  const mutations = {
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification)
    },
    REMOVE_NOTIFICATION(state, notificationId) {
      state.notifications = state.notifications.filter(
        n => n.id !== notificationId
      )
    }
  }
  
  const actions = {
    addNotification({ commit }, notification) {
      const id = Date.now().toString()
      const type = notification.type || 'info'
      
      commit('ADD_NOTIFICATION', {
        id,
        type,
        message: notification.message,
        timeout: notification.timeout || 15000 // 15 segundos padrão
      })
      
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', id)
      }, notification.timeout || 15000)
    },
    removeNotification({ commit }, notificationId) {
      commit('REMOVE_NOTIFICATION', notificationId)
    }
  }
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions
  }
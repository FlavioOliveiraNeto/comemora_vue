export default {
    success(store, message, timeout = 8000) {
      store.dispatch('notifications/addNotification', {
        type: 'success',
        message,
        timeout
      }, { root: true })
    },
    error(store, message, timeout = 8000) {
      store.dispatch('notifications/addNotification', {
        type: 'error',
        message,
        timeout
      }, { root: true })
    }
}
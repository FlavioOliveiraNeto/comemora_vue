import { createStore } from 'vuex'
import auth from './modules/auth'
import notifications from './modules/notifications'

export default createStore({
  modules: {
    auth,
    notifications
  }
})
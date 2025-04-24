import { createStore } from 'vuex'
import auth from './modules/auth'
import notifications from './modules/notifications'
import events from './modules/events'

export default createStore({
  modules: {
    auth,
    notifications,
    events
  }
})
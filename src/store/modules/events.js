import api from '@/services/axiosConfig'

export default {
  state: {
    organizedEvents: [],
    participatingEvents: []
  },
  mutations: {
    SET_ORGANIZED_EVENTS(state, events) {
      state.organizedEvents = events
    },
    SET_PARTICIPATING_EVENTS(state, events) {
      state.participatingEvents = events
    },
    ADD_EVENT(state, event) {
      state.organizedEvents.push(event)
    },
    UPDATE_EVENT(state, updatedEvent) {
      const index = state.organizedEvents.findIndex(e => e.id === updatedEvent.id)
      if (index !== -1) {
        Vue.set(state.organizedEvents, index, updatedEvent)
      }
    },
    REMOVE_EVENT(state, eventId) {
      state.organizedEvents = state.organizedEvents.filter(e => e.id !== eventId)
    },
    LEAVE_EVENT(state, eventId) {
      state.participatingEvents = state.participatingEvents.filter(e => e.id !== eventId)
    }
  },
  actions: {
    async fetchHomeEvents({ commit }) {
      try {
        const response = await api.get('/api/home')
        commit('SET_ORGANIZED_EVENTS', response.data.organized_events)
        commit('SET_PARTICIPATING_EVENTS', response.data.participating_events)
        return response
      } catch (error) {
        throw error
      }
    },
    async deleteEvent({ commit }, eventId) {
      try {
        await api.delete(`/api/events/${eventId}`)
        commit('REMOVE_EVENT', eventId)
        return { success: true }
      } catch (error) {
        throw error
      }
    },
    async leaveEvent({ commit }, eventId) {
      try {
        await api.delete(`/api/events/${eventId}/leave`)
        commit('LEAVE_EVENT', eventId)
        return { success: true }
      } catch (error) {
        throw error
      }
    }
  },
  getters: {
    organizedEvents: state => state.organizedEvents,
    participatingEvents: state => state.participatingEvents
  }
}
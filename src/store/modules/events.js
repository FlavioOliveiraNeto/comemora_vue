import api from '@/services/axiosConfig';

export default {
  namespaced: true,
  state: {
    organizedEvents: [],
    participatingEvents: []
  },
  mutations: {
    SET_ORGANIZED_EVENTS(state, events) {
      state.organizedEvents = events;
    },
    SET_PARTICIPATING_EVENTS(state, events) {
      state.participatingEvents = events;
    },
    ADD_EVENT(state, event) {
      state.organizedEvents.push(event);
    },
    UPDATE_EVENT(state, updatedEvent) {
      const index = state.organizedEvents.findIndex(e => e.id === updatedEvent.id);
      if (index !== -1) {
        state.organizedEvents.splice(index, 1, updatedEvent);
      }
    },
    REMOVE_EVENT(state, eventId) {
      state.organizedEvents = state.organizedEvents.filter(e => e.id !== eventId);
    },
    LEAVE_EVENT(state, eventId) {
      state.participatingEvents = state.participatingEvents.filter(e => e.id !== eventId);
    }
  },
  actions: {
    async fetchHomeEvents({ commit }) {
      try {
        const response = await api.get('/api/home');
        commit('SET_ORGANIZED_EVENTS', response.data.organized_events);
        commit('SET_PARTICIPATING_EVENTS', response.data.participating_events);
        return response;
      } catch (error) {
        throw error;
      }
    },

    async fetchEventById(_, eventId) {
      try {
        const response = await api.get(`/api/events/${eventId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async createEvent({ commit }, formData) {
      try {
        const response = await api.post('/api/events', formData)
  
        commit('ADD_EVENT', response.data);
        return response.data;
      } catch (error) {
        throw new Error(error)
      }
    },

    async updateEvent({ commit }, { id, formData }) {
      try {
        // Converta boolean para string para o FormData
        formData.set('keep_banner', formData.get('keep_banner') === 'true' ? 'true' : 'false');
        
        const response = await api.put(`/api/events/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        commit('UPDATE_EVENT', response.data.evento);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },

    async deleteEvent({ commit }, eventId) {
      try {
        await api.delete(`/api/events/${eventId}`);
        commit('REMOVE_EVENT', eventId);
        return { success: true };
      } catch (error) {
        throw error;
      }
    },

    async leaveEvent({ commit }, eventId) {
      try {
        await api.delete(`/api/events/${eventId}/leave`);
        commit('LEAVE_EVENT', eventId);
        return { success: true };
      } catch (error) {
        throw error;
      }
    }
  },
  getters: {
    organizedEvents: state => state.organizedEvents,
    participatingEvents: state => state.participatingEvents
  }
};
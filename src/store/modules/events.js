import api from '@/services/axiosConfig';

export default {
  namespaced: true,
  state: {
    organizedEvents: [],
    participatingEvents: [],
    eventMedia: {}
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
    ADD_PARTICIPATING_EVENT(state, event) {
      state.participatingEvents.push(event);
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
    },
    // Mutations para manipulação de mídias
    SET_EVENT_MEDIA(state, { eventId, media }) {
      state.eventMedia = {
        ...state.eventMedia,
        [eventId]: media
      };
    },
    ADD_EVENT_MEDIA(state, { eventId, mediaItem }) {
      if (!state.eventMedia[eventId]) {
        state.eventMedia[eventId] = [];
      }
      // Garante que não estamos adicionando duplicados
      if (!state.eventMedia[eventId].some(m => m.id === mediaItem.id)) {
        state.eventMedia[eventId].unshift(mediaItem); // Adiciona no início
      }
    },
    REMOVE_EVENT_MEDIA(state, { eventId, mediaId }) {
      if (state.eventMedia[eventId]) {
        const index = state.eventMedia[eventId].findIndex(m => m.id === mediaId);
        if (index !== -1) {
          state.eventMedia[eventId].splice(index, 1);
        }
      }
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

    async fetchEventDetailsById(_, { eventId, token }) {
      try {
        const params = token ? { token } : {};
        const response = await api.get(`/api/events/${eventId}/event_details`, { params });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async createEvent({ commit }, formData) {
      try {
        const response = await api.post('/api/events', formData)
  
        commit('ADD_EVENT', response.data.evento);
        return response.data;
      } catch (error) {
        throw new Error(error)
      }
    },

    async updateEvent({ commit }, { id, formData }) {
      try {
        if (!formData.has('keep_banner')) {
          formData.set('keep_banner', 'false');
        }
        
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

    async joinEvent({ commit }, { eventId, token }) {
      try {
        const response = await api.post(`/api/events/${eventId}/join`, { token });
        const event = response.data.event;

        commit('ADD_PARTICIPATING_EVENT', event);
        return event;
      } catch (error) {
        throw new Error("Erro ao aceitar o convite: " + error.response?.data?.message);
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
    },

    async fetchEventMedia({ commit }, eventId) {
      try {
        const response = await api.get(`/api/events/${eventId}/media`);
        commit('SET_EVENT_MEDIA', { eventId, media: response.data });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async addEventMedia({ commit }, { eventId, mediaFile, description = '' }) {
      try {
        const formData = new FormData();
        formData.append("media[file]", mediaFile);
        formData.append("media[description]", description);

        const response = await api.post(
          `/api/events/${eventId}/media`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        commit('ADD_EVENT_MEDIA', { eventId, mediaItem: response.data });
        return response.data; 
      } catch (error) {
        throw error;
      }
    },

    async removeEventMedia({ commit }, { eventId, mediaId }) {
      try {
        await api.delete(`/api/events/${eventId}/media/${mediaId}`);
        commit('REMOVE_EVENT_MEDIA', { eventId, mediaId });
        return { success: true };
      } catch (error) {
        throw error;
      }
    },
  },
  getters: {
    organizedEvents: state => state.organizedEvents,
    participatingEvents: state => state.participatingEvents,
    getEventMedia: state => eventId => state.eventMedia[eventId] || []
  }
};
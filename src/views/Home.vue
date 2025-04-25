<template>
  <div class="home-container">
    <header class="user-info">
      <h1>Bem-vindo, {{ user.name }}!</h1>
      <p>Seu email: {{ user.email }}</p>
      <button @click="handleLogout" class="logout-btn">Sair</button>
      <button @click="goToCreateEvent" class="create-event-btn">
        Criar Evento
      </button>
    </header>

    <section class="events-section">
      <div class="events-column">
        <h2>Eventos que você criou</h2>
        <div v-if="organizedEvents.length === 0" class="no-events">
          <p>Você ainda não criou nenhum evento.</p>
        </div>
        <div v-else class="events-list">
          <div
            v-for="event in organizedEvents"
            :key="event.id"
            class="event-card"
          >
            <h3>{{ event.title }}</h3>
            <p>{{ formatDate(event.start_date) }}</p>
            <p>{{ event.location }}</p>
            <div class="event-actions">
              <button @click="viewEvent(event.id)" class="action-btn view">
                Ver
              </button>
              <button @click="editEvent(event.id)" class="action-btn edit">
                Editar
              </button>
              <button @click="deleteEvent(event.id)" class="action-btn delete">
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="events-column">
        <h2>Eventos que você participa</h2>
        <div v-if="participatingEvents.length === 0" class="no-events">
          <p>Você não está participando de nenhum evento.</p>
        </div>
        <div v-else class="events-list">
          <div
            v-for="event in participatingEvents"
            :key="event.id"
            class="event-card"
          >
            <h3>{{ event.title }}</h3>
            <p>{{ formatDate(event.start_date) }}</p>
            <p>{{ event.location }}</p>
            <p>Criado por: {{ event.admin.name }}</p>
            <div class="event-actions">
              <button @click="viewEvent(event.id)" class="action-btn view">
                Ver
              </button>
              <button @click="leaveEvent(event.id)" class="action-btn leave">
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import notifications from "../../utils/notifications_helper";
import moment from "moment";

export default {
  data() {
    return {
      organizedEvents: [],
      participatingEvents: [],
    };
  },
  computed: {
    ...mapGetters("auth", ["currentUser", "isAuthenticated"]),
    user() {
      return this.currentUser || { name: "", email: "", role: "" };
    },
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    ...mapActions("events", ["fetchEvents", "deleteEvent"]),

    async fetchUserData() {
      try {
        // Use a action do store
        await this.$store.dispatch("events/fetchHomeEvents");
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        notifications.error(this.$store, "Erro ao carregar dados do usuário");
      }
    },

    formatDate(dateString) {
      return moment(dateString).format("DD/MM/YYYY HH:mm");
    },

    async handleLogout() {
      try {
        const result = await this.$store.dispatch("auth/logout");

        if (result.success) {
          notifications.success(this.$store, "Deslogado com sucesso.");
        } else {
          notifications.error(this.$store, "Erro ao deslogar usuário.");
        }

        this.$router.push("/login");
      } catch (error) {
        notifications.error(this.$store, "Ocorreu um erro durante o logout.");
        console.error("Logout error:", error);
      }
    },

    goToCreateEvent() {
      this.$router.push("/events/new");
    },

    viewEvent(eventId) {
      this.$router.push(`/events/${eventId}`);
    },

    editEvent(eventId) {
      this.$router.push(`/events/${eventId}/edit`);
    },

    async deleteEvent(eventId) {
      try {
        await this.$store.dispatch("events/deleteEvent", eventId);
        notifications.success(this.$store, "Evento excluído com sucesso");
        await this.fetchUserData(); // Atualiza a lista após exclusão
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        notifications.error(this.$store, "Erro ao excluir evento");
      }
    },

    async leaveEvent(eventId) {
      try {
        await this.$http.delete(`/api/events/${eventId}/leave`);
        notifications.success(this.$store, "Você saiu do evento com sucesso");
        await this.fetchUserData(); // Atualiza a lista após sair do evento
      } catch (error) {
        console.error("Erro ao sair do evento:", error);
        notifications.error(this.$store, "Erro ao sair do evento");
      }
    },
  },
  watch: {
    isAuthenticated(newVal) {
      if (!newVal) {
        this.$router.push("/auth");
      }
    },
  },
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-info {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.events-section {
  display: flex;
  gap: 20px;
}

.events-column {
  flex: 1;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.events-list {
  display: grid;
  gap: 15px;
}

.event-card {
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn {
  background: #ff4444;
  color: white;
}

.create-event-btn {
  background: #4285f4;
  color: white;
  margin-left: 10px;
}

.action-btn {
  color: white;
}

.view {
  background: #4285f4;
}

.edit {
  background: #ffbb33;
}

.delete {
  background: #ff4444;
}

.leave {
  background: #aa66cc;
}

.no-events {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>

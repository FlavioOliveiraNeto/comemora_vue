<template>
  <div class="home-container">
    <header class="user-info">
      <h1>Bem-vindo(a), {{ user.name }}!</h1>
      <p>Seu email: {{ user.email }}</p>
      <div class="user-actions">
        <button @click="handleLogout" class="logout-btn">Sair</button>
        <button @click="goToCreateEvent" class="create-event-btn">
          Criar Evento
        </button>
      </div>
    </header>

    <section class="events-section">
      <OrganizedEvents
        :events="organizedEvents"
        @view-event="viewEvent"
        @edit-event="editEvent"
        @delete-event="handleDeleteEvent"
      />
      <ParticipatingEvents
        :events="participatingEvents"
        @view-event="viewEvent"
        @leave-event="handleLeaveEvent"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import notifications from "../../utils/notifications_helper";
import OrganizedEvents from "../components/home/OrganizedEvents.vue";
import ParticipatingEvents from "../components/home/ParticipatingEvents.vue";

export default {
  components: {
    OrganizedEvents,
    ParticipatingEvents,
  },
  data() {
    return {
      organizedEvents: [],
      participatingEvents: [],
    };
  },
  created() {
    this.fetchUserData();
  },
  computed: {
    ...mapGetters("auth", ["currentUser", "isAuthenticated"]),
    user() {
      return this.currentUser || { name: "", email: "", role: "" };
    },
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    ...mapActions("events", ["deleteEvent", "leaveEvent"]),

    async fetchUserData() {
      try {
        const response = await this.$store.dispatch("events/fetchHomeEvents");
        this.organizedEvents = response.data.organized_events || [];
        this.participatingEvents = response.data.participating_events || [];
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        notifications.error(this.$store, "Erro ao carregar dados do usuário");
      }
    },

    async handleDeleteEvent(eventId) {
      try {
        await this.deleteEvent(eventId);
        await this.fetchUserData();
        notifications.success(this.$store, "Evento excluído com sucesso");
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        notifications.error(this.$store, "Erro ao excluir evento");
      }
    },

    async handleLeaveEvent(eventId) {
      try {
        await this.$store.dispatch(`events/leaveEvent`, eventId);
        await this.fetchUserData();
        notifications.success(this.$store, "Você saiu do evento com sucesso");
      } catch (error) {
        console.error("Erro ao sair do evento:", error);
        notifications.error(this.$store, "Erro ao sair do evento");
      }
    },

    async handleLogout() {
      try {
        const result = await this.logout();

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
  padding: 15px;
}

.user-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
  display: grid;
  justify-items: center;
}

.user-info h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.user-info p {
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.logout-btn,
.create-event-btn {
  font-size: 1rem;
  width: 50%;
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
  width: fit-content;
}

.logout-btn {
  background: #ff4444;
  color: white;
  width: fit-content;
}

.events-section {
  display: flex;
  flex-direction: column; /* Empilhar seções de eventos no mobile */
  gap: 20px;
}

/* Estilos para telas maiores (tablets e desktops) */
@media (min-width: 768px) {
  .home-container {
    max-width: 90vw;
    margin: 0 auto;
    padding: 20px;
  }

  .create-event-btn {
    margin-left: 10px;
  }

  .events-section {
    flex-direction: row; /* Seções lado a lado em telas maiores */
  }
}
</style>

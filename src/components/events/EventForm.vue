<template>
  <div class="event-form-container">
    <div class="flex">
      <button
        type="button"
        @click="handleCancel"
        class="btn btn-secondary btn-voltar"
      >
        Voltar
      </button>
    </div>
    <form @submit.prevent="handleSubmit" class="event-form">
      <h2>{{ isEditing ? "Editar Evento" : "Criar Novo Evento" }}</h2>

      <!-- Upload do Banner -->
      <div class="form-group">
        <label>Banner do Evento</label>
        <div class="image-upload-container">
          <input
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            ref="fileInput"
            class="hidden-input"
          />
          <div
            class="upload-area"
            @click="$refs.fileInput.click()"
            :class="{ 'has-image': previewImage }"
          >
            <template v-if="!previewImage">
              <i class="fas fa-camera"></i>
              <p>Clique para adicionar uma imagem para o banner do evento</p>
            </template>
            <img v-else :src="previewImage" class="preview-image" />
          </div>
        </div>
      </div>

      <!-- Informações -->
      <div class="form-row">
        <div class="form-group">
          <label for="title">Título*</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            placeholder="Nome do evento"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="start_date">Data de Início*</label>
          <VueDatePicker
            v-model="form.start_date"
            :format="'yyyy-MM-dd, HH:mm'"
            id="start_date"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="end_date">Data de Término*</label>
          <VueDatePicker
            v-model="form.end_date"
            :format="'yyyy-MM-dd, HH:mm'"
            id="end_date"
            required
            class="form-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="description">Descrição</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          placeholder="Descreva seu evento..."
          class="form-textarea"
        ></textarea>
      </div>

      <!-- Localização -->
      <div class="form-group">
        <label>Localização do Evento</label>
        <LocationPicker
          v-model:location="form.location"
          :initial-latitude="latitude"
          :initial-longitude="longitude"
          @update:location="handleLocationUpdate"
        />
      </div>

      <!-- Ações -->
      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? "Salvando..." : "Salvar Evento" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import moment from "moment";
import LocationPicker from "@/components/LocationPicker.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
  components: { LocationPicker, VueDatePicker },
  props: {
    event: Object,
    loading: Boolean,
  },
  data() {
    return {
      form: {
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
        banner: null,
        ...this.event,
      },
      latitude: null,
      longitude: null,
      previewImage: null,
    };
  },
  computed: {
    isEditing() {
      return !!this.event;
    },
  },
  watch: {
    "form.start_date"(newVal) {
      if (newVal && this.form.end_date && this.form.end_date < newVal) {
        this.form.end_date = newVal;
      }
    },
  },
  mounted() {
    if (this.event?.banner_url) {
      this.previewImage = this.event.banner_url;
    }
    if (this.form.start_date) {
      this.form.start_date = moment(this.form.start_date).format(
        "YYYY-MM-DDTHH:mm"
      );
    }
    if (this.form.end_date) {
      this.form.end_date = moment(this.form.end_date).format(
        "YYYY-MM-DDTHH:mm"
      );
    }
    if (this.form.location) {
      this.geocodeLocation(this.form.location);
    }
  },
  methods: {
    async geocodeLocation(address) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`
        );
        const results = await response.json();

        if (results.length > 0) {
          this.latitude = parseFloat(results[0].lat);
          this.longitude = parseFloat(results[0].lon);
        }
      } catch (error) {
        console.error("Erro na geocodificação:", error);
      }
    },
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.banner = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    handleSubmit() {
      const startDate = moment(this.form.start_date).toISOString();
      const endDate = moment(this.form.end_date).toISOString();

      this.form.start_date = startDate;
      this.form.end_date = endDate;

      const payload = {
        ...this.form,
      };
      this.$emit("submit", payload);
    },
    handleCancel() {
      this.$emit("cancel");
      this.$router.push("/home");
    },
  },
};
</script>

<style scoped>
.flex {
  display: flex;
}

.event-form-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.event-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.event-form h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
  font-size: 1.8rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-input,
.form-textarea {
  width: -webkit-fill-available;
  padding: 1rem 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 0.7fr 0.7fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #3aa876;
}

.btn-primary:disabled {
  background-color: #a0d9bb;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-voltar {
  background-color: transparent;
  border-radius: 1rem 1rem 0px 0px;
}

.btn-voltar:hover {
  background-color: transparent;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .event-form {
    padding: 1.5rem;
  }
}

.image-upload-container {
  margin: 1rem 0;
}

.hidden-input {
  display: none;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #42b983;
  background-color: rgba(66, 185, 131, 0.05);
}

.upload-area i {
  font-size: 2rem;
  color: #42b983;
  margin-bottom: 1rem;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.map-container {
  position: relative;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.map-search-input {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  width: calc(100% - 20px);
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.map {
  height: 100%;
  width: 100%;
}
</style>

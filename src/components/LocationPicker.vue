<template>
  <div class="location-picker">
    <input
      type="text"
      v-model="searchQuery"
      @keyup.enter="searchLocation"
      placeholder="Pesquisar localização..."
      class="map-search-input"
    />
    <div ref="mapElement" class="map"></div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrige ícones do Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default {
  props: {
    latitude: Number,
    longitude: Number,
    location: String,
  },
  emits: ["update:latitude", "update:longitude", "update:location"],
  setup(props, { emit }) {
    const mapElement = ref(null);
    const searchQuery = ref(props.location || "");
    let map = null;
    let marker = null;

    const initMap = () => {
      const initialLat = props.latitude || -23.5505; // Padrão: São Paulo
      const initialLng = props.longitude || -46.6333;

      map = L.map(mapElement.value).setView([initialLat, initialLng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(
        map
      );

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        emit("update:latitude", position.lat);
        emit("update:longitude", position.lng);
        reverseGeocode(position.lat, position.lng);
      });

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        emit("update:latitude", lat);
        emit("update:longitude", lng);
        reverseGeocode(lat, lng);
      });

      // Obtém a localização atual do usuário
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Centraliza o mapa na localização atual
            map.setView([lat, lon], 13);
            marker.setLatLng([lat, lon]);

            emit("update:latitude", lat);
            emit("update:longitude", lon);
            reverseGeocode(lat, lon);
          },
          () => {
            console.warn("Geolocalização não permitida, utilizando fallback.");
            // Fallback para o centro do Brasil caso a geolocalização falhe
            const fallbackLat = -14.235; // Centro do Brasil
            const fallbackLng = -51.9253;
            map.setView([fallbackLat, fallbackLng], 13);
            marker.setLatLng([fallbackLat, fallbackLng]);

            emit("update:latitude", fallbackLat);
            emit("update:longitude", fallbackLng);
            reverseGeocode(fallbackLat, fallbackLng);
          }
        );
      } else {
        console.warn("Geolocalização não suportada, utilizando fallback.");
        // Fallback para o centro do Brasil
        const fallbackLat = -14.235;
        const fallbackLng = -51.9253;
        map.setView([fallbackLat, fallbackLng], 13);
        marker.setLatLng([fallbackLat, fallbackLng]);

        emit("update:latitude", fallbackLat);
        emit("update:longitude", fallbackLng);
        reverseGeocode(fallbackLat, fallbackLng);
      }
    };

    const reverseGeocode = async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        if (data.display_name) {
          // Filtra as partes relevantes do endereço
          const addressParts = data.address;

          // Obtém as informações de interesse
          const street = addressParts.road || "";
          const houseNumber = addressParts.house_number || ""; // Número da casa
          const neighborhood =
            addressParts.neighbourhood || addressParts.suburb || "";
          const city =
            addressParts.city ||
            addressParts.town ||
            addressParts.village ||
            "";
          const state = addressParts.state || "";
          const country = addressParts.country || "";
          const postcode = addressParts.postcode || "";

          // Construa o endereço com vírgulas condicionais
          let formattedAddress = "";

          if (street) {
            formattedAddress += street;
          }

          if (houseNumber) {
            formattedAddress += `, ${houseNumber}`;
          }

          if (neighborhood) {
            formattedAddress += ` - ${neighborhood}`;
          }

          if (postcode) {
            formattedAddress += `, ${postcode}`;
          }

          if (city) {
            formattedAddress += `, ${city}`;
          }

          if (state) {
            formattedAddress += ` - ${state}`;
          }

          if (country) {
            formattedAddress += `, ${country}`;
          }

          // Atualiza a localização no componente
          emit("update:location", formattedAddress);
          searchQuery.value = formattedAddress;
        }
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
      }
    };

    const searchLocation = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery.value
          )}`
        );
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const latNum = parseFloat(lat);
          const lonNum = parseFloat(lon);
          marker.setLatLng([latNum, lonNum]);
          map.setView([latNum, lonNum], 13);
          emit("update:latitude", latNum);
          emit("update:longitude", lonNum);
          emit("update:location", display_name);
        }
      } catch (error) {
        console.error("Erro ao buscar localização:", error);
      }
    };

    onMounted(async () => {
      await nextTick();
      initMap();
    });

    watch(
      () => props.location,
      (newVal) => {
        searchQuery.value = newVal;
      }
    );

    return {
      mapElement,
      searchQuery,
      searchLocation,
    };
  },
};
</script>

<style scoped>
.map {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}

.map-search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}
</style>

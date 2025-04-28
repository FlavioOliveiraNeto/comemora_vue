<template>
  <div class="share-modal">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
      <h3>Compartilhar Evento</h3>

      <div class="share-section">
        <h4>Link de Convite:</h4>
        <div class="link-container">
          <input :value="inviteLink" ref="inviteInput" readonly />
          <button @click="copyLink" class="btn-copy">
            <i class="fas fa-copy"></i> Copiar
          </button>
        </div>
      </div>

      <div class="share-section">
        <h4>Compartilhar em:</h4>
        <div class="social-buttons">
          <share-network
            v-for="network in socialList"
            :key="network"
            v-slot="{ share }"
            :network="network"
            :url="inviteLink"
            :title="`Venha participar do evento: ${event.title}!`"
            :description="`Fique à vontade para acessar o link do meu evento! 👉 ${inviteLink}`"
          >
            <i class="fab fah fa-lg" :class="`fa-${network}`" @click="share">
              <span> {{ network.toUpperCase() }}</span>
            </i>
          </share-network>
        </div>
      </div>

      <div class="share-section">
        <h4>QR Code:</h4>
        <div class="qrcode-container">
          <qrcode-vue :value="inviteLink" :size="200" level="H" />
          <button @click="printQRCode" class="btn-print">
            <i class="fas fa-print"></i> Imprimir QR Code
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import QrcodeVue from "qrcode.vue";
import { ShareNetwork } from "vue3-social-sharing";
import notifications from "../../utils/notifications_helper";
import { useStore } from "vuex";

export default {
  components: { QrcodeVue, ShareNetwork },
  props: {
    event: {
      type: Object,
      required: true,
    },
    inviteLink: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  setup(props) {
    const store = useStore();
    const inviteInput = ref(null);
    const socialList = ["facebook", "twitter", "whatsapp"];

    const copyLink = () => {
      inviteInput.value.select();
      document.execCommand("copy");
      notifications.success(
        store,
        "Link copiado para a área de transferência!"
      );
    };

    const printQRCode = () => {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${props.event.title}</title>
              <style>
                body { font-family: Arial; text-align: center; padding: 20px; }
                h1 { color: #333; }
                img { max-width: 300px; margin: 20px auto; display: block; }
              </style>
            </head>
            <body>
              <h1>${props.event.title}</h1>
              <p>Use este QR Code para acessar o evento</p>
              <img src="${
                props.event.banner_url
              }" alt="Banner do Evento" style="max-height: 150px;">
              <img src="${document
                .querySelector(".qrcode-container canvas")
                .toDataURL("image/png")}" alt="QR Code">
              <p>Ou acesse: ${props.inviteLink}</p>
            </body>
          </html>
        `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

    return {
      inviteInput,
      copyLink,
      printQRCode,
      socialList,
    };
  },
};
</script>

<style scoped>
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  cursor: pointer;
  color: #666;
}

.close:hover {
  color: #333;
}

.share-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.share-section:last-child {
  border-bottom: none;
}

.link-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.link-container input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.btn-copy {
  background: #42b983;
  color: white;
  border: none;
  padding: 0 15px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-copy:hover {
  background: #3aa876;
}

.social-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.social-btn {
  flex: 1;
  min-width: 120px;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

.social-btn i {
  font-size: 18px;
}

.facebook {
  background: #3b5998;
}
.twitter {
  background: #1da1f2;
}
.whatsapp {
  background: #25d366;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
}

.btn-print {
  background: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  .social-buttons {
    flex-direction: column;
  }
}
</style>

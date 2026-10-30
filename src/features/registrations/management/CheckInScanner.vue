<script setup>
import jsQR from 'jsqr'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { registrationNumberFromQr } from '../lib/checkInQr.js'

const emit = defineEmits(['detected', 'close'])

const video = ref(null)
const scanning = ref(false)
const message = ref('Starting camera...')
let stream = null
let frame = 0
let disposed = false
const canvas = document.createElement('canvas')
const context = canvas.getContext('2d', { willReadFrequently: true })

function stopCamera() {
  cancelAnimationFrame(frame)
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  scanning.value = false
}

// Decodes one video frame per animation frame until a ticket QR is found.
function scanFrame() {
  const element = video.value
  if (element && element.readyState >= element.HAVE_ENOUGH_DATA && element.videoWidth) {
    canvas.width = element.videoWidth
    canvas.height = element.videoHeight
    context.drawImage(element, 0, 0, canvas.width, canvas.height)
    const image = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })
    const registrationNumber = code && registrationNumberFromQr(code.data)
    if (registrationNumber) {
      stopCamera()
      emit('detected', registrationNumber)
      return
    }
    if (code) message.value = 'This QR code is not an Eventsss ticket.'
  }
  frame = requestAnimationFrame(scanFrame)
}

onMounted(async () => {
  // Browsers only expose the camera on HTTPS or localhost.
  if (!navigator.mediaDevices?.getUserMedia) {
    message.value = 'Camera access needs HTTPS. Type the registration number instead.'
    return
  }
  try {
    const acquired = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    if (disposed) {
      acquired.getTracks().forEach((track) => track.stop())
      return
    }
    stream = acquired
    video.value.srcObject = stream
    await video.value.play()
    scanning.value = true
    message.value = 'Point the camera at the ticket QR code.'
    scanFrame()
  } catch (cause) {
    stopCamera()
    message.value = cause?.name === 'NotAllowedError'
      ? 'Camera permission was denied. Allow it in the browser, or type the registration number instead.'
      : 'No camera is available. Type the registration number instead.'
  }
})

onBeforeUnmount(() => {
  disposed = true
  stopCamera()
})
</script>

<template>
  <div class="scanner-backdrop" @click.self="emit('close')">
    <section class="scanner-dialog" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
      <h2 id="scanner-title">Scan ticket QR code</h2>
      <div class="scanner-frame">
        <video ref="video" muted playsinline aria-label="Camera preview" />
        <span v-if="scanning" class="scanner-target" aria-hidden="true" />
      </div>
      <p class="scanner-message" role="status">{{ message }}</p>
      <button class="console-btn console-btn-secondary" type="button" @click="emit('close')">Close</button>
    </section>
  </div>
</template>

<style scoped>
.scanner-backdrop {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgb(24 24 27 / 60%);
}

.scanner-dialog {
  display: grid;
  width: min(100%, 420px);
  padding: 20px;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 28px 80px rgb(24 24 27 / 32%);
}

.scanner-dialog h2 {
  margin: 0;
  font-size: 1.1rem;
}

.scanner-frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
  background: #111827;
  border-radius: 8px;
}

.scanner-frame video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-target {
  position: absolute;
  inset: 18%;
  border: 3px solid rgb(255 255 255 / 85%);
  border-radius: 12px;
}

.scanner-message {
  margin: 0;
  color: #4b5563;
  font-size: .8rem;
  text-align: center;
}
</style>

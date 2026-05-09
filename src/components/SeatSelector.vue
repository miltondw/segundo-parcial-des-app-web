<template>
  <div class="seat-selector-modal">
    <div class="card p-3">
      <h5>Selecciona asientos - {{ showtimeDisplay }}</h5>
      <p class="small text-muted">Click para seleccionar; los asientos en rojo están ocupados.</p>
      <div class="d-flex flex-column align-items-center">
        <div v-for="r in rows" :key="r" class="d-flex gap-2 mb-2">
          <button
            v-for="c in cols"
            :key="c"
            type="button"
            class="btn"
            :class="seatClass(r, c)"
            @click="toggleSeat(r, c)"
          >
            {{ r }}-{{ c }}
          </button>
        </div>
      </div>
      <div class="mt-3 d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-primary" @click="confirm">Confirmar compra ({{ selected.length }})</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ occupied: Array, showtime: Object })
const emit = defineEmits(['close', 'confirm'])

// showtime puede ser un objeto { id, time, price, availableSeats } o string
const showtimeDisplay = computed(() => {
  if (typeof props.showtime === 'object' && props.showtime?.time) return props.showtime.time
  return props.showtime || 'No horario'
})

const rows = [1,2,3,4,5]
const cols = [1,2,3,4,5,6,7,8]
const selected = ref([])

function seatKey(r,c){ return `${r}-${c}` }

function isOccupied(r,c){
  return (occupied || []).includes(seatKey(r,c))
}

function seatClass(r,c){
  const k = seatKey(r,c)
  if (isOccupied(r,c)) return 'btn-danger disabled'
  if (selected.value.includes(k)) return 'btn-primary'
  return 'btn-outline-light'
}

function toggleSeat(r,c){
  const k = seatKey(r,c)
  if (isOccupied(r,c)) return
  const i = selected.value.indexOf(k)
  if (i === -1) selected.value.push(k)
  else selected.value.splice(i,1)
}

function confirm(){
  emit('confirm', selected.value.slice())
}
</script>

<style scoped>
.seat-selector-modal .btn { min-width: 48px }
.btn-outline-light { background: rgba(255,255,255,0.03); color: #fff; border: 1px solid rgba(255,255,255,0.08) }
.btn-primary { background: linear-gradient(135deg,#ffd29b,#ff9a3e); border: none }
.btn-danger { background: rgba(255,100,100,0.9); color: #fff }
</style>

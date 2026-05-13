<template>
  <div class="seat-row d-flex flex-wrap gap-2 justify-content-center my-1">
    <div v-for="seatNum in 12" :key="`${rowLetter}-${seatNum}`" class="seat-item">
      <button
        :class="[
          'btn btn-sm seat-btn',
          {
            'btn-outline-secondary': !isSeatOccupied(seatNum) && !isSelected(seatNum),
            'btn-primary': isSelected(seatNum),
            'btn-danger': isSeatOccupied(seatNum)
          }
        ]"
        :disabled="isSeatOccupied(seatNum)"
        @click="toggleSeat(seatNum)"
        :title="`${rowLetter}-${seatNum}`"
      >
        {{ seatNum }}
      </button>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  rowLetter: {
    type: String,
    required: true,
    validator: (v) => /^[A-H]$/.test(v)
  },
  occupiedSeats: {
    type: Array,
    default: () => []
  },
  selectedSeats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle-seat'])

const isSeatOccupied = (seatNum) => {
  return props.occupiedSeats.some(s => s === `${props.rowLetter}-${seatNum}`)
}

const isSelected = (seatNum) => {
  return props.selectedSeats.some(s => s === `${props.rowLetter}-${seatNum}`)
}

const toggleSeat = (seatNum) => {
  const seat = `${props.rowLetter}-${seatNum}`
  emit('toggle-seat', seat)
}
</script>

<style scoped>
.seat-btn {
  min-width: 2.5rem;
  min-height: 2.5rem;
  padding: 0;
  font-weight: 600;
}

.seat-btn.btn-outline-secondary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.seat-btn.btn-danger:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
</style>

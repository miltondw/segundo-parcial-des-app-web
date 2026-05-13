<template>
  <Modal 
    :isOpen="true"
    title="Seleccionar Puestos"
    @close="handleCancel"
  >
    <div class="d-grid gap-3">
      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <div class="legend-item d-flex align-items-center gap-2">
          <div class="legend-seat seat-available"></div>
          <Text size="sm">Disponible</Text>
        </div>
        <div class="legend-item d-flex align-items-center gap-2">
          <div class="legend-seat seat-selected"></div>
          <Text size="sm">Seleccionado</Text>
        </div>
        <div class="legend-item d-flex align-items-center gap-2">
          <div class="legend-seat seat-occupied"></div>
          <Text size="sm">Ocupado</Text>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-borderless align-middle mb-0 seat-table">
          <thead>
            <tr>
              <th scope="col" class="text-center text-muted small">Fila</th>
              <th v-for="row in rows" :key="row" scope="col" class="text-center text-muted small">
                {{ row }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="`row-${row}`">
              <th scope="row" class="text-center text-muted small">{{ row }}</th>
              <td>
                <SeatRow
                  :rowLetter="row"
                  :occupiedSeats="occupiedSeats"
                  :selectedSeats="selectedSeats"
                  @toggle-seat="handleToggleSeat"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card border-primary">
        <div class="card-body text-center">
          <Text tag="h6" bold class="mb-2">
            Total: <span class="text-success">{{ formatPrice(totalPrice) }}</span>
          </Text>
          <Text size="sm" muted>{{ selectedSeats.length }} de máximo 6 puestos seleccionados</Text>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button 
        variant="secondary"
        @click="handleCancel"
      >
        Cancelar
      </Button>
      <Button 
        variant="primary"
        :disabled="selectedSeats.length === 0 || selectedSeats.length > 6"
        @click="handleConfirm"
      >
        Confirmar ({{ selectedSeats.length }})
      </Button>
    </template>
  </Modal>
</template>

<script setup>
import { computed, defineEmits } from 'vue'
import Modal from '@/components/organisms/Modal.vue'
import SeatRow from '@/components/molecules/SeatRow.vue'
import Text from '@/components/atoms/Text.vue'
import Button from '@/components/atoms/Button.vue'
import { formatMoney } from '@/utils/time'

const props = defineProps({
  occupiedSeats: {
    type: Array,
    default: () => []
  },
  selectedSeats: {
    type: Array,
    default: () => []
  },
  pricePerSeat: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-seat', 'confirm', 'cancel'])

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const totalPrice = computed(() => {
  return props.selectedSeats.length * props.pricePerSeat
})

const formatPrice = (price) => formatMoney(price)

const handleToggleSeat = (seat) => {
  emit('toggle-seat', seat)
}

const handleConfirm = () => {
  emit('confirm', props.selectedSeats)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.legend-seat {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid #d1d5db;
}

.legend-seat.seat-available {
  background: white;
}

.legend-seat.seat-selected {
  background: #2c3e50;
  border-color: #2c3e50;
}

.legend-seat.seat-occupied {
  background: #9ca3af;
  border-color: #6b7280;
}

.seat-table {
  min-width: 760px;
}

@media (max-width: 768px) {
  .seat-table {
    min-width: 620px;
  }
}
</style>

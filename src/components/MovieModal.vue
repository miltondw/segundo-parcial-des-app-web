<template>
  <div class="modal-backdrop d-flex justify-content-center align-items-center">
    <div class="card p-3" style="max-width:720px; width:100%">
      <div class="d-flex">
        <img :src="movie.image" alt="" style="width:180px; height:110px; object-fit:cover;" class="me-3" />
        <div class="flex-grow-1">
          <h4>{{ movie.title }}</h4>
          <p class="small text-muted">{{ movie.genre }} • {{ movie.runtime }} min • {{ movie.rating }}</p>
          <p class="small">{{ movie.description }}</p>
          <div class="mt-2">
            <p class="mb-1 small text-muted">Selecciona un horario:</p>
            <div class="d-flex flex-wrap gap-2">
              <button v-for="t in movie.showtimes" :key="t.id" class="btn btn-warning btn-sm" @click="$emit('select-showtime', t)">{{ t.time }} - ${{ t.price }}</button>
            </div>
          </div>
        </div>
        <div>
          <button class="btn-close" @click="$emit('close')"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ movie: Object })
defineEmits(['close', 'select-showtime'])
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1200; padding:24px }
.card { border-radius: 12px; background: #f8f9fa }
.btn-warning { background-color: #ffc107; color: #000; border: none; font-weight: 500 }
.btn-warning:hover { background-color: #e0a800 }
</style>

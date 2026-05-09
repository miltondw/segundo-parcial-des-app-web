<template>
  <div>
    <h2>Reservas (administrador)</h2>
    <p class="text-muted small">Listado de todas las reservas registradas</p>
    <table class="table mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Película</th>
          <th>Usuario</th>
          <th>Showtime</th>
          <th>Asientos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in reservations" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.movieTitle }}</td>
          <td>{{ r.user.name }} ({{ r.user.username }})</td>
          <td>{{ r.showtime }}</td>
          <td>{{ r.seats.join(', ') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/apiService'

const reservations = ref([])
onMounted(async ()=>{ reservations.value = await api.getReservations() })
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2>Peliculas / Productos</h2>
        <p class="text-muted small">CRUD simulado con LocalStorage (seed desde products.json)</p>
      </div>
      <div v-if="role === 'admin'">
        <button class="btn btn-success" @click="openCreate">+ Nuevo</button>
      </div>
    </div>

    <div class="row row-cols-1 row-cols-md-2 g-3">
      <div v-for="p in products" :key="p.id" class="col">
        <div class="card h-100">
          <div class="row g-0">
            <div class="col-4">
              <img :src="p.image" class="img-fluid rounded-start" alt="" />
            </div>
            <div class="col-8">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">{{ p.title }}</h5>
                <p class="card-text text-muted small">{{ p.genre }} • ${{ p.price }}</p>
                <p class="card-text small">{{ p.description }}</p>
                <div class="mt-auto d-flex gap-2 align-items-center">
                  <template v-if="role === 'admin'">
                    <button class="btn btn-sm btn-primary" @click="startEdit(p)">Editar</button>
                    <button class="btn btn-sm btn-danger" @click="remove(p.id)">Eliminar</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="viewReservations(p)">Ver reservas</button>
                  </template>
                  <template v-else>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-primary" @click="openMovieModal(p)">Ver y seleccionar</button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <MovieModal v-if="showMovieModal" :movie="modalMovie" @close="closeMovieModal" @select-showtime="onModalSelectShowtime" />
    <SeatSelector v-if="showSeatSelector" :occupied="occupiedSeats" :showtime="currentShowtime" @close="closeSeatSelector" @confirm="confirmSeats" />

    <div v-if="showReservations" class="card p-3 mt-3">
      <h5>Reservas para {{ reservationsForMovie?.title }}</h5>
      <ul class="list-group">
        <li v-for="r in reservations" :key="r.id" class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ r.user.name }}</strong> - {{ r.showtime }} - {{ r.seats.join(', ') }}
          </div>
          <div class="text-muted small">ID: {{ r.id }}</div>
        </li>
      </ul>
      <div class="mt-2 text-end"><button class="btn btn-secondary btn-sm" @click="showReservations=false">Cerrar</button></div>
    </div>

    <div v-if="role === 'admin' && showForm" class="card p-3 mt-3">
      <h5>{{ editId ? 'Editar' : 'Crear' }} pelicula</h5>
      <form @submit.prevent="save">
        <div class="row g-2">
          <div class="col-md-6">
            <input v-model="form.title" class="form-control" placeholder="Titulo" required />
          </div>
          <div class="col-md-3">
            <input v-model="form.genre" class="form-control" placeholder="Genero" required />
          </div>
          <div class="col-md-3">
            <input v-model.number="form.price" class="form-control" placeholder="Precio" required />
          </div>
        </div>
        <div class="row g-2 mt-2">
          <div class="col-md-3">
            <input v-model.number="form.stock" class="form-control" placeholder="Stock" required />
          </div>
          <div class="col-md-9">
            <input v-model="form.image" class="form-control" placeholder="URL imagen" />
          </div>
        </div>
        <div class="mt-3">
          <button class="btn btn-primary me-2">Guardar</button>
          <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/apiService'
import SeatSelector from '../components/SeatSelector.vue'
import MovieModal from '../components/MovieModal.vue'

const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null')
const role = currentUser?.role || 'client'

const products = ref([])
const showForm = ref(false)
const editId = ref(null)
const form = ref({ title: '', genre: '', price: 0, stock: 0, image: '', description: '' })
const showSeatSelector = ref(false)
const currentMovie = ref(null)
const currentShowtime = ref('')
const occupiedSeats = ref([])
const reservations = ref([])
const reservationsForMovie = ref(null)
const showReservations = ref(false)
// role already read above

const showMovieModal = ref(false)
const modalMovie = ref(null)

async function load() {
  products.value = await api.getProducts()
}

onMounted(load)

function openCreate() {
  editId.value = null
  form.value = { title: '', genre: '', price: 0, stock: 0, image: '', description: '' }
  showForm.value = true
}

function startEdit(p) {
  editId.value = p.id
  form.value = { ...p }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function save() {
  if (editId.value) {
    await api.updateProduct(editId.value, form.value)
  } else {
    await api.createProduct(form.value)
  }
  showForm.value = false
  await load()
}

async function remove(id) {
  if (!confirm('Eliminar este producto?')) return
  await api.deleteProduct(id)
  await load()
}

function openSeatSelector(movie, showtime){
  currentMovie.value = movie
  currentShowtime.value = showtime
  // calcular asientos ocupados desde reservas (comparar con la hora del showtime)
  const showtimeHour = typeof showtime === 'object' ? showtime.time : showtime
  api.getReservationsByMovie(movie.id).then((list)=>{
    const occ = list.filter(r=>r.showtime===showtimeHour).flatMap(r=>r.seats)
    occupiedSeats.value = occ
    showSeatSelector.value = true
  })
}

function openMovieModal(movie){
  modalMovie.value = movie
  showMovieModal.value = true
}

function closeMovieModal(){ showMovieModal.value = false }

function onModalSelectShowtime(time){
  if(!modalMovie.value) return
  openSeatSelector(modalMovie.value, time)
  showMovieModal.value = false
}

function closeSeatSelector(){ showSeatSelector.value = false }

async function confirmSeats(selected){
  const user = JSON.parse(localStorage.getItem('current_user'))
  if (!user) { alert('Debe iniciar sesion'); return }
  const showtimeStr = typeof currentShowtime.value === 'object' ? currentShowtime.value.time : currentShowtime.value
  const res = await api.createReservation({ movieId: currentMovie.value.id, movieTitle: currentMovie.value.title, showtime: showtimeStr, seats: selected, user: user })
  showSeatSelector.value = false
  alert('Compra registrada: ' + res.id)
}

async function viewReservations(movie){
  reservationsForMovie.value = movie
  reservations.value = await api.getReservationsByMovie(movie.id)
  showReservations.value = true
}
// REMOVED: export default { }
</script>
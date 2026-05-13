<template>
  <div class="container-fluid px-0">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 class="h3 mb-1">Películas</h2>
        <p class="text-muted mb-0">Administra cartelera, horarios, precios y reservas.</p>
      </div>
      <div v-if="role === 'admin'">
        <button class="btn btn-success" @click="openCreate">+ Nueva película</button>
      </div>
    </div>

    <div class="row row-cols-1 row-cols-xl-2 g-4">
      <div v-for="movie in products" :key="movie.id" class="col">
        <div class="card h-100 shadow-sm">
          <div class="row g-0 h-100">
            <div class="col-md-4">
              <img :src="movie.image" class="img-fluid h-100 w-100 object-fit-cover rounded-start" :alt="movie.title" />
            </div>
            <div class="col-md-8">
              <div class="card-body d-flex flex-column h-100">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <h5 class="card-title mb-1">{{ movie.title }}</h5>
                    <p class="text-muted small mb-2">{{ movie.genre }} • {{ movie.duration }} min • {{ movie.rating }}</p>
                  </div>
                  <span class="badge text-bg-dark">Desde {{ formatMoney(movieBasePrice(movie)) }}</span>
                </div>

                <p class="card-text text-muted small mb-3">{{ movie.description }}</p>

                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span v-for="showtime in movie.showtimes" :key="showtime.id" class="badge text-bg-secondary">
                    {{ formatShowtime(showtime.time) }} - {{ formatMoney(showtime.price) }}
                  </span>
                </div>

                <div class="mt-auto d-flex flex-wrap gap-2">
                  <template v-if="role === 'admin'">
                    <button class="btn btn-primary btn-sm" @click="startEdit(movie)">Editar</button>
                    <button class="btn btn-outline-danger btn-sm" @click="askDelete(movie)">Eliminar</button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" @click="viewReservations(movie)">
                      Ver reservas
                    </button>
                  </template>
                  <template v-else>
                    <button class="btn btn-primary btn-sm" @click="openMovieModal(movie)">Seleccionar función</button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <Modal
        v-if="showMovieModal"
        :isOpen="showMovieModal"
        :title="modalMovie?.title ? `Seleccionar función - ${modalMovie.title}` : 'Seleccionar función'"
        @close="closeMovieModal"
      >
        <div v-if="modalMovie" class="row g-4 align-items-start">
          <div class="col-12 col-md-5">
            <img
              :src="modalMovie.image"
              :alt="modalMovie.title"
              class="img-fluid rounded-3 shadow-sm w-100"
            />
          </div>

          <div class="col-12 col-md-7">
            <div class="d-flex flex-wrap gap-2 mb-3">
              <span class="badge text-bg-dark">{{ modalMovie.genre }}</span>
              <span class="badge text-bg-secondary">{{ modalMovie.duration }} min</span>
              <span class="badge text-bg-info">{{ modalMovie.rating }}</span>
            </div>

            <p class="text-muted mb-3">{{ modalMovie.description }}</p>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <span
                v-for="showtime in modalMovie.showtimes"
                :key="showtime.id"
                class="badge text-bg-light text-dark border"
              >
                {{ formatShowtime(showtime.time) }} - {{ formatMoney(showtime.price) }}
              </span>
            </div>

            <div class="alert alert-primary mb-0">
              Selecciona un horario para continuar con la selección de puestos.
            </div>
          </div>
        </div>

        <template #footer>
          <div class="d-flex flex-wrap gap-2 justify-content-end w-100">
            <button
              v-for="showtime in modalMovie?.showtimes || []"
              :key="showtime.id"
              type="button"
              class="btn btn-primary"
              @click="onModalSelectShowtime(showtime)"
            >
              {{ formatShowtime(showtime.time) }}
            </button>
            <button type="button" class="btn btn-secondary" @click="closeMovieModal">
              Cancelar
            </button>
          </div>
        </template>
      </Modal>

    <SeatSelector 
      v-if="showSeatSelector" 
      :occupiedSeats="occupiedSeats" 
      :selectedSeats="selectedSeats"
      :pricePerSeat="currentShowtime?.price || 0"
      @toggle-seat="handleToggleSeat"
      @confirm="confirmSeats"
      @cancel="closeSeatSelector"
    />

    <SuccessModal 
      v-if="showSuccessModal"
      :isOpen="showSuccessModal"
      :reservationId="lastReservationId"
      :seatCount="lastReservationSeatCount"
      :totalPrice="formatMoney(lastReservationTotalPrice)"
      @close="closeSuccessModal"
    />

    <FormModal
      v-if="showForm"
      :isOpen="showForm"
      :title="editId ? 'Editar película' : 'Nueva película'"
      submitText="Guardar película"
      @close="closeForm"
      @submit="saveMovie(movieForm)"
    >
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label fw-semibold">Título</label>
          <input v-model="movieForm.title" class="form-control" type="text" required />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label fw-semibold">Género</label>
          <input v-model="movieForm.genre" class="form-control" type="text" required />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label fw-semibold">Duración (min)</label>
          <input v-model.number="movieForm.duration" class="form-control" type="number" min="1" required />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label fw-semibold">Clasificación</label>
          <input v-model="movieForm.rating" class="form-control" type="text" placeholder="PG-13" required />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label fw-semibold">Imagen URL</label>
          <input v-model="movieForm.image" class="form-control" type="url" required />
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Descripción</label>
          <textarea v-model="movieForm.description" class="form-control" rows="3" required></textarea>
        </div>
      </div>

      <div class="border rounded-3 p-3 bg-light">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 class="mb-0">Horarios</h6>
          <button type="button" class="btn btn-outline-primary btn-sm" @click="addShowtime">+ Agregar horario</button>
        </div>

        <div v-if="movieForm.showtimes.length === 0" class="alert alert-warning mb-0">
          Agrega al menos un horario para guardar la película.
        </div>

        <div v-for="(showtime, index) in movieForm.showtimes" :key="showtime.id" class="row g-2 align-items-end mb-3">
          <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Hora</label>
            <input v-model="showtime.time" class="form-control" type="text" placeholder="19:00 o 7:00pm" required />
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Precio COP</label>
            <input v-model.number="showtime.price" class="form-control" type="number" min="0" required />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label small text-muted">Puestos</label>
            <input v-model.number="showtime.availableSeats" class="form-control" type="number" min="1" required />
          </div>
          <div class="col-12 col-md-1 d-grid">
            <button type="button" class="btn btn-outline-danger" @click="removeShowtime(index)">×</button>
          </div>
        </div>
      </div>
    </FormModal>

    <ConfirmDialog 
      v-if="showDeleteModal" 
      :isOpen="showDeleteModal" 
      :message="`¿Eliminar ${deleteTarget?.title}? Esta acción no se puede deshacer.`" 
      confirmText="Eliminar" 
      confirmVariant="danger" 
      @confirm="confirmDelete" 
      @cancel="closeDeleteModal" 
    />

    <Modal
      v-if="showReservations"
      :isOpen="showReservations"
      :title="`Reservas de ${reservationsForMovie?.title || 'película'}`"
      @close="closeReservations"
    >
      <div class="d-grid gap-3">
        <p class="text-muted mb-0">Separadas por horario</p>

        <div v-if="groupedReservations.length === 0" class="alert alert-info mb-0">
          Todavía no hay reservas para esta película.
        </div>

        <div v-for="group in groupedReservations" :key="group.showtime" class="border rounded-3 p-3 bg-light">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h6 class="mb-0">Horario {{ group.showtime }}</h6>
            <span class="badge text-bg-secondary">{{ group.items.length }} reservas</span>
          </div>
          <div class="list-group">
            <div v-for="reservation in group.items" :key="reservation.id" class="list-group-item">
              <div class="d-flex justify-content-between gap-3 flex-wrap">
                <div>
                  <strong>{{ reservation.user.name }}</strong>
                  <div class="text-muted small">{{ reservation.user.username }}</div>
                </div>
                <div class="text-end">
                  <div class="fw-semibold">{{ reservation.seats.join(', ') }}</div>
                  <div class="text-muted small">{{ reservation.seats.length }} puestos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn btn-secondary" @click="closeReservations">Cerrar</button>
      </template>
    </Modal>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from 'vue'
import api from '../services/apiService'
import { Modal, SeatSelector, FormModal, ConfirmDialog, SuccessModal } from '@/components'
import { formatShowtime, formatMoney } from '../utils/time'

function createEmptyMovie() {
  return {
    title: '',
    genre: '',
    duration: 0,
    rating: '',
    image: '',
    description: '',
    showtimes: [],
  }
}

const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null')
const role = currentUser?.role || 'client'

const products = ref([])
const showForm = ref(false)
const editId = ref(null)
const editingMovie = ref(createEmptyMovie())
const movieForm = editingMovie
const showSeatSelector = ref(false)
const currentMovie = ref(null)
const currentShowtime = ref('')
const occupiedSeats = ref([])
const selectedSeats = ref([])
const reservations = ref([])
const reservationsForMovie = ref(null)
const showReservations = ref(false)
const showSuccessModal = ref(false)
const lastReservationId = ref(null)
const lastReservationSeatCount = ref(0)
const lastReservationTotalPrice = ref(0)

const showMovieModal = ref(false)
const modalMovie = ref(null)
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

async function load() {
  products.value = await api.getProducts()
}

onMounted(load)

function openCreate() {
  editId.value = null
  editingMovie.value = createEmptyMovie()
  showForm.value = true
}

function startEdit(p) {
  editId.value = p.id
  editingMovie.value = {
    title: p.title || '',
    genre: p.genre || '',
    duration: Number(p.duration || 0),
    rating: p.rating || '',
    image: p.image || '',
    description: p.description || '',
    showtimes: Array.isArray(p.showtimes)
      ? p.showtimes.map((showtime) => ({
          id: showtime.id ?? Date.now(),
          time: showtime.time || '',
          price: Number(showtime.price || 0),
          availableSeats: Number(showtime.availableSeats || 0),
        }))
      : [],
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

function addShowtime() {
  editingMovie.value.showtimes.push({
    id: Date.now() + Math.random(),
    time: '',
    price: 0,
    availableSeats: 1,
  })
}

function removeShowtime(index) {
  editingMovie.value.showtimes.splice(index, 1)
}

function normalizeMovie(movie) {
  const showtimes = Array.isArray(movie?.showtimes) ? movie.showtimes : []

  return {
    ...movie,
    duration: Number(movie.duration || 0),
    showtimes: showtimes.map((showtime, index) => ({
      id: showtime.id ?? Date.now() + index,
      time: showtime.time || '',
      price: Number(showtime.price || 0),
      availableSeats: Number(showtime.availableSeats || 0),
    })),
  }
}

async function saveMovie(movie) {
  const payload = normalizeMovie(movie)
  if (editId.value) {
    await api.updateProduct(editId.value, payload)
  } else {
    await api.createProduct(payload)
  }
  showForm.value = false
  await load()
}

function askDelete(movie) {
  deleteTarget.value = movie
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTarget.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  await api.deleteProduct(deleteTarget.value.id)
  closeDeleteModal()
  await load()
}

function handleToggleSeat(seat) {
  const index = selectedSeats.value.indexOf(seat)
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
  } else {
    if (selectedSeats.value.length < 6) {
      selectedSeats.value.push(seat)
    }
  }
}

function closeSeatSelector() {
  showSeatSelector.value = false
  selectedSeats.value = []
}

function closeSuccessModal() {
  showSuccessModal.value = false
  lastReservationSeatCount.value = 0
  lastReservationTotalPrice.value = 0
  selectedSeats.value = []
}

function openSeatSelector(movie, showtime){
  currentMovie.value = movie
  currentShowtime.value = showtime
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

async function confirmSeats(selected){
  const user = JSON.parse(localStorage.getItem('current_user'))
  if (!user) { alert('Debe iniciar sesión'); return }
  
  // Max 6 seats validation
  if (selected.length > 6) {
    alert('No puedes seleccionar más de 6 puestos');
    return
  }
  
  if (selected.length === 0) {
    alert('Debes seleccionar al menos 1 puesto');
    return
  }
  
  const showtimeStr = typeof currentShowtime.value === 'object' ? currentShowtime.value.time : currentShowtime.value
  const showtimePrice = currentShowtime.value?.price ?? 0
  const totalPrice = selected.length * showtimePrice
  
  const res = await api.createReservation({
    movieId: currentMovie.value.id,
    movieTitle: currentMovie.value.title,
    showtime: showtimeStr,
    showtimePrice: showtimePrice,
    seats: selected,
    user,
  })
  
  lastReservationId.value = res.id
  lastReservationSeatCount.value = selected.length
  lastReservationTotalPrice.value = totalPrice
  showSeatSelector.value = false
  showSuccessModal.value = true
  selectedSeats.value = []
}

async function viewReservations(movie){
  reservationsForMovie.value = movie
  reservations.value = await api.getReservationsByMovie(movie.id)
  showReservations.value = true
}

function closeReservations() {
  showReservations.value = false
  reservationsForMovie.value = null
  reservations.value = []
}

function movieBasePrice(movie) {
  const prices = (movie.showtimes || []).map((showtime) => Number(showtime.price || 0)).filter((price) => price > 0)
  if (prices.length === 0) return '0'
  return Math.min(...prices)
}

const groupedReservations = computed(() => {
  const groups = new Map()

  for (const reservation of reservations.value) {
    const key = reservation.showtime || 'Sin horario'
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(reservation)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([showtime, items]) => ({ showtime, items }))
})
</script>
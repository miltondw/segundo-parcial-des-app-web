<script setup>
import { computed, ref } from 'vue'

const genres = ['Todos', 'Accion', 'Animacion', 'Drama', 'Terror', 'Ciencia ficcion']

const movies = [
  {
    id: 1,
    title: 'Luz de Medianoche',
    genre: 'Drama',
    format: 'Sala XL',
    runtime: 132,
    rating: '12+',
    synopsis:
      'Una pianista regresa a la ciudad donde comenzo todo para enfrentar una promesa pendiente y una ultima funcion.',
    room: 'Sala 3',
    showtimes: ['16:10', '18:40', '21:20'],
    accent: 'gold',
  },
  {
    id: 2,
    title: 'Nebula Run',
    genre: 'Ciencia ficcion',
    format: 'IMAX',
    runtime: 145,
    rating: 'PG-13',
    synopsis:
      'Un equipo de pilotos navega una frontera orbital donde cada salto puede cambiar la historia de la galaxia.',
    room: 'Sala IMAX',
    showtimes: ['17:00', '19:35', '22:15'],
    accent: 'cyan',
  },
  {
    id: 3,
    title: 'Risas en 8 Bits',
    genre: 'Animacion',
    format: '4DX',
    runtime: 98,
    rating: 'All ages',
    synopsis:
      'Dos hermanos convierten un viejo arcade en la llave para salvar su barrio de un empresario implacable.',
    room: 'Sala 1',
    showtimes: ['15:20', '17:50', '20:00'],
    accent: 'violet',
  },
  {
    id: 4,
    title: 'Linea de Fuego',
    genre: 'Accion',
    format: 'Dolby Atmos',
    runtime: 126,
    rating: '16+',
    synopsis:
      'Una agente encubierta cruza tres fronteras para desactivar una red que siempre va un paso adelante.',
    room: 'Sala 5',
    showtimes: ['16:45', '19:10', '22:00'],
    accent: 'orange',
  },
  {
    id: 5,
    title: 'Casa de Eco',
    genre: 'Terror',
    format: 'Premium',
    runtime: 110,
    rating: '18+',
    synopsis:
      'Cada noche la casa repite voces distintas. La familia que se muda alli descubre que el eco tambien observa.',
    room: 'Sala 7',
    showtimes: ['18:20', '20:45', '23:00'],
    accent: 'rose',
  },
]

const selectedGenre = ref('Todos')
const selectedMovieId = ref(movies[1].id)
const bookedSlot = ref({
  movie: 'Nebula Run',
  room: 'Sala IMAX',
  time: '19:35',
  format: 'IMAX',
})

const visibleMovies = computed(() => {
  if (selectedGenre.value === 'Todos') {
    return movies
  }

  return movies.filter((movie) => movie.genre === selectedGenre.value)
})

const spotlightMovie = computed(() => {
  return visibleMovies.value.find((movie) => movie.id === selectedMovieId.value) ?? visibleMovies.value[0] ?? movies[0]
})

const stats = computed(() => [
  { value: `${visibleMovies.value.length}`, label: 'peliculas visibles' },
  { value: `${movies.reduce((sum, movie) => sum + movie.showtimes.length, 0)}`, label: 'funciones hoy' },
  { value: `${movies.filter((movie) => movie.format === 'IMAX' || movie.format === '4DX').length}`, label: 'salas premium' },
])

function getMoviesForGenre(genre) {
  return genre === 'Todos' ? movies : movies.filter((movie) => movie.genre === genre)
}

function selectGenre(genre) {
  selectedGenre.value = genre
  selectedMovieId.value = getMoviesForGenre(genre)[0]?.id ?? movies[0].id
}

function chooseMovie(movie) {
  selectedMovieId.value = movie.id
}

function book(movie, time) {
  selectedMovieId.value = movie.id
  bookedSlot.value = {
    movie: movie.title,
    room: movie.room,
    time,
    format: movie.format,
  }
}
</script>

<template>
  <main class="cinema-app">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Cine Leonelda</p>
        <h1>Una app de cines lista para descubrir, elegir y reservar.</h1>
        <p class="hero-text">
          Cartelera destacada, horarios del dia y una ruta de compra simple para que tus usuarios encuentren su funcion ideal sin perder tiempo.
        </p>

        <div class="hero-actions">
          <button type="button" class="primary-button" @click="selectGenre('Todos')">Ver cartelera completa</button>
          <button
            type="button"
            class="secondary-button"
            @click="selectGenre('Ciencia ficcion')"
          >
            Explorar premium
          </button>
        </div>

        <dl class="stats-grid" aria-label="Resumen de la cartelera">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <dt>{{ stat.value }}</dt>
            <dd>{{ stat.label }}</dd>
          </div>
        </dl>
      </div>

      <aside class="spotlight-card" :class="[`theme-${spotlightMovie.accent}`]">
        <div class="spotlight-badge">Funcion destacada</div>
        <p class="spotlight-kicker">{{ spotlightMovie.genre }} · {{ spotlightMovie.format }}</p>
        <h2>{{ spotlightMovie.title }}</h2>
        <p class="spotlight-synopsis">{{ spotlightMovie.synopsis }}</p>

        <div class="spotlight-meta">
          <span>{{ spotlightMovie.runtime }} min</span>
          <span>{{ spotlightMovie.rating }}</span>
          <span>{{ spotlightMovie.room }}</span>
        </div>

        <div class="showtime-list">
          <button
            v-for="time in spotlightMovie.showtimes"
            :key="time"
            type="button"
            class="showtime-chip"
            @click="book(spotlightMovie, time)"
          >
            {{ time }}
          </button>
        </div>
      </aside>
    </section>

    <section class="catalog-panel">
      <div class="panel-heading">
        <div>
          <p class="section-label">Cartelera</p>
          <h2>Elige una pelicula y cambia la funcion principal</h2>
        </div>

        <div class="genre-filters" role="tablist" aria-label="Filtrar peliculas por genero">
          <button
            v-for="genre in genres"
            :key="genre"
            type="button"
            class="filter-chip"
            :class="{ active: selectedGenre === genre }"
            @click="selectGenre(genre)"
          >
            {{ genre }}
          </button>
        </div>
      </div>

      <div class="movie-grid">
        <article
          v-for="movie in visibleMovies"
          :key="movie.id"
          class="movie-card"
          :class="{ active: movie.id === spotlightMovie.id, [`theme-${movie.accent}`]: true }"
          @click="chooseMovie(movie)"
        >
          <div class="movie-topline">
            <span>{{ movie.genre }}</span>
            <span>{{ movie.format }}</span>
          </div>

          <div>
            <h3>{{ movie.title }}</h3>
            <p>{{ movie.synopsis }}</p>
          </div>

          <div class="movie-meta">
            <span>{{ movie.runtime }} min</span>
            <span>{{ movie.rating }}</span>
            <span>{{ movie.room }}</span>
          </div>

          <div class="movie-times">
            <button
              v-for="time in movie.showtimes"
              :key="time"
              type="button"
              class="mini-chip"
              @click.stop="book(movie, time)"
            >
              {{ time }}
            </button>
          </div>

          <button type="button" class="card-action" @click.stop="book(movie, movie.showtimes[0])">
            Reservar primera funcion
          </button>
        </article>
      </div>
    </section>

    <section class="booking-panel" aria-live="polite">
      <div>
        <p class="section-label">Reserva activa</p>
        <h2>{{ bookedSlot.movie }}</h2>
        <p>
          {{ bookedSlot.time }} en {{ bookedSlot.room }} con formato {{ bookedSlot.format }}.
        </p>
      </div>

      <button type="button" class="booking-button" @click="book(spotlightMovie, spotlightMovie.showtimes[0])">
        Confirmar seleccion actual
      </button>
    </section>
  </main>
</template>

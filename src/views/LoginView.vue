<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center" style="background: var(--gray-100);">
    <div class="card p-5" style="max-width:450px; width:100%; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div class="text-center mb-4">
        <h1 class="display-6 mb-2" style="color: var(--gray-900);">🎬 Cine Leonelda</h1>
        <p class="text-muted">Sistema de Reservas de Entradas</p>
      </div>

      <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
      </div>

      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label fw-bold" style="color: var(--gray-900);">Usuario</label>
          <input 
            v-model="username" 
            class="form-control form-control-lg" 
            placeholder="Ingresa tu usuario"
            required 
          />
        </div>
        <div class="mb-3">
          <label class="form-label fw-bold" style="color: var(--gray-900);">Contraseña</label>
          <input 
            type="password" 
            v-model="password" 
            class="form-control form-control-lg" 
            placeholder="Ingresa tu contraseña"
            required 
          />
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold">
          <span v-if="!loading">Iniciar Sesión</span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2"></span>
            Cargando...
          </span>
        </button>
      </form>

      <hr class="my-4">

      <div class="alert alert-info mb-0">
        <strong>Demo Credenciales:</strong>
        <div class="mt-2 small">
          <p class="mb-1"><strong>Admin:</strong> admin / admin123</p>
          <p class="mb-0"><strong>Cliente:</strong> user / user123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function submit() {
  error.value = ''
  loading.value = true
    try {
      const res = await fetch('/data/users.json')
      const users = await res.json()
      const found = users.find((u) => u.username === username.value && u.password === password.value)
      if (found) {
        // Guardar sesion simulada
        localStorage.setItem('current_user', JSON.stringify({ id: found.id, username: found.username, name: found.name, role: found.role }))
        router.push('/dashboard')
      } else {
        error.value = 'Credenciales inválidas'
      }
    } catch (e) {
      error.value = 'Error cargando usuarios'
    } finally {
      loading.value = false
    }
}
</script>

<style scoped>
.min-vh-100 { min-height: 100vh; }
.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 0.2rem rgba(44, 62, 80, 0.1);
}
.btn-primary {
  background: var(--primary);
}
.btn-primary:hover {
  background: var(--secondary);
}
</style>

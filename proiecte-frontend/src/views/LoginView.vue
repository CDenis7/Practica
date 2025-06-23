<template>
  <div class="login-page-container">
    <div class="left-panel">
      <div class="welcome-content">
        <img src="/LogoFMI.jpg" alt="Logo FMI" class="welcome-logo">
        <h1>Bun venit!</h1>
        <p>Autentifică-te pentru a administra proiectele realizate de studenții Facultății de Matematică și Informatică.</p>
      </div>
    </div>

    <div class="right-panel">
      <div class="login-card">
        <h2>Intră în cont</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Utilizator:</label>
            <input type="text" id="username" v-model="username" required />
          </div>
          <div class="form-group">
            <label for="password">Parolă:</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <button type="submit" :disabled="loading" class="btn btn-primary btn-login">
            {{ loading ? 'Se autentifică...' : 'Autentificare' }}
          </button>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/authService.js';

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const router = useRouter();

async function handleLogin() {
  loading.value = true;
  error.value = null;
  try {
    const success = await login(username.value, password.value);
    if (success) {
      router.push('/'); // Redirect to home page after successful login
    }
  } catch (err) {
    error.value = 'Autentificare eșuată. Verifică credențialele.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  min-height: calc(100vh - 70px); 
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0;
}

.left-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background-color: var(--card-background-color);
  border-right: 1px solid var(--border-color);
}

.welcome-content {
  max-width: 450px;
  text-align: center;
}

.welcome-logo {
  width: 100px;
  height: auto;
  margin-bottom: 2rem;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.left-panel h1 {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.left-panel p {
  font-size: 1.1rem;
  color: var(--secondary-color);
  line-height: 1.6;
}

.right-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.login-card {
  background-color: var(--card-background-color);
  padding: 2.5rem;
  border-radius: 8px;
  width: 100%;
  max-width: 420px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
  color: var(--text-color);
  background-color: var(--background-color);
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb), 0.25);
}

.btn-login {
  display: block;
  width: 100%;
  padding: 0.9rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.2s ease, filter 0.2s ease;
}

.btn-login:hover:not(:disabled) {
  filter: brightness(110%);
}

.btn-login:disabled {
  background-color: var(--secondary-color);
  cursor: not-allowed;
}

.error-message {
  color: var(--danger-color);
  margin-top: 1rem;
  text-align: center;
}

@media (max-width: 992px) {
  .login-page-container {
    grid-template-columns: 1fr; 
  }
  .left-panel {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
}
</style>
<template>
  <div class="login-view">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
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
    error.value = 'Login failed. Please check your credentials.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-view {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
}
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
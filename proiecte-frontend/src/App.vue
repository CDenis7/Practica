<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo-container">
        <router-link to="/" class="logo-link">
          <img src="@/assets/vue.svg" alt="Logo" class="logo-img" />
          <span>Portofoliu Proiecte</span>
        </router-link>
      </div>
      <nav>
        <router-link to="/create" class="btn btn-primary">Adaugă Proiect</router-link>
      </nav>
    </div>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  background-color: var(--card-background-color);
  border-bottom: 1px solid var(--border-color);
  padding: 0 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 600;
}

.logo-img {
  height: 40px;
  margin-right: 1rem;
}

nav {
  display: flex;
  align-items: center;
}
</style>
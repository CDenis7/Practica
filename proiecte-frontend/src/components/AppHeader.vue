<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const { theme, toggleTheme } = useTheme();
const searchQuery = ref('');
const router = useRouter();

function performSearch() {
  router.push({ name: 'home', query: { search: searchQuery.value } });
}

</script>

<template>
  <header class="main-header">
    <RouterLink to="/">
      <img src="/LogoFMI.jpg" alt="Logo" class="logo">
    </RouterLink>

    <nav class="main-nav">
      <RouterLink to="/">Acasa</RouterLink>
      <RouterLink to="/new">Proiect nou</RouterLink>
    </nav>

   <div class="search-bar">
  <input 
    type="text" 
    placeholder="Caută proiecte..." 
    v-model="searchQuery" 
    @keyup.enter="performSearch"
  >
  <button type="button" @click="performSearch">Caută</button>
</div>
<div class="header-actions">
  <div class="search-bar">
      </div>
  
  <button @click="toggleTheme" class="theme-toggle-btn">
    <span v-if="theme === 'light'">Dark Mode</span>
    <span v-else>Light Mode</span>
  </button>
</div>
  </header>

</template>
<style scoped>
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  background-color: var(--header-background);
  border-bottom: 1px solid var(--header-border);
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;
}

.logo {
  height: 60px;
}

.main-nav a {
  text-decoration: none;
  color: var(--text-color-strong);
  font-weight: bold;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  text-transform: uppercase;
  font-size: 0.9rem;
  border-radius: 4px;
  transition: color 0.2s ease-in-out;
  background: none;
}

.main-nav a:hover,
.main-nav a.router-link-exact-active {
  color: var(--primary-accent-color);
}

.header-actions {
  display: flex;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  border: 1px solid var(--header-border);
  border-radius: 20px;
  overflow: hidden;
}

.search-bar input {
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  outline: none;
  background-color: var(--background-color);
  color: var(--text-color);
}

.search-bar button {
  border: none;
  background: var(--text-color-strong);
  color: var(--background-color);
  cursor: pointer;
  padding: 0.5rem 1rem;
  height: 100%;
  transition: background-color 0.2s ease-in-out;
}

.search-bar button:hover {
  background: var(--primary-accent-color);
}

.theme-toggle-btn {
  background: none;
  border: 1px solid var(--header-border);
  color: var(--text-color);
  padding: 0.5rem 1rem;
  margin-left: 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.theme-toggle-btn:hover {
  background-color: var(--background-color);
}


@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    height: auto;
    gap: 1rem;
    padding: 1rem;
  }

  .main-nav {
    order: 3;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }

  .main-nav a {
    margin: 0.25rem;
  }

  .header-actions {
    order: 2;
    width: 100%;
  }

  .search-bar {
    width: 100%;
  }

  .search-bar input {
    flex-grow: 1;
  }

  .theme-toggle-btn {
    margin-left: 0.5rem;
  }
}
</style>
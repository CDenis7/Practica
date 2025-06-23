<template>
  <header class="main-header" :class="{ 'header-hidden': !isHeaderVisible }">
    <div class="header-content">
      <div class="header-left">
        <RouterLink to="/" class="logo-container">
          <img src="/LogoFMI.jpg" alt="Logo" class="logo">
        </RouterLink>
        <nav class="main-nav">
          <RouterLink to="/">Acasă</RouterLink>
          <RouterLink v-if="isLoggedInState" to="/new">Proiect nou</RouterLink>
        </nav>
      </div>

      <div class="header-right">
        <div class="search-bar">
          <input
            type="text"
            placeholder="Caută proiecte..."
            v-model="searchQuery"
            @keyup.enter="performSearch"
          >
          <button type="button" @click="performSearch">Caută</button>
        </div>
       
        <button @click="toggleTheme" class="theme-toggle-btn">
          <span v-if="theme === 'light'">Mod Întunecat</span>
          <span v-else>Mod Luminos</span>
        </button>

        <div class="auth-actions">
          <button v-if="isLoggedInState" @click="handleLogout" class="btn btn-secondary">
            Logout
          </button>
          <RouterLink v-else :to="{ name: 'login' }" class="btn btn-primary">
            Login
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'; 
import { RouterLink, useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { isLoggedInState, logout } from '@/services/authService';

const { theme, toggleTheme } = useTheme();
const searchQuery = ref('');
const router = useRouter();
const isHeaderVisible = ref(true);
const lastScrollPosition = ref(0);
const scrollThreshold = 70;

const handleScroll = () => {
const currentScrollPosition = window.scrollY;
if (window.innerWidth < 992) {

if (currentScrollPosition > lastScrollPosition.value && currentScrollPosition > scrollThreshold) {
isHeaderVisible.value = false;
} else {
isHeaderVisible.value = true;
}
} else {

isHeaderVisible.value = true;
}

lastScrollPosition.value = currentScrollPosition;
};

onMounted(() => {
window.addEventListener('scroll', handleScroll);
});
onUnmounted(() => {
window.removeEventListener('scroll', handleScroll);
});

function performSearch() {
if (searchQuery.value.trim()) {
router.push({ name: 'home', query: { search: searchQuery.value } });
} else {
router.push({ name: 'home' });
}
}

function handleLogout() {
logout();
router.push({ name: 'login' });
}
</script>

<style scoped>
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--card-background-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
transition: transform 0.3s ease-in-out;
}

.header-hidden {
transform: translateY(-100%);
}

.header-content {
display: flex;
justify-content: space-between;
align-items: center;
width: 100%;
flex-wrap: wrap;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo { height: 50px; display: block; }
.main-nav { display: flex; gap: 1.5rem; }
.main-nav a { text-decoration: none; color: var(--text-color); font-weight: 600; font-size: 1rem; padding-bottom: 5px; transition: color 0.2s ease, border-color 0.2s ease; }
.main-nav a:hover, .main-nav a.router-link-exact-active { color: var(--primary-color); }
.search-bar { display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: 20px; overflow: hidden; background-color: var(--background-color); }
.search-bar input { border: none; outline: none; padding: 0.5rem 1rem; font-size: 0.9rem; background-color: transparent; color: var(--text-color); }
.search-bar button { border: none; background: var(--primary-color); color: white; cursor: pointer; padding: 0.5rem 1rem; height: 100%; transition: background-color 0.2s ease-in-out, filter 0.2s ease-in-out; font-weight: 500; }
.search-bar button:hover { filter: brightness(115%); }
.theme-toggle-btn { background-color: transparent; border: 1px solid var(--border-color); color: var(--text-color); padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-weight: 500; transition: background-color 0.2s ease, color 0.2s ease; }
.theme-toggle-btn:hover { background-color: var(--border-color); }
.auth-actions .btn { padding: 0.5rem 1rem; border-radius: 20px; font-weight: 500; white-space: nowrap; }
@media (max-width: 992px) {
.main-header {
height: auto;
padding: 1rem;
position: sticky;
width: calc(100% - 2rem);
}
.header-content {
flex-direction: column;
gap: 1rem;
}
.header-right {
flex-wrap: wrap;
justify-content: center;
}
.search-bar {
width: 100%;
margin-bottom: 0.5rem;
}
}

@media (max-width: 576px) {
.header-left {
flex-direction: column;
gap: 1rem;
}
.search-bar input {
width: 100%;
}
}
</style>
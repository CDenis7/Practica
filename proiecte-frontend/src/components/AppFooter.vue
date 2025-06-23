<template>
  <footer class="app-footer">
    <div class="footer-content-wrapper">
      <div class="footer-left">
        <div class="footer-text">
          <p class="site-name">Proiecte FMI</p>
          <p class="site-description">O platformă dedicată prezentării muncii și creativității studenților.</p>
        </div>
      </div>
      <div class="footer-right">
        <p class="copyright">&copy; {{ currentYear }} Toate drepturile rezervate.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  padding: 2rem;
  background-color: var(--card-background-color);
  border-top: 1px solid var(--border-color);
  color: var(--secondary-color);
  margin-top: auto;
}

.footer-content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; 
  gap: 1.5rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-logo {
  height: 45px;
  border-radius: 50%;
}

.footer-text p {
  margin: 0;
  line-height: 1.4;
}

.site-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 1rem;
}

.site-description {
  font-size: 0.85rem;
}

.copyright {
  font-size: 0.9rem;
  text-align: right;
}

@media (max-width: 768px) {
  .footer-content-wrapper {
    flex-direction: column; 
    text-align: center; 
  }
  .copyright {
    text-align: center;
  }
}
</style>
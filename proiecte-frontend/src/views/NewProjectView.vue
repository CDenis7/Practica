<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Adaugă un Proiect Nou</h1>
      <p>Completează detaliile de mai jos pentru a publica un nou proiect.</p>
    </header>
    <ProjectForm />
  </div>
</template>

<script setup>
import ProjectForm from '@/components/ProjectForm.vue';
</script>

<style scoped>
.page-container {
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.1rem;
  color: var(--secondary-color);
  max-width: 600px;
  margin: 0 auto;
}
</style>
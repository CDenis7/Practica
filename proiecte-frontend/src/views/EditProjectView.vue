<template>
  <div class="page-wrapper">
    <h1>Editeaza Proiectul</h1>
    <ProjectForm :project-id="projectId" />
  </div>
</template>

<script setup>
import ProjectForm from '@/components/ProjectForm.vue';
defineProps({
  projectId: {
    type: [String, Number],
    required: true
  }
});
</script>

<style scoped>
.page-wrapper {
  padding: 2rem;
}
h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
}
</style>
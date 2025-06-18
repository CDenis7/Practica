<template>
  <div>
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
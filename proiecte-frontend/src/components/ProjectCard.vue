<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  project: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <router-link
    :to="{ name: 'project-detail', params: { id: project.id } }"
    class="project-card"
  >
    <div class="card-image-container">
      <img
        v-if="project.photos && project.photos.length > 0"
        :src="`data:image/jpeg;base64,${project.photos[0].image}`"
        :alt="`Imagine pentru proiectul ${project.name}`"
        class="card-image"
      />
      <div v-else class="card-placeholder-background">
        <span>Fără imagine</span>
      </div>

      <div class="card-overlay">
        <div class="view-details-button">Vezi Detalii</div>
      </div>
    </div>

    <div class="card-content">
      <h3>{{ project.name }}</h3>
      <p>{{ project.authors.map(a => a.name).join(', ') }}</p>
    </div>
  </router-link>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  background-color: var(--card-background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.card-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #f0f0f0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.project-card:hover .card-image {
  transform: scale(1.05);
}

.card-placeholder-background {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e9ecef;
  color: #6c757d;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.project-card:hover .card-overlay {
  opacity: 1;
}

.view-details-button {
  background-color: white;
  color: #333;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: bold;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
}

.project-card:hover .view-details-button {
  opacity: 1;
  transform: translateY(0);
}

.card-content {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.card-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: var(--text-color);
  white-space: nowrap;     
  overflow: hidden;         
  text-overflow: ellipsis; 
}

.card-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--secondary-color);
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
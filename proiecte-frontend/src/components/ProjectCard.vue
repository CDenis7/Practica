<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  project: {
    type: Object,
    required: true
  }
});

/**
 * Generează un stil de fundal determinist pentru un tag.
 * @param {string} tagName Numele tag-ului.
 * @returns {object} Un obiect de stil pentru Vue.
 */
function getTagStyle(tagName) {
  // Creează un hash numeric simplu din numele tag-ului
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Asigură un număr întreg pe 32 de biți
  }
  // Generează o nuanță (hue) între 0 și 360
  const hue = hash % 360;
  
  // Returnează un obiect de stil cu culoarea de fundal și text alb
  return {
    backgroundColor: `hsl(${hue}, 60%, 45%)`,
    color: '#FFFFFF'
  };
}
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
      
      <div class="card-tags" v-if="project.tags && project.tags.length > 0">
        <span 
          v-for="tag in project.tags" 
          :key="tag.id" 
          class="tag-badge"
          :style="getTagStyle(tag.name)"
        >
          {{ tag.name }}
        </span>
      </div>
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
  color: var(--secondary-text-color);
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tags {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    overflow: hidden;
    max-height: 24px;
}

.tag-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 50px;
  line-height: 1.2;
}
</style>
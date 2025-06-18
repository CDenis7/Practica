<script setup>
import { RouterLink } from 'vue-router';
defineProps({
  project: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['delete-project', 'open-photo-modal']);
function onDeleteClick(projectId) {
  if (window.confirm("Esti sigur ca vrei sa stergi acest proiect?")) {
    emit('delete-project', projectId);
  }
}
function onPhotoClick(photoUrl) {
    emit('open-photo-modal', photoUrl);
}
function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  try {
    const videoUrl = new URL(url);
    const videoId = videoUrl.searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (error) {
    console.error('URL video invalid:', error);
    return '';
  }
  return '';
}
</script>

<template>
  <div class="project-card">
    <div class="project-details">
      <h2>{{ project.name }}</h2>
      <p>{{ project.description }}</p>

      <div v-if="project.authors && project.authors.length > 0">
        <strong>Autori:</strong>
        <ul>
          <li v-for="author in project.authors" :key="author.id">
            {{ author.name }}
          </li>
        </ul>
      </div>

      <div v-if="project.links && project.links.length > 0">
        <strong>Link-uri:</strong>
        <ul>
          <li v-for="(link, index) in project.links" :key="index">
            <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.url }}</a>
          </li>
        </ul>
      </div>

      <div v-if="project.videoUrl" class="video-container">
        <strong>Video:</strong>
        <iframe 
          :src="getYouTubeEmbedUrl(project.videoUrl)" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
      
      <div class="project-actions">
        <router-link :to="{ name: 'edit-project', params: { projectId: project.id } }" class="btn-edit">
          Editeaza
        </router-link>
        <button @click="onDeleteClick(project.id)" class="btn-delete">
          Sterge
        </button>
      </div>
    </div>

    <div class="project-photos" v-if="project.photos && project.photos.length > 0"> 
 <img
  v-for="photo in project.photos"
  :key="photo.id"
  :src="`data:image/jpeg;base64,${photo.image}`" 
  :alt="`Poza pentru ${project.name}`"
  @click="onPhotoClick(`data:image/jpeg;base64,${photo.image}`)" />
    </div>
    <div class="project-photos-placeholder" v-else>
        <p>Fara fotografii</p>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  border: 1px solid var(--card-border);
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.project-details {
  flex: 2;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.project-photos {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: flex-start;
}

.project-photos-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  background-color: var(--background-color);
  border-radius: 8px;
  min-height: 120px;
}

.project-details h2 {
  margin-top: 0;
  color: var(--primary-accent-color);
}

.project-details strong {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

.project-details ul {
    padding-left: 20px;
    margin: 0;
}

.project-photos img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.project-photos img:hover {
  transform: scale(1.05);
}

.project-actions {
  margin-top: auto;
  padding-top: 1rem;
  align-self: flex-start;
}

.btn-edit {
  display: inline-block;
  padding: 10px 15px;
  background-color: #f0ad4e;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.btn-edit:hover {
  background-color: #ec971f;
}

.btn-delete {
  display: inline-block;
  padding: 10px 15px;
  background-color: var(--button-delete-bg);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 10px;
  font-family: inherit;
  font-size: inherit;
}

.btn-delete:hover {
  background-color: var(--button-delete-hover);
}

.video-container {
  margin-top: 1rem;
}

.video-container iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  border: 1px solid var(--card-border);
}
.project-details p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; 
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 54px;
}
</style>
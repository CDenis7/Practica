<template>
  <div class="project-detail-view">
    <div v-if="loading" class="loading">Se încarcă detaliile...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="project" class="project-content">
      <h1>{{ project.name }}</h1>

      <div class="details-layout">
        <div class="main-details">
          <p class="description">{{ project.description }}</p>

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
        </div>

        <div class="side-photos" v-if="project.photos && project.photos.length > 0">
          <strong>Fotografii:</strong>
          <div class="photo-gallery">
          <img v-for="photo in project.photos" :key="photo.id" :src="`data:image/jpeg;base64,${photo.image}`" :alt="`Foto ${project.name}`" />
          </div>
        </div>
      </div>

      <div v-if="project.videoUrl" class="video-container">
        <h2>Video Prezentare</h2>
        <iframe 
          :src="getYouTubeEmbedUrl(project.videoUrl)" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProjectById } from '@/services/api.js';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const project = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await getProjectById(props.id);
    project.value = response.data;
  } catch (err) {
    console.error("Eroare la preluarea detaliilor proiectului:", err);
    error.value = "Proiectul nu a putut fi încărcat.";
  } finally {
    loading.value = false;
  }
});

function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  try {
    const videoUrl = new URL(url);
    const videoId = videoUrl.searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    console.error('URL video invalid:', e);
    return '';
  }
  return '';
}
</script>

<style scoped>
.project-detail-view {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--card-background);
  border: 1px solid var(--card-border);
  border-radius: 8px;
}

h1 {
  margin-top: 0;
  color: var(--primary-accent-color);
  border-bottom: 2px solid var(--primary-accent-color);
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

.details-layout {
  display: flex;
  gap: 2rem;
}

.main-details {
  flex: 2;
}

.description {
  font-size: 1.1rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.side-photos {
  flex: 1;
}

.photo-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.photo-gallery img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

strong {
  display: block;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

ul {
  padding-left: 20px;
  margin: 0;
}

.video-container {
  margin-top: 2rem;
}

.video-container iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  border: 1px solid var(--card-border);
}

@media (max-width: 768px) {
  .details-layout {
    flex-direction: column;
  }
}
</style>
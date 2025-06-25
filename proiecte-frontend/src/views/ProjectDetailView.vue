<template>
  <div class="project-detail-page">
    <div v-if="loading" class="loading">Se încarcă detaliile...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="project">
      <h1 class="project-title">{{ project.name }}</h1>
      <div class="detail-layout">
        <div class="media-column">
          
          <div class="main-media-viewer">
            <div v-if="activeMedia === 'video'" class="video-container">
              <iframe 
                :src="getYouTubeEmbedUrl(project.videoUrl)" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
              ></iframe>
            </div>
            
            <div v-else class="carousel-container">
              <Splide :options="splideOptions" ref="mainCarousel">
                <SplideSlide v-for="photo in project.photos" :key="photo.id">
                  <img :src="`data:image/jpeg;base64,${photo.image}`" :alt="`Foto ${project.name}`" class="carousel-image" />
                </SplideSlide>
              </Splide>
            </div>
          </div>
          
          <div class="media-chooser">
            <div 
              v-if="project.videoUrl" 
              class="thumbnail-container video-thumb"
              :class="{ active: activeMedia === 'video' }"
              @click="setActiveMedia('video')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>
              <span>Video</span>
            </div>
            
            <div 
              v-for="(photo, index) in project.photos"
              :key="photo.id"
              class="thumbnail-container"
              :class="{ active: activeMedia === 'photo' && activePhotoIndex === index }"
              @click="setActiveMedia('photo', index)"
            >
              <img 
                :src="`data:image/jpeg;base64,${photo.image}`"
                :alt="`Thumbnail ${index + 1}`"
              />
            </div>
          </div>

        </div>

        <aside class="sidebar-column">
          <div class="details-box description-box">
            <h3>Descriere</h3>
            <p class="description">{{ project.description }}</p>
          </div>
          
          <div class="details-box">
            <h3>Autori</h3>
            <ul class="authors-list">
              <li v-for="author in project.authors" :key="author.id">
                {{ author.name }}
              </li>
            </ul>
          </div>

          <div class="details-box" v-if="project.tags && project.tags.length > 0">
            <h3>Tag-uri</h3>
            <div class="tags-list">
                <!-- Aplicăm stilul dinamic aici -->
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
          
          <div class="details-box" v-if="project.links && project.links.length > 0 && project.links[0].url">
            <h3>Link-uri</h3>
            <ul class="links-list">
              <li v-for="(link, index) in project.links" :key="index">
                <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.url }}</a>
              </li>
            </ul>
          </div>

          <div v-if="isLoggedInState" class="actions-detail">
            <router-link :to="{ name: 'edit-project', params: { projectId: project.id } }" class="btn btn-secondary">
              Editează
            </router-link>
            <button @click="handleDelete(project.id)" class="btn btn-danger">
              Șterge
            </button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProjectById, deleteProject } from '@/services/api.js';
import { isLoggedInState } from '@/services/authService';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/splide/dist/css/themes/splide-default.min.css';

const props = defineProps({ id: { type: String, required: true } });
const project = ref(null);
const loading = ref(true);
const error = ref(null);
const router = useRouter();
const activeMedia = ref('video');
const activePhotoIndex = ref(0);
const mainCarousel = ref(null);

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

watch(project, (newProject) => {
  if (newProject) {
    if (newProject.videoUrl) {
      activeMedia.value = 'video';
    } else if (newProject.photos && newProject.photos.length > 0) {
      activeMedia.value = 'photo';
    }
  }
});
function getTagStyle(tagName) {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = hash % 360;
  return {
    backgroundColor: `hsl(${hue}, 60%, 45%)`,
    color: '#FFFFFF'
  };
}
async function setActiveMedia(type, index = 0) {
  activeMedia.value = type;
  if (type === 'photo') {
    activePhotoIndex.value = index;
    await nextTick();
    if (mainCarousel.value) {
      mainCarousel.value.go(index);
    }
  }
}

const splideOptions = {
  rewind: true,
  gap: '1rem',
  pagination: false,
};

async function handleDelete(projectId) {
  if (confirm("Sunteți absolut sigur că doriți să ștergeți acest proiect? Acțiunea este ireversibilă.")) {
    try {
      await deleteProject(projectId);
      router.push({ name: 'home' });
    } catch (err) {
      console.error("Eroare la ștergerea proiectului:", err);
      alert("Proiectul nu a putut fi șters.");
    }
  }
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

<style scoped>
.project-detail-page {
  max-width: 1200px;
  padding: 0 2rem 2rem;
}

.loading, .error {
  text-align: center;
  font-size: 1.5rem;
  padding: 4rem;
}

.project-title {
  margin-top: 0;
  padding-top: 0;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  border-bottom: 2px solid var(--primary-color);
  color: var(--text-color);
}

.detail-layout {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 2.5rem;
  align-items: start;
}

.main-media-viewer {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.video-container, .carousel-container {
  width: 100%;
  height: 100%;
}

.video-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain; 
}

:deep(.splide__slide) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.media-chooser {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.thumbnail-container {
  width: 120px;
  height: 67.5px;
  border-radius: 4px;
  border: 3px solid transparent;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease;
  background-color: #f0f0f0;
}

.thumbnail-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-container:hover {
  transform: scale(1.05);
  border-color: #aaa;
}

.thumbnail-container.active {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.video-thumb {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--border-color);
  color: var(--text-color);
  width: 120px;
  height: 67.5px;
  border-radius: 4px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.video-thumb:hover {
  transform: scale(1.05);
}

.video-thumb.active {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.video-thumb svg {
  width: 24px;
  height: 24px;
}

.video-thumb span {
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 4px;
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.details-box {
  background-color: var(--card-background-color);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  border-radius: 8px;
}

.description-box {
  max-height: 250px; 
  overflow-y: auto; 
  padding-right: 10px;
}

.details-box h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  color: var(--text-color);
}

.description {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--text-color);
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.authors-list, .links-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  color: var(--text-color);
}

.authors-list li, .links-list li {
  margin-bottom: 0.5rem;
}

.links-list a {
  color: var(--primary-color);
  text-decoration: none;
  word-break: break-all;
}

.links-list a:hover {
  text-decoration: underline;
}

.actions-detail {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 992px) {
  .detail-layout {
    grid-template-columns: 1fr; 
  }
  .project-title {
    font-size: 2rem; 
  }
}

@media (max-width: 576px) {
  .project-detail-page {
    padding: 0 1rem 1rem; 
  }
  .project-title {
    font-size: 1.75rem;
  }
  .thumbnail-container {
    width: 90px; 
    height: 50.625px;
  }
  .video-thumb {
    width: 90px;
    height: 50.625px;
  }
}
.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem; /* Spațiere consistentă */
}
/* Stil de bază pentru tag-uri în această componentă */
.tag-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 50px;
}
</style>
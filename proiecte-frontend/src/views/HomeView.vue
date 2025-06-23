<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getProjects } from '../services/api';
import ProjectCard from '@/components/ProjectCard.vue';

const itemsPerPage = 6; 
const visibleProjectsCount = ref(itemsPerPage);

const projects = ref([]);
const route = useRoute();

onMounted(async () => {
  try {
    const response = await getProjects();
    projects.value = response.data;
  } catch (error) {
    console.error('Eroare la încărcarea proiectelor:', error);
  }
});

const filteredProjects = computed(() => {
  const searchTerm = route.query.search;
  if (!searchTerm || !searchTerm.trim()) {
    return projects.value;
  }
  return projects.value.filter(project => {
    const term = searchTerm.toLowerCase();
    const inName = project.name.toLowerCase().includes(term);
    const inAuthors = project.authors.some(author => 
      author.name.toLowerCase().includes(term)
    );
    return inName || inAuthors;
  });
});


const projectsToDisplay = computed(() => {
  return filteredProjects.value.slice(0, visibleProjectsCount.value);
});

const hasMoreProjects = computed(() => {
  return visibleProjectsCount.value < filteredProjects.value.length;
});


function loadMore() {
  visibleProjectsCount.value += itemsPerPage;
}

watch(() => route.query.search, () => {
  visibleProjectsCount.value = itemsPerPage;
});
</script>

<template>
  <div class="home-view-container">
    <section class="hero-section">
      <h1 class="hero-title">
        Descoperă
        <span>Proiectele</span>
        realizate de studenții FMI
      </h1>
      <p class="hero-subtitle">
        Navighează, explorează și inspiră-te din miile de ore de muncă, creativitate și inovație.
      </p>
    </section>

    <h1>Toate Proiectele</h1>
    
    <div class="project-list">
      <ProjectCard
        v-for="project in projectsToDisplay"
        :key="project.id"
        :project="project"
      />
    </div>

    <div v-if="hasMoreProjects" class="load-more-container">
      <button @click="loadMore" class="btn btn-primary btn-load-more">
        Încarcă mai multe
      </button>
    </div>
  </div>
</template>

<style scoped>
.home-view-container {
  padding: 0 2rem;
}

.hero-section {
  text-align: center;
  margin-top: 3rem; 
  margin-bottom: 4rem;
  padding: 3rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text-color);
  margin: 0 auto 1rem auto;
  max-width: 800px;
  line-height: 1.2;
}

.hero-title span {
  color: #00a1b6;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--secondary-color);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.home-view-container h1 {
  margin-bottom: 2rem;
  font-weight: 600;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding-bottom: 3rem;
}

.load-more-container {
  text-align: center;
  padding-bottom: 3rem;
}

.btn-load-more {
  padding: 0.8rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem; 
  }
  .hero-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .home-view-container {
    padding: 0 1rem; 
  }
  .hero-title {
    font-size: 2rem;
  }
}
</style>
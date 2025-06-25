<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { getProjects, getTags } from '@/services/api';
import ProjectCard from '@/components/ProjectCard.vue';

// Starea pentru paginare/afisare pe client-side
const itemsPerPage = 6;
const visibleProjectsCount = ref(itemsPerPage);

// Stocăm TOATE proiectele aici
const allProjects = ref([]);
const tags = ref([]);
const selectedTag = ref(null);

const route = useRoute();
const searchQuery = computed(() => route.query.search || '');

// Starea pentru meniul dropdown
const isDropdownOpen = ref(false);
const dropdown = ref(null);

onMounted(async () => {
  try {
    // Preluăm TOATE proiectele și TOATE tag-urile de la început
    const [projectsRes, tagsRes] = await Promise.all([getProjects(), getTags()]);
    allProjects.value = projectsRes.data;
    tags.value = tagsRes.data.sort((a,b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Eroare la încărcarea datelor:', error);
  }
});

// Logica pentru a determina tag-urile disponibile pentru filtrare
const availableTags = computed(() => {
    const allTagsFromProjects = allProjects.value.flatMap(project => project.tags);
    const uniqueTagsMap = new Map();
    allTagsFromProjects.forEach(tag => {
        if (tag && tag.id) {
            uniqueTagsMap.set(tag.id, tag);
        }
    });
    return Array.from(uniqueTagsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
});

function selectTag(tag) {
    selectedTag.value = tag;
    isDropdownOpen.value = false;
}

// Logica de filtrare combinată
const filteredProjects = computed(() => {
  let tempProjects = allProjects.value;
  if (selectedTag.value) {
    tempProjects = tempProjects.filter(project => 
      project.tags.some(tag => tag.id === selectedTag.value.id)
    );
  }
  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase();
    tempProjects = tempProjects.filter(project => {
      const inName = project.name.toLowerCase().includes(term);
      const inAuthors = project.authors.some(author => 
        author.name.toLowerCase().includes(term)
      );
      return inName || inAuthors;
    });
  }
  return tempProjects;
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

watch([selectedTag, searchQuery], () => {
  visibleProjectsCount.value = itemsPerPage;
});

// Logica pentru a închide dropdown-ul la click în afară
const handleClickOutside = (event) => {
    if (dropdown.value && !dropdown.value.contains(event.target)) {
        isDropdownOpen.value = false;
    }
};

watch(isDropdownOpen, (isOpen) => {
    if (isOpen) {
        nextTick(() => {
            document.addEventListener('click', handleClickOutside);
        });
    } else {
        document.removeEventListener('click', handleClickOutside);
    }
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

    <div class="list-header">
        <h1>Toate Proiectele</h1>
        <div class="filter-dropdown-wrapper" ref="dropdown" v-if="availableTags.length > 0">
            <button @click="isDropdownOpen = !isDropdownOpen" class="dropdown-toggle-btn">
                <span>{{ selectedTag ? selectedTag.name : 'Filtrează după Tag' }}</span>
                <span class="arrow" :class="{ 'up': isDropdownOpen }">▼</span>
            </button>
            <div v-if="isDropdownOpen" class="dropdown-menu">
                <a href="#" @click.prevent="selectTag(null)">Toate Proiectele</a>
                <a href="#" v-for="tag in availableTags" :key="tag.id" @click.prevent="selectTag(tag)">
                    {{ tag.name }}
                </a>
            </div>
        </div>
    </div>
    
    <div v-if="!allProjects.length" class="loading-initial">Se încarcă...</div>
    <div v-else-if="projectsToDisplay.length === 0" class="loading-initial">Niciun proiect găsit.</div>

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
  margin-bottom: 2rem;
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
.hero-subtitle {
  font-size: 1.2rem;
  color: var(--secondary-text-color);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}
.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}
.list-header h1 {
    margin-bottom: 0;
}
.loading-initial {
    text-align: center;
    padding: 4rem;
    font-size: 1.2rem;
    color: var(--secondary-color);
}
.filter-dropdown-wrapper {
    position: relative;
    display: inline-block;
}
.dropdown-toggle-btn {
    background-color: var(--card-background-color);
    border: 1px solid var(--border-color);
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
    min-width: 200px;
    justify-content: space-between;
}
.dropdown-toggle-btn .arrow {
    transition: transform 0.2s ease-in-out;
}
.dropdown-toggle-btn .arrow.up {
    transform: rotate(180deg);
}
.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: var(--card-background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-top: 0.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10;
    max-height: 300px;
    overflow-y: auto;
}
.dropdown-menu a {
    display: block;
    padding: 0.75rem 1.2rem;
    text-decoration: none;
    color: var(--text-color);
}
.dropdown-menu a:hover {
    background-color: var(--background-color);
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
  .hero-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1rem; }
  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
}
@media (max-width: 576px) {
  .home-view-container { padding: 0 1rem; }
  .hero-title { font-size: 2rem; }
}
</style>
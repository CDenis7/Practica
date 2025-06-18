<script setup>
import { ref, onMounted } from 'vue';
// Presupunem că `api.js` exportă aceste funcții cu nume
import { getProjects, deleteProject } from '../services/api'; 

const projects = ref([]);

onMounted(async () => {
  try {
    const response = await getProjects();
    projects.value = response.data;
  } catch (error) {
    console.error('Eroare la încărcarea proiectelor:', error);
  }
});

const handleDelete = async (projectId) => {
  if (confirm('Sunteți sigur că doriți să ștergeți acest proiect?')) {
    try {
      await deleteProject(projectId);
      projects.value = projects.value.filter(p => p.id !== projectId);
    } catch (error) {
      console.error('Eroare la ștergerea proiectului:', error);
      alert('Nu s-a putut șterge proiectul.');
    }
  }
};
</script>
<template>
  <div class="project-list-container">
    <h1>Toate Proiectele</h1>
    <div class="project-list">
      <div v-if="!projects.length">Se încarcă proiectele...</div>
      <div v-else v-for="project in projects" :key="project.id" class="project-card">
        <h2>{{ project.name }}</h2>
        <p class="description">{{ project.description }}</p>

        <div class="info-section">
          <strong>Autori:</strong>
          <span>{{ project.authors.map(a => a.name).join(', ') }}</span>
        </div>

        <div class="info-section">
          <strong>Link-uri Git:</strong>
          <ul>
            <li v-for="link in project.links" :key="link.id">
              <a :href="link.url" target="_blank">{{ link.url }}</a>
            </li>
          </ul>
        </div>
        
        <div class="photos">
          <img v-for="photo in project.photos" :key="photo.id" :src="`data:image/jpeg;base64,${photo.image}`" alt="Project photo" />
        </div>

        <div class="actions">
          <button @click="$router.push(`/edit/${project.id}`)" class="btn btn-secondary">Editează</button>
          <button @click="handleDelete(project.id)" class="btn btn-danger">Șterge</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.project-list-container h1 {
  margin-bottom: 2rem;
  font-weight: 600;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.project-card {
  background-color: var(--card-background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-5px);
}

.project-card h2 {
  margin-top: 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.project-card .description {
  color: #6c757d;
  flex-grow: 1; /* Asigură că descrierea umple spațiul disponibil */
  margin-bottom: 1.5rem;
}

.info-section {
  margin-bottom: 1rem;
}

.info-section strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
}

.info-section ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.info-section ul li a {
  color: var(--primary-color);
  text-decoration: none;
}

.info-section ul li a:hover {
  text-decoration: underline;
}

.photos {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.photos img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.actions {
  margin-top: auto; /* Împinge butoanele la bază */
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
}
</style>
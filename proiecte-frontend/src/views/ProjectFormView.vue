<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// Am revenit la importurile dumneavoastră originale, cu nume
import {
    getAuthors,
    createProject,
    updateProject,
    getProjectById,
    uploadPhoto,
    deletePhoto
} from '../services/api';

const props = defineProps({
    isEdit: Boolean
});

const router = useRouter();
const route = useRoute();

const projectForm = reactive({
    id: null,
    name: '',
    description: '',
    authors: [],
    links: [],
    photos: []
});

const allAuthors = ref([]);
const newLinkUrl = ref('');
const newPhotosFiles = ref([]);

// Funcție separată pentru a încărca datele
const fetchProjectData = async (id) => {
    try {
        const projectResponse = await getProjectById(id);
        Object.assign(projectForm, projectResponse.data);
    } catch (error) {
        console.error("Eroare la încărcarea datelor proiectului:", error);
        router.push('/');
    }
};

// Urmărim schimbările din URL
watch(
  () => route.params.id,
  (newId) => {
    if (props.isEdit && newId) {
        fetchProjectData(newId);
    }
  }
);

// Încărcarea datelor la prima randare
onMounted(async () => {
    try {
        const authorsResponse = await getAuthors();
        allAuthors.value = authorsResponse.data;

        if (props.isEdit && route.params.id) {
            await fetchProjectData(route.params.id);
        }
    } catch (error) {
        console.error("Eroare la încărcarea datelor pentru formular:", error);
    }
});

const handleSubmit = async () => {
    // Verificăm dacă suntem în modul de creare
    if (props.isEdit) {
        alert("Funcționalitatea de editare trebuie implementată separat.");
        return;
    }

    // --- Procesul Corect în 2 Pași ---

    // 1. Pregătim payload-ul PENTRU CREAREA PROIECTULUI (fără poze)
    // Trimitem un array gol pentru 'photos' pentru a evita eroarea din backend.
    const projectPayload = {
        name: projectForm.name,
        description: projectForm.description,
        authors: projectForm.authors.map(author => ({ id: author.id })),
        links: projectForm.links.map(link => ({ url: link.url })),
        photos: [] 
    };

    try {
        // === PASUL 1: Crearea proiectului de bază ===
        console.log("Pasul 1: Se trimit datele de bază ale proiectului...", projectPayload);
        const response = await createProject(projectPayload);
        const newProjectId = response.data.id;
        console.log("Pasul 1 REUȘIT. ID-ul proiectului nou este:", newProjectId);

        // === PASUL 2: Încărcarea pozelor, dacă există ===
        if (newPhotosFiles.value.length > 0) {
            console.log(`Pasul 2: Se încarcă ${newPhotosFiles.value.length} poze...`);
            for (const file of newPhotosFiles.value) {
                const base64WithPrefix = await fileToBase64(file);
                // Backend-ul așteaptă un JSON { "image": "..." }, deci trimitem doar string-ul pur
                const pureBase64 = base64WithPrefix.substring(base64WithPrefix.indexOf(',') + 1);
                await uploadPhoto(newProjectId, pureBase64);
            }
            console.log("Pasul 2 REUȘIT. Toate pozele au fost încărcate.");
        }

        // === PASUL 3: Redirectare la final ===
        router.push('/');

    } catch (error) {
        console.error("A apărut o eroare în procesul de creare:", error);
        if (error.response) {
            alert(`Eroare de la server (Status ${error.response.status}): ${error.response.data}`);
        } else {
            alert(`Eroare în frontend: ${error.message}`);
        }
    }
};

// Restul funcțiilor (le-am copiat pe ale dumneavoastră, nu necesită modificări)
const addLink = () => {
    if (newLinkUrl.value.trim()) {
        projectForm.links.push({ url: newLinkUrl.value.trim() });
        newLinkUrl.value = '';
    }
};

const removeLink = (index) => {
    projectForm.links.splice(index, 1);
};

const handleFileChange = (event) => {
    newPhotosFiles.value = Array.from(event.target.files);
};

const handleDeletePhoto = async (photoId, index) => {
    if (confirm("Sigur dorești să ștergi această poză?")) {
        try {
            await deletePhoto(photoId);
            projectForm.photos.splice(index, 1);
        } catch (error) {
            console.error("Eroare la ștergerea pozei:", error);
        }
    }
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

</script>

<template>
  <div class="form-view">
    <h1>{{ isEdit ? 'Editează Proiect' : 'Creează Proiect Nou' }}</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Nume Proiect:</label>
        <input type="text" id="name" v-model="projectForm.name" required />
      </div>

      <div class="form-group">
        <label for="description">Descriere:</label>
        <textarea id="description" v-model="projectForm.description"></textarea>
      </div>

      <div class="form-group">
        <label for="authors">Autori:</label>
        <select id="authors" v-model="projectForm.authors" multiple>
            <option v-for="author in allAuthors" :key="author.id" :value="author">
                {{ author.name }}
            </option>
        </select>
        <div class="small-text">Ține apăsat Ctrl (sau Cmd pe Mac) pentru a selecta mai mulți.</div>
      </div>

      <div class="form-group">
        <label>Link-uri:</label>
        <div v-for="(link, index) in projectForm.links" :key="index" class="list-item">
            <span>{{ link.url }}</span>
            <button type="button" @click="removeLink(index)">Șterge</button>
        </div>
        <div class="add-item">
            <input type="text" v-model="newLinkUrl" placeholder="Adaugă un link nou" />
            <button type="button" @click="addLink">Adaugă</button>
        </div>
      </div>
      
       <div class="form-group">
        <label>Poze Existente:</label>
        <div class="photos-preview">
            <div v-for="(photo, index) in projectForm.photos" :key="photo.id" class="photo-item">
                <img :src="`data:image/jpeg;base64,${photo.image}`" />
                <button type="button" @click="handleDeletePhoto(photo.id, index)">X</button>
            </div>
        </div>
       </div>

      <div class="form-group">
        <label for="photos">Încarcă poze noi:</label>
        <input type="file" id="photos" @change="handleFileChange" multiple accept="image/*" />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">{{ isEdit ? 'Salvează Modificările' : 'Creează Proiect' }}</button>
        <router-link to="/" class="btn">Anulează</router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  background-color: var(--card-background-color);
  padding: 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.form-container h1 {
  margin-top: 0;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-color);
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-group select[multiple] {
  height: 150px;
}

.small-text {
  font-size: 0.875em;
  color: #6c757d;
  margin-top: 0.25rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid var(--border-color);
  margin-bottom: 5px;
  border-radius: 4px;
}

.add-item {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.add-item input { flex-grow: 1; }
.add-item button { flex-shrink: 0; }

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.photos-preview {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  min-height: 80px;
}

.photo-item {
  position: relative;
}

.photo-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.photo-item .delete-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--danger-color);
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;  
  width: 24px;
  height: 24px;
  font-size: 12px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
</style>
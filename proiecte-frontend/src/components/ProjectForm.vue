<template>
  <form @submit.prevent="handleSubmit" class="project-form">
    <div class="form-group">
      <label for="name">Nume Proiect</label>
      <input type="text" id="name" v-model="project.name" required />
    </div>

    <div class="form-group">
      <label for="description">Descriere</label>
      <textarea id="description" v-model="project.description" rows="5"></textarea>
    </div>
<div class="form-group">
  <label for="videoUrl">URL Video YouTube</label>
  <input type="url" id="videoUrl" v-model="project.videoUrl" placeholder="https://www.youtube.com/watch?v=..." />
</div>
   <div class="form-group">
  <label for="authors">Autori</label>
  <input type="text" id="authors" v-model="authorNamesString" placeholder="ex: Ion Popescu, Maria Ionescu" />
  <p v-if="isProcessingAuthors" style="color: #008080;">Se proceseaza autorii...</p>
</div>

    <div class="form-group">
        <label>Link-uri</label>
        <div v-for="(link, index) in project.links" :key="index" class="dynamic-input">
            <input type="url" v-model="link.url" placeholder="https://exemplu.com" required />
            <button type="button" @click="removeLink(index)" class="btn-remove">Sterge</button>
        </div>
        <button type="button" @click="addLink" class="btn-add">Adauga Link</button>
    </div>
    
    <div class="form-group">
      <label>Fotografii</label>

      <div v-if="isEditing && project.photos.length" class="photo-gallery">
        <div v-for="(photo, index) in project.photos" :key="photo.id" class="photo-preview-container">
          <img :src="photo.url" alt="Fotografie existentă" class="photo-preview" />
          <button type="button" @click="handleDeleteExistingPhoto(photo.id, index)" class="btn-remove btn-photo-delete">Șterge</button>
        </div>
      </div>
      
      <div v-if="newPhotos.length" class="photo-gallery">
        <div v-for="(photo, index) in newPhotos" :key="index" class="photo-preview-container">
          <img :src="photo.data" alt="Previzualizare fotografie nouă" class="photo-preview" />
          <button type="button" @click="removeNewPhoto(index)" class="btn-remove btn-photo-delete">Anuleaza</button>
        </div>
      </div>

      <label for="photo-upload" class="btn-add">Adauga Fotografii Noi</label>
      <input type="file" id="photo-upload" @change="handleFileSelect" multiple accept="image/*" style="display: none;" />
    </div>


    <button type="submit" class="btn-submit" :disabled="isSubmitting">
      <span v-if="isSubmitting">Se salveaza</span>
      <span v-else>{{ isEditing ? 'Salvează Modificările' : 'Creează Proiect' }}</span>
    </button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    getProjectById,
    createProject,
    updateProject,
    uploadPhoto,
    deletePhoto,
    getAuthors,
    createAuthor
} from '@/services/api';

const props = defineProps({
    projectId: {
        type: [String, Number],
        default: null
    }
});

const router = useRouter();
const isEditing = !!props.projectId;
const isSubmitting = ref(false);
const isProcessingAuthors = ref(false); 
const authorNamesString = ref('');

const project = ref({
  name: '',
  description: '',
  videoUrl: '', 
  authors: [],
  links: [{ url: '' }],
  photos: []
});

const newPhotos = ref([]); 

const addLink = () => {
    project.value.links.push({ url: '' });
};

const removeLink = (index) => {
    project.value.links.splice(index, 1);
};

const handleFileSelect = (event) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
            newPhotos.value.push({
                name: file.name,
                data: e.target.result 
            });
        };
        reader.readAsDataURL(file);
    }
    event.target.value = '';
};

const removeNewPhoto = (index) => {
    newPhotos.value.splice(index, 1);
};

const handleDeleteExistingPhoto = async (photoId, index) => {
    if (confirm("Esti sigur că vrei sa stergi aceasta fotografie?")) {
        try {
            await deletePhoto(photoId); 
            project.value.photos.splice(index, 1);
        } catch (error) {
            console.error("Eroare la stergerea fotografiei:", error);
            alert("Nu s-a putut sterge fotografia.");
        }
    }
};
onMounted(async () => {
    if (isEditing) {
        try {
            const response = await getProjectById(props.projectId);
            project.value = response.data;
            if (!project.value.links || project.value.links.length === 0) {
                project.value.links = [{ url: '' }];
            }
            if (project.value.authors && project.value.authors.length > 0) {
                authorNamesString.value = project.value.authors.map(author => author.name).join(', ');
            }
        } catch (error) {
            console.error("Eroare la incarcarea detaliilor proiectului:", error);
        }
    }
});

const processAuthorNames = async () => {
    isProcessingAuthors.value = true;
    const finalAuthors = [];
    const names = authorNamesString.value
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);

    for (const name of names) {
        try {
            const existingAuthors = await getAuthors(name);

            if (existingAuthors.data.length > 0) {
                finalAuthors.push(existingAuthors.data[0]);
            } else {
                const newAuthorResponse = await createAuthor({ name: name });
                finalAuthors.push(newAuthorResponse.data);
            }
        } catch (error) {
            console.error(`Eroare la procesarea autorului "${name}":`, error);
            alert(`Eroare la procesarea autorului: ${name}`);
            isProcessingAuthors.value = false;
            return null; 
        }
    }

    isProcessingAuthors.value = false;
    return finalAuthors;
};

const uploadNewPhotos = async (targetProjectId) => {
    if (newPhotos.value.length === 0) return;

    const uploadPromises = newPhotos.value.map(photo =>
        uploadPhoto(targetProjectId, photo.data)
    );

    await Promise.all(uploadPromises);
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    const processedAuthors = await processAuthorNames();

    if (processedAuthors === null) {
        isSubmitting.value = false;
        return; 
    }

    project.value.authors = processedAuthors;

    try {
        if (isEditing) {
            await updateProject(props.projectId, project.value);
            await uploadNewPhotos(props.projectId);
        } else {
            const response = await createProject(project.value);
            const newProjectId = response.data.id;
            await uploadNewPhotos(newProjectId);
        }
        router.push({ name: 'home' });
    } catch (error) {
        console.error("Eroare la salvarea proiectului:", error);
        alert("Eroare la salvarea proiectului.");
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.project-form {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--card-background);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--card-border);
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: 4px;
}
.form-group select[multiple] {
    height: 150px;
}
.dynamic-input {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}
.dynamic-input input {
    flex-grow: 1;
}
.btn-add, .btn-remove {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid;
    text-align: center;
    transition: background-color 0.3s ease;
}
.btn-add {
    background-color: var(--button-add-bg);
    border-color: var(--button-add-border);
    color: var(--button-add-color);
    display: inline-block;
    margin-top: 5px;
}
.btn-remove {
    background-color: var(--button-remove-bg);
    border-color: var(--button-remove-border);
    color: var(--button-remove-color);
}
.btn-submit {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  background-color: var(--primary-accent-color);
  color: white; 
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-accent-hover);
}
.btn-submit:disabled {
    background-color: var(--button-disabled-bg);
    cursor: not-allowed;
}
.photo-gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
    border: 1px dashed var(--card-border);
    border-radius: 4px;
}
.photo-preview-container {
    position: relative;
}
.photo-preview {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid var(--card-border);
}
.btn-photo-delete {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 2px 5px;
    font-size: 12px;
}
</style>
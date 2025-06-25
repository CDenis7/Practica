<template>
  <form @submit.prevent="handleSubmit" class="project-form">
    <div class="form-group">
      <label for="name">Titlu Proiect</label>
      <input type="text" id="name" v-model="project.name" required />
    </div>

    <div class="form-group">
      <label for="description">Descriere</label>
      <textarea id="description" v-model="project.description" rows="5"></textarea>
    </div>

    <div class="form-group">
      <label for="videoUrl">URL Video YouTube</label>
      <input type="url" id="videoUrl" v-model="project.videoUrl" placeholder="" />
    </div>
    
    <div class="form-group">
      <label for="authors">Autori (separati prin virgulă)</label>
      <input type="text" id="authors" v-model="authorNamesString" placeholder="" />
      <p v-if="isProcessingAuthors" class="processing-message">Se procesează autorii...</p>
    </div>

    <div class="form-group">
        <label for="tags">Tag-uri (separate prin virgulă)</label>
        <input type="text" id="tags" v-model="tagNamesString" placeholder="ex: Java, Vue, Spring Boot" />
    </div>

    <div class="form-group">
        <label>Link-uri</label>
        <div v-for="(link, index) in project.links" :key="index" class="dynamic-input">
            <input type="url" v-model="link.url" placeholder="" />
            <button type="button" @click="removeLink(index)" class="btn-remove">Șterge</button>
        </div>
        <button type="button" @click="addLink" class="btn-add">Adaugă Link</button>
    </div>
    
    <div class="form-group">
      <label>Fotografii</label>

      <div v-if="isEditing && project.photos.length" class="photo-gallery">
        <div v-for="(photo, index) in project.photos" :key="photo.id" class="photo-preview-container">
          <img :src="`data:image/jpeg;base64,${photo.image}`" alt="Fotografie existentă" class="photo-preview" />
          <button type="button" @click="handleDeleteExistingPhoto(photo.id, index)" class="btn-remove btn-photo-delete">Șterge</button>
        </div>
      </div>
      
      <div v-if="newPhotos.length" class="photo-gallery">
        <div v-for="(photo, index) in newPhotos" :key="index" class="photo-preview-container">
          <img :src="photo.data" alt="Previzualizare fotografie nouă" class="photo-preview" />
          <button type="button" @click="removeNewPhoto(index)" class="btn-remove btn-photo-delete">Anulează</button>
        </div>
      </div>

      <label for="photo-upload" class="btn-add">Adaugă Fotografii Noi</label>
      <input type="file" id="photo-upload" @change="handleFileSelect" multiple accept="image/*" style="display: none;" />
    </div>

    <button type="submit" class="btn-submit" :disabled="isSubmitting">
      <span v-if="isSubmitting">Se salvează...</span>
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
  createAuthor,
  getTags,
  createTag
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
const tagNamesString = ref('');
const allTags = ref([]);

const project = ref({
  name: '',
  description: '',
  videoUrl: '',
  authors: [],
  links: [{ url: '' }],
  photos: [],
  tags: [] 
});

const allAuthors = ref([]); 
const newPhotos = ref([]); 

const addLink = () => {
  project.value.links.push({ url: '' });
};
const removeLink = (index) => {
  project.value.links.splice(index, 1);
};
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  if (!files) return;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      newPhotos.value.push({
        file: file,
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
  if (confirm("Ești sigur că vrei să ștergi această fotografie?")) {
    try {
      await deletePhoto(photoId);
      project.value.photos.splice(index, 1);
    } catch (error) {
      console.error("Eroare la ștergerea fotografiei:", error);
      alert("Nu s-a putut șterge fotografia.");
    }
  }
};
const uploadNewPhotos = async (targetProjectId) => {
    if (newPhotos.value.length === 0) return;
    const uploadPromises = newPhotos.value.map(photo => {
        const base64Image = photo.data.split(',')[1];
        return uploadPhoto(targetProjectId, base64Image);
    });
    await Promise.all(uploadPromises);
};

onMounted(async () => {
  try {
    const [authorsRes, tagsRes] = await Promise.all([getAuthors(), getTags()]);
    allAuthors.value = authorsRes.data;
    allTags.value = tagsRes.data;
  } catch (error) {
    console.error("Eroare la încărcarea datelor inițiale:", error);
  }

  if (isEditing) {
    try {
      const response = await getProjectById(props.projectId);
      project.value = response.data;
      if (project.value.authors && project.value.authors.length > 0) {
        authorNamesString.value = project.value.authors.map(author => author.name).join(', ');
      }
      if (project.value.tags && project.value.tags.length > 0) {
        tagNamesString.value = project.value.tags.map(tag => tag.name).join(', ');
      }
      if (!project.value.links || project.value.links.length === 0) {
        project.value.links = [{ url: '' }];
      }
    } catch (error) {
      console.error("Eroare la încărcarea detaliilor proiectului:", error);
    }
  }
});

const processAuthorNames = async () => {
  isProcessingAuthors.value = true;
  const finalAuthorObjects = [];
  const names = authorNamesString.value.split(',').map(name => name.trim()).filter(Boolean);
  for (const name of names) {
    try {
      let existingAuthor = allAuthors.value.find(author => author.name.toLowerCase() === name.toLowerCase());
      if (existingAuthor) {
        finalAuthorObjects.push(existingAuthor);
      } else {
        const newAuthorResponse = await createAuthor({ name: name });
        const newAuthor = newAuthorResponse.data;
        finalAuthorObjects.push(newAuthor);
        allAuthors.value.push(newAuthor);
      }
    } catch (error) {
      console.error(`Eroare la procesarea autorului "${name}":`, error);
      alert(`Eroare la procesarea autorului: ${name}`);
      isProcessingAuthors.value = false;
      return null;
    }
  }
  isProcessingAuthors.value = false;
  return finalAuthorObjects;
};

const processTagNames = async () => {
  const finalTagObjects = [];
  const names = tagNamesString.value.split(',').map(name => name.trim()).filter(Boolean);
  for (const name of names) {
    try {
      let existingTag = allTags.value.find(tag => tag.name.toLowerCase() === name.toLowerCase());
      if (existingTag) {
        finalTagObjects.push(existingTag);
      } else {
        const newTagResponse = await createTag({ name: name });
        const newTag = newTagResponse.data;
        finalTagObjects.push(newTag);
        allTags.value.push(newTag);
      }
    } catch (error) {
      console.error(`Eroare la procesarea tag-ului "${name}":`, error);
      alert(`Eroare la procesarea tag-ului: ${name}`);
      return null;
    }
  }
  return finalTagObjects;
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  const [processedAuthors, processedTags] = await Promise.all([
    processAuthorNames(),
    processTagNames()
  ]);

  if (processedAuthors === null || processedTags === null) {
    isSubmitting.value = false;
    return; 
  }

  const payload = {
    ...project.value,
    authors: processedAuthors,
    tags: processedTags, 
    links: project.value.links.filter(link => link.url)
  };

  try {
    if (isEditing) {
      await updateProject(props.projectId, payload);
      await uploadNewPhotos(props.projectId);
    } else {
      const response = await createProject(payload);
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
  background: var(--card-background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: 4px;
  box-sizing: border-box;
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
  transition: background-color 0.2s ease;
  font-weight: 500;
}
.btn-add {
  background-color: #198754;
  border-color: #198754;
  color: white;
  display: inline-block;
  margin-top: 5px;
}
.btn-add:hover {
    background-color: #157347;
}
.btn-remove {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}
.btn-remove:hover {
    background-color: #bb2d3b;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  background-color: var(--primary-color);
  color: white; 
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, filter 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  filter: brightness(110%);
}

.dark-mode .btn-submit {
    color: #1A202C;
}

.btn-submit:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  filter: none;
}
.photo-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px dashed var(--border-color);
  border-radius: 4px;
  background-color: rgba(0,0,0,0.02);
}
.dark-mode .photo-gallery {
    background-color: rgba(255,255,255,0.05);
}
.photo-preview-container {
  position: relative;
}
.photo-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}
.btn-photo-delete {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 2px 5px;
  font-size: 12px;
}
.processing-message {
    color: var(--primary-color);
    font-size: 0.9rem;
    margin-top: 0.5rem;
}
</style>
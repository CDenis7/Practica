import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Asigură-te că router-ul este importat
import './assets/main.css'
const app = createApp(App)

app.use(router) // Aici se înregistrează router-ul

app.mount('#app')
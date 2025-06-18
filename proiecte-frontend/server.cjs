const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const server = jsonServer.create();
const adapter = new FileSync('db.json');
const db = low(adapter);
const router = jsonServer.router(db);
const port = 8080;
server.use(bodyParser.json({ limit: '10mb' }));
server.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
server.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

server.post('/api/authors', (req, res) => {
    console.log('--- Folosind ruta custom pentru a CREA autor ---');
    try {
        const authorData = req.body;
        if (!authorData.name) {
            return res.status(400).json({ error: 'Numele autorului este necesar' });
        }
        const newAuthor = {
            id: Date.now(),
            name: authorData.name
        };
        db.get('authors').push(newAuthor).write();
        res.status(201).json(newAuthor);
    } catch (error) {
        console.error('Eroare la crearea autorului cu lowdb:', error);
        res.status(500).json({ error: 'Nu s-a putut crea autorul' });
    }
});
server.post('/api/projects', (req, res) => {
    console.log('--- Folosind ruta custom pentru a CREA proiect ---');
    try {
        const projectData = req.body;
        const newProject = { id: Date.now(), ...projectData };
        db.get('projects').push(newProject).write();
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Eroare la crearea proiectului cu lowdb:', error);
        res.status(500).json({ error: 'Nu s-a putut crea proiectul' });
    }
});

server.put('/api/projects/:id', (req, res) => {
    console.log('--- Folosind ruta custom pentru a MODIFICA proiect ---');
    try {
        const projectId = parseInt(req.params.id, 10);
        const projectData = req.body;
        const updatedProject = db.get('projects').find({ id: projectId }).assign(projectData).write();
        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Eroare la actualizarea proiectului cu lowdb:', error);
        res.status(500).json({ error: 'Nu s-a putut actualiza proiectul' });
    }
});

const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

server.post('/api/projects/:projectId/photos', (req, res) => {
    console.log('--- Folosind ruta custom (lowdb) pentru a adăuga fotografie ---');
    const projectId = parseInt(req.params.projectId, 10);
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Imaginea este necesară' });
    }

    try {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const photoId = Date.now();
        const fileName = `${photoId}.jpg`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, buffer);

        const project = db.get('projects').find({ id: projectId });
        
        if (project.value()) {
            const photos = project.get('photos').value() || [];
            const newPhoto = { id: photoId, url: `/public/uploads/${fileName}` };
            photos.push(newPhoto);

            project.assign({ photos: photos }).write();

            res.status(201).json(newPhoto);
        } else {
            res.status(404).json({ error: 'Proiectul nu a fost găsit' });
        }
    } catch (error) {
        console.error('Eroare la încărcarea fotografiei:', error);
        res.status(500).json({ error: 'Eroare la salvarea fotografiei' });
    }
});

server.delete('/api/projects/photos/:photoId', (req, res) => {
    console.log('--- Folosind ruta custom (lowdb) pentru a șterge fotografie ---');
    const photoId = parseInt(req.params.photoId, 10);

    try {
        let projectFound = null;
        const projects = db.get('projects').value();
        
        for (const p of projects) {
            if (p.photos && p.photos.find(photo => photo.id === photoId)) {
                projectFound = p;
                break;
            }
        }

        if (projectFound) {
            const photoToRemove = projectFound.photos.find(p => p.id === photoId);
            const fileName = path.basename(photoToRemove.url);
            const filePath = path.join(uploadsDir, fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            const updatedPhotos = projectFound.photos.filter(p => p.id !== photoId);

            db.get('projects').find({ id: projectFound.id }).assign({ photos: updatedPhotos }).write();
            
            res.sendStatus(204);
        } else {
            res.status(404).json({ error: 'Fotografia nu a fost găsită' });
        }
    } catch (error) {
        console.error('Eroare la ștergerea fotografiei:', error);
        res.status(500).json({ error: 'Eroare la ștergerea fotografiei' });
    }
});

server.use('/api', router);

server.listen(port, () => {
  console.log(`Serverul final și unificat rulează pe http://localhost:${port}`);
});
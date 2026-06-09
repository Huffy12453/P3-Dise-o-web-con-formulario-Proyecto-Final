const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://HuffySkye1:Hector1234@consultoriobigmouth.bfklnpb.mongodb.net/tu_base_de_datos?appName=ConsultorioBigMouth";

mongoose.connect(MONGO_URI)
    .then(() => console.log("¡Conectado exitosamente a MongoDB Atlas!"))
    .catch(err => console.error("Error crítico al conectar a MongoDB:", err));


const pacientesSchema = new mongoose.Schema({
    ID: String, Telefono: String, Contactemeg: String, Correo: String,
    Alergias: String, Antecedentes: String, Nota: String, Nombre: String,
    Edad: String, Genero: String, RFC: String
}, { versionKey: false, strict: false });
const Paciente = mongoose.model('pacientes', pacientesSchema);

const dentistaSchema = new mongoose.Schema({
    IDentista: { type: String }, 
    ID: { type: String },
    Nombre: String,
    Genero: String,
    CEP: String,
    Especialidad: String,
    Horario: String,
    DiasLaborales: String,
    Telefono: String
}, { 
    strict: false,
    collection: 'dentistas'
});
const Dentista = mongoose.model('dentistas', dentistaSchema);

const citasSchema = new mongoose.Schema({
    IDcitas: String, Fecha: String, IDentista: String, Estatus: String,
    IDPaciente: String, Motivo: String
}, { versionKey: false, strict: false }); 
const Cita = mongoose.model('citas', citasSchema); 

app.post('/api/pacientes', async (req, res) => {
    try {
        const nuevoPaciente = new Paciente(req.body);
        await nuevoPaciente.save();
        res.json({ mensaje: "Paciente guardado correctamente"});
    } catch (error) {
        console.error("Error al guardar paciente:", error);
        res.status(500).json({ error: "No se pudo guardar el paciente" });
    }
});

app.post('/api/dentistas', async (req, res) => {
    try {
        const nuevoDentista = new Dentista(req.body);
        await nuevoDentista.save();
        res.json({ mensaje: "Dentista guardado correctamente" });
    } catch (error) {
        console.error("Error al guardar dentista:", error);
        res.status(500).json({ error: "No se pudo guardar el dentista" });
    }
});

app.post('/api/citas', async (req, res) => {
    try {
        const nuevaCita = new Cita(req.body);
        await nuevaCita.save();
        res.json({ mensaje: "Cita guardada correctamente" });
    } catch (error) {
        console.error("Error al guardar cita:", error);
        res.status(500).json({ error: "No se pudo guardar la cita" });
    }
});

app.get('/api/pacientes', async (req, res) => {
    try {
        const listaPacientes = await Paciente.find().lean();
        res.json(listaPacientes);
    } catch (error) {
        console.error("Error al obtener pacientes:", error);
        res.status(500).json({ error: "No se pudieron obtener los pacientes" });
    }
});

app.get('/api/dentistas', async (req, res) => {
    try {
        const listaDentistas = await Dentista.find().lean();
        res.json(listaDentistas);
    } catch (error) {
        console.error("Error al obtener dentistas:", error);
        res.status(500).json({ error: "No se pudieron obtener los dentistas" });
    }
});

app.get('/api/citas', async (req, res) => {
    try {
        const listaCitas = await Cita.find().lean();
        res.json(listaCitas);
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({ error: "No se pudieron obtener las citas" });
    }
});

app.put('/api/pacientes/:id', async (req, res) => {
    try {
        const idBuscado = String(req.params.id).trim();
        const actualizado = await Paciente.findOneAndUpdate(
            { ID: idBuscado }, 
            { $set: req.body }, 
            { new: true }
        );
        if (!actualizado) return res.status(404).json({ error: "Paciente no encontrado en MongoDB" });
        res.json({ mensaje: "Paciente actualizado correctamente", data: actualizado });
    } catch (error) {
        console.error("Error PUT pacientes:", error);
        res.status(500).json({ error: "Error al actualizar paciente" });
    }
});

app.put('/api/dentistas/:id', async (req, res) => {
    try {
        const idBuscado = String(req.params.id).trim();

 
        const actualizado = await Dentista.findOneAndUpdate(
            { 
                $or: [
                    { IDentista: idBuscado },
                    { ID: idBuscado }
                ] 
            }, 
            { $set: req.body }, 
            { new: true }
        );
        
        if (!actualizado) {
            return res.status(404).json({ error: "Dentista no encontrado en MongoDB" });
        }
        
        res.json({ mensaje: "Dentista actualizado correctamente", data: actualizado });
    } catch (error) {
        console.error("Error PUT dentistas:", error);
        res.status(500).json({ error: "Error al actualizar dentista" });
    }
});

app.put('/api/citas/:id', async (req, res) => {
    try {
        const idBuscado = String(req.params.id).trim();
        const actualizado = await Cita.findOneAndUpdate(
            { IDcitas: idBuscado }, 
            { $set: req.body }, 
            { new: true }
        );
        if (!actualizado) return res.status(404).json({ error: "Cita no encontrada en MongoDB" });
        res.json({ mensaje: "Cita actualizada correctamente", data: actualizado });
    } catch (error) {
        console.error("Error PUT citas:", error);
        res.status(500).json({ error: "Error al actualizar cita" });
    }
});


app.delete('/api/pacientes/:id', async (req, res) => {
    try {
        const idBuscado = String(req.params.id).trim();
        const eliminado = await Paciente.findOneAndDelete({ ID: idBuscado });
        if (!eliminado) return res.status(404).json({ error: "Paciente no encontrado para eliminar" });
        res.json({ mensaje: "Paciente eliminado correctamente" });
    } catch (error) {
        console.error("Error DELETE pacientes:", error);
        res.status(500).json({ error: "Error al eliminar paciente" });
    }
});

app.delete('/api/dentistas/:id', async (req, res) => {
    try {
        const idBuscado = String(req.params.id).trim();
        const eliminado = await Dentista.findOneAndDelete({ $or: [{ IDentista: idBuscado }, { ID: idBuscado }] });
        if (!eliminado) return res.status(404).json({ error: "Dentista no encontrado para eliminar" });
        res.json({ mensaje: "Dentista eliminado correctamente" });
    } catch (error) {
        console.error("Error DELETE dentistas:", error);
        res.status(500).json({ error: "Error al eliminar dentista" });
    }
});

app.delete('/api/citas/:id', async (req, res) => {
    try {
        const idBuscado = String(req.params.id).trim();
        const eliminado = await Cita.findOneAndDelete({ IDcitas: idBuscado });
        if (!eliminado) return res.status(404).json({ error: "Cita no encontrada para eliminar" });
        res.json({ mensaje: "Cita ejecutada/eliminada correctamente" });
    } catch (error) {
        console.error("Error DELETE citas:", error);
        res.status(500).json({ error: "Error al eliminar cita" });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// Helper function to read data
const readData = () => {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

// Helper function to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Prediction Logic
const predictSafety = (areaData) => {
    const { lead, tds, coliform, ecoli, ph } = areaData;
    
    if (lead > 0.1 || tds > 1000 || coliform === true || ecoli === true || ph < 5.5 || ph > 9.0) {
        return "Toxic";
    } else if (lead > 0.05 || tds > 500 || coliform === true || ph < 6.5 || ph > 8.5) {
        return "Moderate";
    } else {
        return "Safe";
    }
};

// Routes
app.get('/api/areas', (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error reading data" });
    }
});

app.get('/api/areas/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    try {
        const data = readData();
        const filtered = data.filter(item => item.area.toLowerCase().includes(query));
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: "Error searching data" });
    }
});

app.post('/api/areas', (req, res) => {
    try {
        const data = readData();
        const newArea = {
            ...req.body,
            id: Date.now().toString(),
            result: predictSafety(req.body)
        };
        data.push(newArea);
        writeData(data);
        res.status(201).json(newArea);
    } catch (error) {
        res.status(500).json({ message: "Error adding area" });
    }
});

app.put('/api/areas/:id', (req, res) => {
    try {
        const data = readData();
        const index = data.findIndex(item => item.id === req.params.id);
        if (index !== -1) {
            const updatedArea = {
                ...data[index],
                ...req.body,
                result: predictSafety({ ...data[index], ...req.body })
            };
            data[index] = updatedArea;
            writeData(data);
            res.json(updatedArea);
        } else {
            res.status(404).json({ message: "Area not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating area" });
    }
});

app.delete('/api/areas/:id', (req, res) => {
    try {
        const data = readData();
        const filtered = data.filter(item => item.id !== req.params.id);
        writeData(filtered);
        res.json({ message: "Area deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting area" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

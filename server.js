const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Enable CORS for all routes to handle cross-origin requests
app.options('*', cors());
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Define the path to the sampleData.json file
const DATA_FILE = `${__dirname}/sampleData.json`;

// Function to read data from the JSON file
const readData = () => {
    try {
        // Read the file with the correct encoding
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return null; // Return null to signify an error occurred
    }
};

// Function to write data to the JSON file
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing data file:', error);
        throw error; // Throw the error to be caught by the caller
    }
};

// RESTful API Endpoints

// GET endpoint to retrieve all people data
app.get('/people', (req, res) => {
    const data = readData();
    if (data) {
        res.json(data.People);
    } else {
        res.status(500).send('Error reading people data.');
    }
});

// GET endpoint to retrieve a specific person by ID
app.get('/people/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).send('Error reading data.');
    }
    const person = data.People.find(p => p.Id === parseInt(req.params.id, 10));
    if (person) {
        res.json(person);
    } else {
        res.status(404).send('Person not found');
    }
});

// POST endpoint to add a new person
app.post('/people', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).send('Error reading data.');
    }
    const newPerson = req.body;
    const newId = data.People.length > 0 ? Math.max(...data.People.map(p => p.Id)) + 1 : 1;
    newPerson.Id = newId;
    data.People.push(newPerson);
    try {
        writeData(data);
        res.status(201).json(newPerson);
    } catch (error) {
        res.status(500).send('Error writing data.');
    }
});

// PUT endpoint to update a person's data
app.put('/people/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).send('Error reading data.');
    }
    const id = parseInt(req.params.id, 10);
    const index = data.People.findIndex(p => p.Id === id);
    if (index === -1) {
        return res.status(404).send('Person not found');
    }
    data.People[index] = { ...data.People[index], ...req.body };
    try {
        writeData(data);
        res.json(data.People[index]);
    } catch (error) {
        res.status(500).send('Error writing data.');
    }
});

// DELETE endpoint to remove a person
app.delete('/people/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).send('Error reading data.');
    }
    data.People = data.People.filter(p => p.Id !== parseInt(req.params.id, 10));
    try {
        writeData(data);
        res.status(204).send();
    } catch (error) {
        res.status(500).send('Error writing data.');
    }
});

// Start the server and listen on the specified port
app.get('/departments', (req, res) => {
    const data = readData();
    if (data) {
        res.json(data.Departments);
    } else {
        res.status(500).send('Error reading departments data.');
    }
});

// Set the server to listen on the designated port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Gastos Service is running');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Gastos backend listening at http://localhost:${port}`);
});

import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();
const port: Number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log(`Myapp listening on port ${port}`);
});

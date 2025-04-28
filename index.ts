import express, { Response } from 'express';
import cors from 'cors';
import { AddressInfo } from 'net';

import db from './db/db';

import { userRouter } from './routes';
import bodyParser from 'body-parser';

db.sync().then(() => {
  console.log("Connected to db")
})

const app = express()

require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))

app.use('/api/users', userRouter)

app.get('/', (_, res: Response) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.all('*', (_, res) => {
  res.status(404).json({ message: 'Not found' });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + (listener.address() as AddressInfo).port)
})

import express, { Response } from 'express';
import cors from 'cors';
import { AddressInfo } from 'net';

import db from './db/db';

db.sync().then(() => {
  console.log("Connected to db")
})

const app = express()

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (_, res: Response) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + (listener.address() as AddressInfo).port)
})

import express from 'express';
import {json} from 'body-parser';
import 'express-async-errors';
import { errorHandler, NotFoundError, currentUser } from '@svpillai/common';
import cookieSession from 'cookie-session';
import { deleteOrderRouter } from './routes/delete';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';

const app = express();

app.set('trust proxy', true);

app.use(json());

app.use(
    cookieSession({
        signed: false,
        secure: false        
        //secure: process.env.NODE_ENV !== 'test'
    })
)
app.use(currentUser);

app.use(deleteOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(indexOrderRouter);

app.all('*', async () => {
    
    throw new NotFoundError;
});

app.use(errorHandler);

export {app};
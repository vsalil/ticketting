import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator' ;
import { ValidateRequest, BadRequestError } from '@svpillai/common'
import { User } from '../models/user';
import  jwt  from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signup', [ 
    body('email')
    .isEmail()
    .withMessage('Email must be valid'),
    body('password')
    .trim()
    .isLength( {min: 4, max: 20})
    .withMessage(' Password must be between 4 and 20 characters')
],
ValidateRequest,
async (req: Request,res: Response) => {

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {

       // console.log('Email in use');
       throw new BadRequestError('Email is in use');
       //return res.send({});
    }

    const user = User.build({ email, password });
    await user.save();

    //Generate JWT
    const userJWt = jwt.sign({
        id: user.id,
        email: user.email
    },
    process.env.JWT_KEY!     
    );

    //Store it in session object

    req.session = {jwt: userJWt};

    res.status(201).send(user);
 }
);

export { router as signupRouter };
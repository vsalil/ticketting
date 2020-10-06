import express,{ Request, Response } from 'express';
import { body, validationResult } from 'express-validator' ;
import { ValidateRequest, BadRequestError } from '@svpillai/common'
import { User } from '../models/user';
import { Password } from '../services/password';
import  jwt  from 'jsonwebtoken';

const router = express.Router();

//router.post('/api/users/signin', (req,res) => {
    
router.post('/api/users/signin',[ 
    body('email')
    .isEmail()
    .withMessage('Email must be valid'),
    body('password')
    .trim()
    .notEmpty()
    .withMessage('You must supply a password')
],
ValidateRequest,
 async (req: Request,res: Response) => {    

        const { email, password } = req.body;
    
        const existingUser = await User.findOne({ email });
    
        if (!existingUser) {
             
           throw new BadRequestError('Invalid Credentials');
           
        }
    
        const passwordMatch = await Password.compare(
            existingUser.password,
            password);
        if (!passwordMatch) {
             
                throw new BadRequestError('Invalid Credentials');
                
         }

        const userJWt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        },
        process.env.JWT_KEY!     
        );
    
        //Store it in session object
    
        req.session = {jwt: userJWt};
    
        res.status(200).send(existingUser);
     });

export { router as signinRouter };
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-requuest-error';
import { server } from 'typescript';
import { validateRequest } from '../middlewares/validate-request';
const router = express.Router();

router.post('/api/users/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const { email, password } = req.body;
        const existingUSer = await User.findOne({email});

        if(existingUSer){
            throw new BadRequestError('Email is in use');
        }

        const user = User.build({ email,password});
        await user.save();

        //Generate jwt
        const userJwt = jwt.sign({
            id: user.id,
            email:user.email
        },
            process.env.JWT_KEY!
        );

        req.session = {
            jwt: userJwt
        }


        //store it on session object

        res.status(201).send(user)
    }
);

export { router as signupRouter };

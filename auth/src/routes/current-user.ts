import express from 'express';
import { currentUser } from '@pri13sh/common';

const router = express.Router();

router.get('/api/users/currentuser',currentUser,(req: any,res: any)=>{
    res.send({currentUser:req.currentUser || null});
});

export { router as currentUserRouter };
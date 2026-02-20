import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { getMongoUser } from '../../middlewares/mongo-user.middleware.js';
import {
    likePost,
    unlikePost,
    checkLike,
    getPostLikes
} from './like.controller.js';

const router = Router();

// Ruta pública
router.get('/post/:postId', getPostLikes);

// Rutas protegidas
router.post('/', validateJWT, getMongoUser, likePost);
router.delete('/:postId', validateJWT, getMongoUser, unlikePost);
router.get('/check/:postId', validateJWT, getMongoUser, checkLike);

export default router;
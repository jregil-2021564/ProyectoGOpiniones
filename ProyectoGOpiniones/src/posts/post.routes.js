import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { getMongoUser, checkPostOwnership } from '../../middlewares/mongo-user.middleware.js';
import {
    createPost,
    getPosts,
    getPostById,
    getPostsByUser,
    updatePost,
    deletePost
} from './post.controller.js';

const router = Router();

// Rutas públicas
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/user/:userId', getPostsByUser);

// Rutas protegidas
router.post('/', validateJWT, getMongoUser, createPost);
router.put('/:id', validateJWT, getMongoUser, checkPostOwnership, updatePost);
router.delete('/:id', validateJWT, getMongoUser, checkPostOwnership, deletePost);

export default router;
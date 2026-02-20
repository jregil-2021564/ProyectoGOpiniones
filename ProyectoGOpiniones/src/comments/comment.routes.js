import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { getMongoUser, checkCommentOwnership } from '../../middlewares/mongo-user.middleware.js';
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment
} from './comment.controller.js';

const router = Router();

// Ruta pública
router.get('/post/:postId', getCommentsByPost);

// Rutas protegidas
router.post('/', validateJWT, getMongoUser, createComment);
router.put('/:id', validateJWT, getMongoUser, checkCommentOwnership, updateComment);
router.delete('/:id', validateJWT, getMongoUser, checkCommentOwnership, deleteComment);

export default router;
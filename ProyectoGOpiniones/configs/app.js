'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
// Ensure models are registered before DB sync
import '../src/users/user.model.js';
import '../src/auth/role.model.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import postRoutes from '../src/posts/post.routes.js';
// import commentRoutes from '../src/comments/comment.routes.js';
// import likeRoutes from '../src/likes/like.routes.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/users`, userRoutes);
  app.use(`${BASE_PATH}/posts`, postRoutes);
  // app.use(`${BASE_PATH}/comments`, commentRoutes);
  // app.use(`${BASE_PATH}/likes`, likeRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Proyecto GestionOpiniones Service',
    });
  });
  // 404 handler (standardized)
  app.use(notFound);
};

// Función para sincronizar usuarios de Sequelize a MongoDB
const syncSequelizeUsersToMongo = async () => {
  try {
    console.log('Verificando sincronización de usuarios...');
    
    // Importar modelos necesarios
    const { User: SequelizeUser } = await import('../src/users/user.model.js');
    const MongoUser = (await import('../src/users/mongo-user.model.js')).default;
    
    // Obtener todos los usuarios de Sequelize
    const sequelizeUsers = await SequelizeUser.findAll();
    console.log(`Usuarios encontrados en Sequelize: ${sequelizeUsers.length}`);
    
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const su of sequelizeUsers) {
      try {
        // Buscar si ya existe en MongoDB
        const existingUser = await MongoUser.findOne({ sequelizeId: su.Id });
        
        const userData = {
          sequelizeId: su.Id,
          name: su.Name || '',
          surname: su.Surname || '',
          username: su.Username,
          email: su.Email,
          isActive: su.Status || false
        };

        if (!existingUser) {
          // Crear nuevo usuario en MongoDB
          const newUser = new MongoUser(userData);
          await newUser.save();
          created++;
          console.log(`Usuario creado en MongoDB: ${su.Username}`);
        } else {
          // Verificar si necesita actualización
          let needsUpdate = false;
          
          if (existingUser.name !== userData.name ||
              existingUser.surname !== userData.surname ||
              existingUser.username !== userData.username ||
              existingUser.email !== userData.email ||
              existingUser.isActive !== userData.isActive) {
            
            Object.assign(existingUser, userData);
            await existingUser.save();
            updated++;
            console.log(`Usuario actualizado en MongoDB: ${su.Username}`);
          } else {
            skipped++;
          }
        }
      } catch (error) {
        console.error(`Error con usuario ${su.Username}:`, error.message);
      }
    }

    console.log('\n==== RESUMEN DE SINCRONIZACIÓN ====');
    console.log(`Creados: ${created}`);
    console.log(`Actualizados: ${updated}`);
    console.log(`⏭Sin cambios: ${skipped}`);
    console.log(`Total procesados: ${sequelizeUsers.length}`);
    console.log('=====================================\n');

  } catch (error) {
    console.error('Error en sincronización de usuarios:', error);
  }
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3005;
  app.set('trust proxy', 1);

  try {
    // Conectar a MongoDB
    await dbConnection();
    console.log('Conectado a MongoDB');
    
    // Sincronizar usuarios de Sequelize a MongoDB
    await syncSequelizeUsersToMongo();
    
    // Seed essential data (roles)
    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();
    console.log('Roles seed completado');
    
    // Asegurar que el usuario admin tenga rol ADMIN_ROLE
    const { ensureAdminUser } = await import('../helpers/admin-seed.js');
    await ensureAdminUser();
    console.log('Admin user asegurado');
    
    middlewares(app);
    routes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`\nServidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación API: http://localhost:${PORT}${BASE_PATH}/health`);
      console.log(`Endpoints disponibles:`);
      console.log(`   - Auth: ${BASE_PATH}/auth`);
      console.log(`   - Users: ${BASE_PATH}/users`);
      console.log(`   - Posts: ${BASE_PATH}/posts`);
      console.log(`   - Comments: ${BASE_PATH}/comments`);
      console.log(`   - Likes: ${BASE_PATH}/likes\n`);
    });
  } catch (err) {
    console.error(`Error iniciando servidor: ${err.message}`);
    process.exit(1);
  }
};
// scripts/sync-users.js
import { sequelize } from '../configs/db.js';
import { dbConnection } from '../db.js';
import { User as SequelizeUser } from '../src/users/user.model.js';
import MongoUser from '../src/users/mongo-user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const syncUsersToMongo = async () => {
    try {
        console.log('🔄 Conectando a bases de datos...');
        
        // Conectar a PostgreSQL (Sequelize)
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        
        // Conectar a MongoDB
        await dbConnection();
        console.log('✅ Conectado a MongoDB');

        console.log('\n📊 Iniciando sincronización de usuarios...\n');

        // Obtener todos los usuarios de Sequelize
        const sequelizeUsers = await SequelizeUser.findAll();
        console.log(`📝 Encontrados ${sequelizeUsers.length} usuarios en Sequelize\n`);

        let synced = 0;
        let updated = 0;
        let errors = 0;

        for (const su of sequelizeUsers) {
            try {
                // Buscar si ya existe en MongoDB
                const existingUser = await MongoUser.findOne({ 
                    sequelizeId: su.Id 
                });

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
                    synced++;
                    console.log(`✅ CREADO: ${su.Username} (${su.Id})`);
                } else {
                    // Actualizar datos existentes
                    let needsUpdate = false;
                    
                    if (existingUser.name !== userData.name) {
                        existingUser.name = userData.name;
                        needsUpdate = true;
                    }
                    if (existingUser.surname !== userData.surname) {
                        existingUser.surname = userData.surname;
                        needsUpdate = true;
                    }
                    if (existingUser.username !== userData.username) {
                        existingUser.username = userData.username;
                        needsUpdate = true;
                    }
                    if (existingUser.email !== userData.email) {
                        existingUser.email = userData.email;
                        needsUpdate = true;
                    }
                    if (existingUser.isActive !== userData.isActive) {
                        existingUser.isActive = userData.isActive;
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        await existingUser.save();
                        updated++;
                        console.log(`🔄 ACTUALIZADO: ${su.Username}`);
                    } else {
                        console.log(`⏭️  SIN CAMBIOS: ${su.Username}`);
                    }
                }
            } catch (error) {
                errors++;
                console.error(`❌ ERROR con usuario ${su.Username}:`, error.message);
            }
        }

        console.log('\n📊 ==== RESUMEN DE SINCRONIZACIÓN ====');
        console.log(`✅ Usuarios creados: ${synced}`);
        console.log(`🔄 Usuarios actualizados: ${updated}`);
        console.log(`❌ Errores: ${errors}`);
        console.log(`📝 Total procesados: ${sequelizeUsers.length}`);
        console.log('=====================================\n');

        // Mostrar algunos usuarios sincronizados como ejemplo
        const mongoUsers = await MongoUser.find().limit(5);
        console.log('📋 Ejemplo de usuarios en MongoDB:');
        mongoUsers.forEach(u => {
            console.log(`   - ${u.username} (Sequelize ID: ${u.sequelizeId})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal en sincronización:', error);
        process.exit(1);
    }
};

// Ejecutar sincronización
syncUsersToMongo();
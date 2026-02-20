// scripts/check-users.js
import { sequelize } from '../configs/db.js';
import { dbConnection } from '../db.js';
import { User as SequelizeUser } from '../src/users/user.model.js';
import MongoUser from '../src/users/mongo-user.model.js';

const checkUsers = async () => {
    try {
        await sequelize.authenticate();
        await dbConnection();

        console.log('\nVERIFICACIÓN DE USUARIOS\n');

        // Usuarios en Sequelize
        const sequelizeUsers = await SequelizeUser.findAll();
        console.log(`Usuarios en Sequelize (PostgreSQL): ${sequelizeUsers.length}`);
        sequelizeUsers.slice(0, 5).forEach(u => {
            console.log(`   - ${u.Username} (ID: ${u.Id})`);
        });

        // Usuarios en MongoDB
        const mongoUsers = await MongoUser.find();
        console.log(`\n🍃 Usuarios en MongoDB: ${mongoUsers.length}`);
        mongoUsers.slice(0, 5).forEach(u => {
            console.log(`   - ${u.username} (Sequelize ID: ${u.sequelizeId})`);
        });

        // Verificar sincronización
        const missingInMongo = [];
        for (const su of sequelizeUsers) {
            const exists = await MongoUser.findOne({ sequelizeId: su.Id });
            if (!exists) {
                missingInMongo.push(su.Username);
            }
        }

        if (missingInMongo.length > 0) {
            console.log(`\n⚠️  Usuarios faltantes en MongoDB: ${missingInMongo.length}`);
            missingInMongo.forEach(u => console.log(`   - ${u}`));
        } else {
            console.log('\n✅ Todos los usuarios están sincronizados');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
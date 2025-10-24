import { db } from '../lib/db/models';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    await db.ensureIndexes();
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Collections and indexes have been created.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase();

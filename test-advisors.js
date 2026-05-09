const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb+srv://developer:1YqM5pT07V1O0N9d@clusterqualityerp.tdm2x4h.mongodb.net/test');
  await client.connect();
  const db = client.db('test');
  // First, find the "asesor" role
  const role = await db.collection('roleusers').findOne({ name: 'asesor' });
  console.log("Role asesor ID:", role._id);
  
  // Find all users
  const users = await db.collection('users').find({}).toArray();
  for (const user of users) {
     if (user.roleId) {
        console.log(`User ${user.email} roleId:`, JSON.stringify(user.roleId));
     }
  }
  await client.close();
}
run().catch(console.error);

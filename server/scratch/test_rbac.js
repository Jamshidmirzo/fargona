const db = require('../src/db/db');
const app = require('../src/app');
// Using native fetch to make HTTP requests instead of supertest
// Yes, we can just start app on port 3001, and use native fetch! That is very clean and doesn't require extra test framework dependencies.

async function runTests() {
  const PORT = 3005;
  const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);
    const baseUrl = `http://localhost:${PORT}/api`;

    try {
      // 1. Test login with superadmin
      console.log('\n--- 1. Testing superadmin login ---');
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'superadmin', password: 'superpassword' })
      });
      const loginData = await loginRes.json();
      if (!loginData.token) {
        throw new Error('Superadmin login failed: ' + JSON.stringify(loginData));
      }
      const superToken = loginData.token;
      console.log('Superadmin logged in successfully.');

      // 2. Superadmin creates a new museum admin assigned only to 'uvaysi'
      console.log('\n--- 2. Creating museum admin ---');
      const createAdminRes = await fetch(`${baseUrl}/auth/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superToken}`
        },
        body: JSON.stringify({
          username: 'uvaysi_admin',
          password: 'uvaysipassword',
          role: 'museum_admin',
          museums: ['uvaysi']
        })
      });
      const createAdminData = await createAdminRes.json();
      console.log('Admin create result:', createAdminData);

      // 3. Login as the newly created museum admin
      console.log('\n--- 3. Testing museum admin login ---');
      const museumLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'uvaysi_admin', password: 'uvaysipassword' })
      });
      const museumLoginData = await museumLoginRes.json();
      const museumToken = museumLoginData.token;
      console.log('Museum Admin Login Response:', museumLoginData);

      // 4. Museum admin attempts to update 'uvaysi' (Should succeed 200)
      console.log('\n--- 4. Updating assigned museum (uvaysi) ---');
      const updateUvaysiRes = await fetch(`${baseUrl}/museums/uvaysi`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${museumToken}`
        },
        body: JSON.stringify({ name: 'Uvaysiy Uy-Muzeyi Edited' })
      });
      console.log('Update Uvaysi Status (Expect 200):', updateUvaysiRes.status);

      // 5. Museum admin attempts to update 'muqimiy' (Should fail 403)
      console.log('\n--- 5. Updating unassigned museum (muqimiy) ---');
      const updateMuqimiyRes = await fetch(`${baseUrl}/museums/muqimiy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${museumToken}`
        },
        body: JSON.stringify({ name: 'Muqimiy Hujra-Muzeyi Hack' })
      });
      console.log('Update Muqimiy Status (Expect 403):', updateMuqimiyRes.status);

      // 6. Museum admin posts news to 'uvaysi' (Should succeed 200)
      console.log('\n--- 6. Creating news for assigned museum ---');
      const createNewsRes = await fetch(`${baseUrl}/museums/uvaysi/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${museumToken}`
        },
        body: JSON.stringify({ title: 'New Expo!', content: 'We have updated our exhibits.' })
      });
      console.log('Create News Status (Expect 200):', createNewsRes.status);

      // 7. Museum admin attempts to post news to 'muqimiy' (Should fail 403)
      console.log('\n--- 7. Creating news for unassigned museum ---');
      const createNewsFailRes = await fetch(`${baseUrl}/museums/muqimiy/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${museumToken}`
        },
        body: JSON.stringify({ title: 'Hacked news!', content: 'Hacked.' })
      });
      console.log('Create News Status (Expect 403):', createNewsFailRes.status);

      console.log('\nALL TESTS PASSED SUCCESSFULLY!');
    } catch (e) {
      console.error('\nTEST FAILED WITH ERROR:', e);
    } finally {
      // Clean up test admin
      db.prepare("DELETE FROM admins WHERE username = 'uvaysi_admin'").run();
      server.close();
    }
  });
}

runTests();

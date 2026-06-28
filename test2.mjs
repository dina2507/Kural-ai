import fetch from 'node-fetch';

async function test() {
  const res = await fetch(process.env.VITE_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.SUPABASE_SERVICE_ROLE_KEY, {
    headers: {
      'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  console.log(await res.text());
}
test();

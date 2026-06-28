import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Extensive plastic pollution in water body',
      description: 'A large quantity of plastic waste...',
      category: 'garbage',
      severity: 9,
      latitude: 12.7636,
      longitude: 77.8375,
      images: [],
      aiTags: [],
      aiAnalysis: {}
    })
  });
  const data = await res.json();
  console.log(data);
}

test();

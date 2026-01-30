import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'people.json');

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch { return []; }
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export async function handler(event) {
  const password = process.env.ADMIN_PASSWORD || 'admin';

  if (event.httpMethod === 'GET') {
    const { name, year, class: cls, title, stage } = event.queryStringParameters || {};
    let people = readDB();

    if (typeof name === 'string' && name.trim() !== '') people = people.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    if (typeof year === 'string' && year.trim() !== '') people = people.filter(p => String(p.birth_year) === year);
    if (typeof cls === 'string' && cls.trim() !== '') people = people.filter(p => String(p.class) === cls);
    if (typeof title === 'string' && title.trim() !== '') people = people.filter(p => p.title.toLowerCase().includes(title.toLowerCase()));
    if (typeof stage === 'string' && stage.trim() !== '') people = people.filter(p => p.stage === stage);

    return { statusCode: 200, body: JSON.stringify(people) };
  }

  const body = JSON.parse(event.body || '{}');
  if (body.password !== password) return { statusCode: 403, body: 'Wrong password' };

  let people = readDB();

  if (event.httpMethod === 'POST') {
    const id = people.length ? people[people.length-1].id + 1 : 1;
    people.push({
      id,
      namePerson: body.namePerson,
      birth_year: body.birth_year,
      classNum: body.classNum,
      title: body.title,
      stage: body.stage,
      photos: body.photos || []
    });
    writeDB(people);
    return { statusCode: 200, body: 'Added' };
  }

  if (event.httpMethod === 'DELETE') {
    people = people.filter(p => p.id !== body.id);
    writeDB(people);
    return { statusCode: 200, body: 'Deleted' };
  }

  return { statusCode: 405, body: 'Method not allowed' };
}  
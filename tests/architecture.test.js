const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('NETSO OS production boundaries', () => {
  test('publishable Supabase client contains no service-role credential', () => {
    const db = read('db.js');
    expect(db).not.toMatch(/service_role/i);
  });

  test('operational schema defines core tables and RLS', () => {
    const schema = read('supabase/schema.sql');
    for (const table of ['customers','projects','tasks','financing_cases','risks','decisions','documents']) {
      expect(schema).toContain(`create table public.${table}`);
      expect(schema).toContain(`alter table public.${table} enable row level security`);
    }
  });

  test('evidence hierarchy prevents unverified data from being treated as fact', () => {
    const schema = read('supabase/schema.sql');
    for (const level of ['VERIFIED','LOI','ESTIMATE','ASSUMPTION','HYPOTHESIS','UNVERIFIED','TBD']) {
      expect(schema).toContain(`'${level}'`);
    }
  });
});

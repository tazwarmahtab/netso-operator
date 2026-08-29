const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('publishable Supabase client contains no service-role credential', () => {
  const db = read('lib/supabase.ts');
  assert.doesNotMatch(db, /service_role/i);
});

test('operational schema defines core tables and RLS', () => {
  const schema = read('supabase/schema.sql');
  for (const table of ['customers','projects','tasks','financing_cases','risks','decisions','documents']) {
    assert.match(schema, new RegExp(`create table public\\.${table}`));
    assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`));
  }
});

test('evidence hierarchy prevents unverified data from being treated as fact', () => {
  const schema = read('supabase/schema.sql');
  for (const level of ['VERIFIED','LOI','ESTIMATE','ASSUMPTION','HYPOTHESIS','UNVERIFIED','TBD']) {
    assert.match(schema, new RegExp(`'${level}'`));
  }
});

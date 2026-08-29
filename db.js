/* NETSO OS — Supabase persistence layer
 * Public/publishable key only. No service-role credentials belong in the browser.
 */
const NETSO_SUPABASE_URL = 'https://lxxmxievulwbgorjtkhx.supabase.co';
const NETSO_SUPABASE_KEY = 'sb_publishable_9l5urOhINjNpnlC5PxS_3A_ObMLb_v3';
const netsoDb = window.supabase.createClient(NETSO_SUPABASE_URL, NETSO_SUPABASE_KEY);

const stageMap = {
  PROSPECT:'Prospect', QUALIFIED:'Qualified', SITE_SURVEY:'Site Survey',
  TECHNICAL_QUALIFIED:'Technical Qualified', PROPOSAL:'Proposal', LOI:'LOI',
  PPA_NEGOTIATION:'PPA Negotiation', EXECUTED_PPA:'Executed PPA', FINANCING:'Financing',
  PROCUREMENT:'Procurement', CONSTRUCTION:'Construction', COMMISSIONED:'Commissioned',
  OPERATING:'Operating', LOST:'Lost'
};

async function netsoSession(){
  const { data } = await netsoDb.auth.getSession();
  return data.session;
}

async function loadNetsoData(){
  const session = await netsoSession();
  if(!session) return false;
  const [{data: tasks, error: taskError}, {data: projects, error: projectError}, {data: finance, error: financeError}] = await Promise.all([
    netsoDb.from('tasks').select('*').order('priority').order('due_date', {ascending:true, nullsFirst:false}),
    netsoDb.from('projects').select('*').order('updated_at', {ascending:false}),
    netsoDb.from('financing_cases').select('*').order('updated_at', {ascending:false})
  ]);
  if(taskError || projectError || financeError){ console.error('NETSO OS data load failed', {taskError, projectError, financeError}); return false; }

  state.tasks = (tasks || []).map(t => ({
    id:t.id, name:t.title, meta:[t.workstream,t.owner].filter(Boolean).join(' · ') || 'Unassigned',
    tag:t.priority, status:t.status === 'IN_PROGRESS' ? 'Active' : t.status === 'BLOCKED' ? 'Blocked' : t.status,
    impact:t.impact || 'TBD', class:t.strategic_action || 'TBD', due:t.due_date || 'TBD', blocked:t.status === 'BLOCKED'
  }));
  state.projects = (projects || []).map(p => ({
    id:p.id, name:p.name, size:p.capacity_kw ? `${p.capacity_kw} kWp` : 'TBD',
    stage:stageMap[p.stage] || p.stage, progress:progressForStage(p.stage), truth:p.evidence_level,
    ppr:p.ppa_rate_bdt_per_kwh ? `BDT ${p.ppa_rate_bdt_per_kwh}/kWh` : 'TBD',
    term:p.ppa_term_years ? `${p.ppa_term_years} years` : 'TBD',
    generation:p.annual_generation_kwh ? `${Number(p.annual_generation_kwh).toLocaleString()} kWh/yr` : 'TBD',
    capex:p.capex_bdt ? `BDT ${Number(p.capex_bdt).toLocaleString()}` : 'TBD'
  }));
  state.finance = (finance || []).map(f => ({name:f.provider_name, stage:f.stage, next:f.next_action || 'TBD', truth:f.evidence_level}));
  return true;
}

function progressForStage(stage){
  const order=['PROSPECT','QUALIFIED','SITE_SURVEY','TECHNICAL_QUALIFIED','PROPOSAL','LOI','PPA_NEGOTIATION','EXECUTED_PPA','FINANCING','PROCUREMENT','CONSTRUCTION','COMMISSIONED','OPERATING'];
  const i=order.indexOf(stage); return i < 0 ? 0 : Math.round((i/(order.length-1))*100);
}

function authScreen(){
  document.getElementById('root').innerHTML = `<div class="auth-shell"><div class="auth-card"><div class="brand"><strong>NETSO OS</strong><span>CEO Command Center</span></div><h1>Sign in</h1><p>Access the operational system. Data is protected by Supabase authentication and row-level security.</p><form id="authForm"><input id="authEmail" type="email" required placeholder="Founder email"><input id="authPassword" type="password" required minlength="6" placeholder="Password"><button class="btn primary" type="submit">Sign in</button><button class="btn" type="button" id="signupBtn">Create account</button><div id="authError" class="auth-error"></div></form></div></div>`;
  document.getElementById('authForm').onsubmit=async e=>{e.preventDefault(); const email=authEmail.value.trim(), password=authPassword.value; const {error}=await netsoDb.auth.signInWithPassword({email,password}); if(error) authError.textContent=error.message; else bootNetso();};
  document.getElementById('signupBtn').onclick=async()=>{const email=authEmail.value.trim(), password=authPassword.value; if(!email||password.length<6){authError.textContent='Enter an email and a password of at least 6 characters.';return;} const {error}=await netsoDb.auth.signUp({email,password}); authError.textContent=error?error.message:'Account created. Check your email if confirmation is enabled, then sign in.';};
}

async function bootNetso(){
  const session=await netsoSession();
  if(!session){authScreen();return;}
  await loadNetsoData(); render();
}

const originalNewTask = window.newTask;
window.newTask = async function(){
  const session=await netsoSession(); if(!session){authScreen();return;}
  const name=prompt('New task name'); if(!name)return;
  const {error}=await netsoDb.from('tasks').insert({title:name, priority:'P1', status:'TODO', impact:'Medium', strategic_action:'EXPERIMENT', evidence_level:'TBD'});
  if(error){alert(`Could not save task: ${error.message}`);return;}
  await loadNetsoData(); state.screen='Tasks'; render();
};

window.addEventListener('load', bootNetso);

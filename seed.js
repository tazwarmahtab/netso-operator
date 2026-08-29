/* NETSO OS — first-login seed. Only approved Netso context is seeded. */
async function seedNetsoOnce(){
  const session=await netsoSession();
  if(!session)return;
  const {count}=await netsoDb.from('projects').select('id',{count:'exact',head:true});
  if((count||0)>0)return;
  const {data:customer,error:ce}=await netsoDb.from('customers').insert({name:'Chittagong Grammar School',segment:'Education',location:'Chattogram',commercial_status:'LOI',evidence_level:'LOI'}).select('id').single();
  if(ce){console.error(ce);return;}
  const {data:project,error:pe}=await netsoDb.from('projects').insert({customer_id:customer.id,name:'Chittagong Grammar School — 80 kWp',location:'Chattogram',stage:'LOI',capacity_kw:80,annual_generation_kwh:115632,ppa_rate_bdt_per_kwh:10,ppa_term_years:20,evidence_level:'LOI',next_gate:'Execute PPA and complete technical/structural validation',blocker:'PPA execution + technical validation'}).select('id').single();
  if(pe){console.error(pe);return;}
  const tasks=[
    ['Convert CGS 80 kWp LOI into executed PPA','P0','Critical','Commercial','SCALE'],
    ['Finalize project financial model','P0','Critical','Finance','SCALE'],
    ['Resolve IDCOL / PFI guarantee requirements','P0','Critical','Financing','SCALE'],
    ['Complete GuarantCo consolidated submission','P0','High','Financing','SCALE'],
    ['Validate CGS technical + structural assumptions','P1','High','Technical','SCALE'],
    ['Build qualified target list of next 20–50 customers','P1','High','Commercial','SCALE']
  ];
  await netsoDb.from('tasks').insert(tasks.map(x=>({title:x[0],priority:x[1],status:'TODO',impact:x[2],workstream:x[3],strategic_action:x[4],project_id:project.id,evidence_level:'TBD'})));
  await netsoDb.from('financing_cases').insert([
    {project_id:project.id,provider_name:'IDCOL / PFI',provider_type:'Development finance / bank',stage:'REQUIREMENTS',next_action:'Validate financing and security structure',evidence_level:'TBD'},
    {project_id:project.id,provider_name:'GuarantCo',provider_type:'Guarantee provider',stage:'SUBMITTED',next_action:'Complete consolidated project pack',evidence_level:'TBD'},
    {provider_name:'Investor capital',provider_type:'Equity / SAFE',stage:'CONTACTED',next_action:'Finalize investor one-pager and deck',evidence_level:'TBD'}
  ]);
}

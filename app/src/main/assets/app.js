const seedTasks = [
  {id:1,title:'Check if Sony WH-1000XM6 is in stock',location:'Connaught Place, Delhi',proof:'Photo + price proof',reward:60,time:'1 hour',status:'Open'},
  {id:2,title:'Verify parking availability near clinic',location:'Sector 18, Noida',proof:'Photo + answer',reward:40,time:'30 min',status:'Open'},
  {id:3,title:'Check current road condition outside property',location:'Indirapuram, Ghaziabad',proof:'Video + answer',reward:80,time:'Today',status:'Assigned'}
];
let tasks = JSON.parse(localStorage.getItem('groundcheck_tasks')||'null') || seedTasks;
let wallet = Number(localStorage.getItem('groundcheck_wallet')||320);

const $ = id => document.getElementById(id);
const toast = msg => { const t=$('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); };
function save(){ localStorage.setItem('groundcheck_tasks',JSON.stringify(tasks)); localStorage.setItem('groundcheck_wallet',wallet); }
function render(){
  $('openTaskCount').textContent = tasks.filter(t=>t.status==='Open').length;
  $('walletBalance').textContent = `₹${wallet}`;
  $('adminTaskCount').textContent = tasks.length;
  $('myTasks').innerHTML = tasks.map(taskCard).join('');
  $('nearbyTasks').innerHTML = tasks.filter(t=>t.status==='Open').map(t=>taskCard(t,true)).join('') || '<p class="muted">No open tasks right now.</p>';
  $('adminTasks').innerHTML = tasks.map(t=>taskCard(t,false,true)).join('');
}
function taskCard(t,earner=false,admin=false){
  const action = earner ? `<button class="small-btn" onclick="acceptTask(${t.id})">Accept task</button>` : admin ? `<button class="small-btn" onclick="toggleStatus(${t.id})">Change status</button>` : '';
  return `<div class="task"><div><h4>${escapeHtml(t.title)}</h4><p>${escapeHtml(t.location)}</p><div class="meta"><span class="chip">${escapeHtml(t.proof)}</span><span class="chip">${escapeHtml(t.time)}</span><span class="chip">${escapeHtml(t.status)}</span></div>${action}</div><div class="reward">₹${t.reward}</div></div>`;
}
function escapeHtml(str=''){return str.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

$('taskForm').addEventListener('submit',e=>{
  e.preventDefault();
  const task={
    id:Date.now(),
    title:$('taskTitle').value.trim(),
    location:$('taskLocation').value.trim(),
    proof:$('taskProof').value,
    reward:Number($('taskReward').value),
    time:$('taskTime').value,
    status:'Open'
  };
  tasks.unshift(task); save(); render(); e.target.reset(); $('taskReward').value=50; toast('GroundCheck posted successfully');
});

window.acceptTask = id => {
  const t=tasks.find(x=>x.id===id); if(!t) return;
  t.status='Assigned'; save(); render(); toast('Task accepted. Proof submission flow is next.');
};
window.toggleStatus = id => {
  const t=tasks.find(x=>x.id===id); if(!t) return;
  const order=['Open','Assigned','Submitted','Approved'];
  t.status=order[(order.indexOf(t.status)+1)%order.length];
  if(t.status==='Approved') wallet += Math.round(t.reward*0.8);
  save(); render(); toast(`Task moved to ${t.status}`);
};

const setView=id=>{
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  $(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
};
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.tab)));
$('adminBtn').addEventListener('click',()=>setView('adminView'));
$('backFromAdmin').addEventListener('click',()=>setView('requesterView'));
$('modeBtn').addEventListener('click',()=>{
  const requester=$('requesterView').classList.contains('active');
  setView(requester?'earnerView':'requesterView');
  $('modeBtn').textContent=requester?'Switch to Requester':'Switch to Earner';
});
render();


/* ── PAGE NAV ── */
const pageMeta={
  dashboard:  {title:'Dashboard',       sub:'Welcome back, Dr. Perera'},
  assigned:   {title:'Assigned Proposals', sub:'Manage student research proposals'},
  pending:    {title:'Pending Reviews', sub:'Proposals awaiting your review'},
  complete:   {title:'Complete Reviews', sub:'Reviewed and finalized proposals'},
  evaluation: {title:'Evaluation Form', sub:'Grade and assess student research'},
  report:     {title:'Research Report', sub:'Analytics and research summaries'},
  messages:   {title:'Messages',        sub:'Communicate with your students'},
  settings:   {title:'Settings',        sub:'Manage your account preferences'},
};

function showPage(name, btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  btn.classList.add('active');
  const m=pageMeta[name];
  document.getElementById('pageTitle').textContent=m.title;
  document.getElementById('pageSubtitle').textContent=m.sub;
}

/* ── TABLE FILTER ── */
function filterTable(tbodyId, q){
  const rows=document.getElementById(tbodyId).querySelectorAll('tr');
  rows.forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
}
function filterByStatus(tbodyId, status){
  const rows=document.getElementById(tbodyId).querySelectorAll('tr');
  rows.forEach(r=>{r.style.display=!status||r.textContent.includes(status)?'':'none';});
}

/* ── EVALUATION TOTAL ── */
function calcTotal(){
  const inputs=document.querySelectorAll('#page-evaluation .score-item input');
  let total=0;
  inputs.forEach(i=>{total+=parseInt(i.value)||0;});
  document.getElementById('totalScore').textContent=total+' / 100';
}

/* ── VIEW MODAL (Assigned Proposals) ── */
let _currentViewData = null;

function openViewModal(data){
  _currentViewData = data;
  const statusMap={
    Pending:'<span class="badge badge-pending"><i class="fa-solid fa-clock"></i>Pending</span>',
    Approved:'<span class="badge badge-approved"><i class="fa-solid fa-check"></i>Approved</span>',
    Rejected:'<span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i>Rejected</span>',
    'In Review':'<span class="badge badge-review"><i class="fa-solid fa-eye"></i>In Review</span>',
  };
  document.getElementById('viewModalBody').innerHTML=`
    <div class="view-student-header">
      <img src="${data.avatar}" alt="${data.student}" class="view-student-avatar">
      <div class="view-student-meta">
        <h4>${data.student}</h4>
        <span>Supervisor: ${data.supervisor}</span>
      </div>
      <div style="margin-left:auto;">${statusMap[data.status]||data.status}</div>
    </div>
    <div class="view-details-grid">
      <div class="view-detail-item">
        <label><i class="fa-solid fa-file-lines"></i>Research Title</label>
        <span>${data.title}</span>
      </div>
      <div class="view-detail-item">
        <label><i class="fa-regular fa-calendar"></i>Submitted Date</label>
        <span>${data.date}</span>
      </div>
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-flask"></i>Research Field</label>
        <span>${data.field||'—'}</span>
      </div>
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-bullseye"></i>Research Objective</label>
        <span>${data.objective||data.desc}</span>
      </div>
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-diagram-project"></i>Methodology</label>
        <span>${data.method||'—'}</span>
      </div>
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-tags"></i>Keywords</label>
        <div class="keyword-tags">${(data.keywords||'').split(',').map(k=>`<span class="keyword-tag">${k.trim()}</span>`).join('')}</div>
      </div>
    </div>`;
  document.getElementById('viewModalOverlay').classList.add('open');
}
function closeViewModal(){document.getElementById('viewModalOverlay').classList.remove('open');}
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('viewModalOverlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeViewModal();});

  /* ── REVIEW MODAL ── */
  document.getElementById('reviewModalOverlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeReviewModal();});
});

function openReviewModal(){
  closeViewModal();
  // populate mini student info strip
  if(_currentViewData){
    const statusMap={
      Pending:'<span class="badge badge-pending"><i class="fa-solid fa-clock"></i>Pending</span>',
      Approved:'<span class="badge badge-approved"><i class="fa-solid fa-check"></i>Approved</span>',
      Rejected:'<span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i>Rejected</span>',
      'In Review':'<span class="badge badge-review"><i class="fa-solid fa-eye"></i>In Review</span>',
    };
    document.getElementById('reviewStudentInfo').innerHTML=`
      <div class="review-proposal-strip">
        <img src="${_currentViewData.avatar}" alt="">
        <div>
          <strong>${_currentViewData.student}</strong>
          <span>${_currentViewData.title}</span>
        </div>
        <div style="margin-left:auto;">${statusMap[_currentViewData.status]||''}</div>
      </div>`;
  }
  // reset form
  document.querySelectorAll('input[name="reviewDecision"]').forEach(r=>r.checked=false);
  document.querySelectorAll('.decision-card').forEach(c=>c.classList.remove('selected'));
  ['markQuality','markMethod','markLit','markPres'].forEach(id=>{document.getElementById(id).value='';});
  document.getElementById('reviewTotal').textContent='0 / 100';
  document.getElementById('reviewComment').value='';
  document.getElementById('reviewModalOverlay').classList.add('open');
}
function closeReviewModal(){document.getElementById('reviewModalOverlay').classList.remove('open');}

function selectDecision(radio){
  document.querySelectorAll('.decision-card').forEach(c=>c.classList.remove('selected'));
  radio.closest('.decision-option').querySelector('.decision-card').classList.add('selected');
}

function calcReviewTotal(){
  const ids=['markQuality','markMethod','markLit','markPres'];
  let total=0;
  ids.forEach(id=>{total+=parseInt(document.getElementById(id).value)||0;});
  const el=document.getElementById('reviewTotal');
  el.textContent=total+' / 100';
  el.style.color=total>=75?'#10B981':total>=50?'#F59E0B':'#EF4444';
}

function submitReview(){
  const decision=document.querySelector('input[name="reviewDecision"]:checked');
  if(!decision){alert('Please select Approve or Reject.');return;}
  const total=parseInt(document.getElementById('reviewTotal').textContent)||0;
  const comment=document.getElementById('reviewComment').value.trim();
  if(!comment){alert('Please add a comment/feedback.');return;}
  closeReviewModal();
  const toast=document.getElementById('reviewToast');
  document.getElementById('reviewToastMsg').textContent=`Review submitted — ${decision.value} (${total}/100)`;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),3500);
}

/* ── MODAL ── */
function openModal(data){
  const statusMap={
    Pending:'<span class="badge badge-pending"><i class="fa-solid fa-clock"></i>Pending</span>',
    Approved:'<span class="badge badge-approved"><i class="fa-solid fa-check"></i>Approved</span>',
    Rejected:'<span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i>Rejected</span>',
    'In Review':'<span class="badge badge-review"><i class="fa-solid fa-eye"></i>In Review</span>',
  };
  document.getElementById('modalBody').innerHTML=`
    <div class="modal-row"><i class="fa-solid fa-file-lines"></i><div><label>Research Title</label><span>${data.title}</span></div></div>
    <div class="modal-row"><i class="fa-solid fa-user-graduate"></i><div><label>Student</label><span>${data.student}</span></div></div>
    <div class="modal-row"><i class="fa-regular fa-calendar"></i><div><label>Submitted Date</label><span>${data.date}</span></div></div>
    <div class="modal-row"><i class="fa-solid fa-tag"></i><div><label>Status</label><span>${statusMap[data.status]||data.status}</span></div></div>
    <div class="modal-row"><i class="fa-solid fa-user-tie"></i><div><label>Supervisor</label><span>${data.supervisor}</span></div></div>
    <div class="modal-row"><i class="fa-solid fa-align-left"></i><div><label>Description</label><span>${data.desc}</span></div></div>`;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(){document.getElementById('modalOverlay').classList.remove('open');}
document.getElementById('modalOverlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
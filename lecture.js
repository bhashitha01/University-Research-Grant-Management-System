/* ══════════════════════════════════════════════════════
   ResearchDesk — lecture.js   (complete rewrite v3)
   All data fetched live from PHP API endpoints
══════════════════════════════════════════════════════ */

/* ── PAGE META ── */
const pageMeta = {
  dashboard:  { title:'Dashboard',           sub:'Overview of your research management' },
  assigned:   { title:'Assigned Proposals',   sub:'Manage student research proposals'    },
  pending:    { title:'Pending Reviews',      sub:'Proposals awaiting your review'       },
  complete:   { title:'Complete Reviews',     sub:'Reviewed and finalised proposals'     },
  evaluation: { title:'Evaluation Form',      sub:'Grade and assess student research'    },
  report:     { title:'Research Report',      sub:'Analytics and research summaries'     },
  settings:   { title:'Settings',             sub:'Manage your account preferences'      },
};

/* ── PAGE NAVIGATION ── */
function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  const m = pageMeta[name];
  if (m) {
    document.getElementById('pageTitle').textContent    = m.title;
    document.getElementById('pageSubtitle').textContent = m.sub;
  }
  if (name === 'assigned')   loadAssigned();
  if (name === 'pending')    loadPending();
  if (name === 'complete')   loadComplete();
  if (name === 'evaluation') loadEvalProposals();
  if (name === 'report')     { loadStats(); loadReport(); }
}

function navTo(name) {
  const idx = { assigned:2, pending:3, complete:4, evaluation:5, report:6, settings:7 };
  const btn = document.querySelector(`.nav-btn:nth-child(${idx[name]})`);
  showPage(name, btn);
}

/* ── FIX 1: REFRESH BUTTON with spin animation ── */
function doRefresh() {
  const icon = document.getElementById('refreshIcon');
  icon.classList.add('fa-spin');
  loadAll().finally(() => {
    setTimeout(() => icon.classList.remove('fa-spin'), 600);
  });
}

async function loadAll() {
  await Promise.all([
    loadStats(),
    (function() {
      const active = document.querySelector('.page.active')?.id?.replace('page-', '');
      if (active === 'assigned')   return loadAssigned();
      if (active === 'pending')    return loadPending();
      if (active === 'complete')   return loadComplete();
      if (active === 'evaluation') return loadEvalProposals();
      if (active === 'report')     return Promise.all([loadReport()]);
      return Promise.resolve();
    })()
  ]);
}

/* ── API FETCH HELPER ── */
async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  if (d.error) throw new Error(d.error);
  return d;
}

/* ── HTML HELPERS ── */
function statusBadge(s) {
  const map = {
    Pending:    `<span class="badge badge-pending"><i class="fa-solid fa-clock"></i>Pending</span>`,
    Approved:   `<span class="badge badge-approved"><i class="fa-solid fa-check"></i>Approved</span>`,
    Rejected:   `<span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i>Rejected</span>`,
    'In Review':`<span class="badge badge-review"><i class="fa-solid fa-eye"></i>In Review</span>`,
  };
  return map[s] || `<span class="badge">${s}</span>`;
}

function scoreColor(n) {
  return n >= 75 ? '#10B981' : n >= 50 ? '#F59E0B' : '#EF4444';
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarCell(row) {
  return `<div class="student-avatar-initials">${initials(row.Name)}</div>`;
}

function studentCell(row) {
  return `<div class="student-cell">
    ${avatarCell(row)}
    <div><strong>${row.Name}</strong><span>${row.userID}</span></div>
  </div>`;
}

function fileIcon(fname) {
  if (!fname) return '';
  const ext = (fname.split('.').pop() || '').toLowerCase();
  const cls = { pdf:'fa-file-pdf', docx:'fa-file-word', doc:'fa-file-word',
                jpg:'fa-file-image', jpeg:'fa-file-image', png:'fa-file-image' };
  return `<i class="fa-regular ${cls[ext] || 'fa-file'}" style="color:#2F5DD3;"></i>`;
}

function loadingRow(colspan) {
  return `<tr><td colspan="${colspan}" class="loading-placeholder"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</td></tr>`;
}
function emptyRow(colspan, msg = 'No records found.') {
  return `<tr><td colspan="${colspan}"><div class="empty-state"><i class="fa-solid fa-inbox"></i><p>${msg}</p></div></td></tr>`;
}

/* ── CLAMP MARKS ── */
function clampMark(el, max) {
  const v = parseInt(el.value);
  if (isNaN(v) || v < 0) el.value = 0;
  else if (v > max)      el.value = max;
}

/* ══════════════════════════════════════════
   DASHBOARD STATS — FIX 2: lecturer-specific
══════════════════════════════════════════ */
async function loadStats() {
  try {
    const d = await apiFetch('api/get_stats.php');

    setText('stat-total',    d.total);
    setText('stat-pending',  d.pending);
    setText('stat-complete', d.complete);
    setText('stat-overdue',  d.overdue);

    setText('badge-assigned', d.total);
    setText('badge-pending',  d.pending);
    setText('badge-complete', d.complete);

    const ar   = d.total ? pct(d.approved, d.total) : 0;
    const rc   = d.total ? pct(d.complete, d.total) : 0;
    const pend = d.total ? pct(d.pending,  d.total) : 0;
    const rej  = d.total ? pct(d.rejected, d.total) : 0;

    setBar('ov-approval',  ar);
    setBar('ov-complete',  rc);
    setBar('ov-pending',   pend);
    setBar('ov-rejected',  rej);
    setBar('rpt-ar',  ar);
    setBar('rpt-rc',  rc);
    setBar('rpt-pend', pend);
    setBar('rpt-ov',  rej);

    setText('rpt-total',    d.total);
    setText('rpt-approved', d.approved);
    setText('rpt-rejected', d.rejected);

    // Recent submissions
    const el = document.getElementById('dash-recent');
    if (!el) return;
    if (!d.recent?.length) { el.innerHTML = '<p style="color:#aaa;font-size:13px;padding:10px 0;">No submissions yet.</p>'; return; }
    el.innerHTML = d.recent.map(r => `
      <div class="notif-item">
        <div class="notif-icon-wrap blue"><i class="fa-solid fa-file-lines"></i></div>
        <div class="notif-body">
          <strong>${r.Name}</strong>
          <p>${r.title}</p>
          <div class="notif-time"><i class="fa-regular fa-clock" style="margin-right:4px;"></i>${fmtDate(r.created_at)}</div>
        </div>
        ${statusBadge(r.status)}
      </div>`).join('');
  } catch(e) { console.error('Stats error:', e.message); }
}

function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setBar(id, pctVal) {
  const bar = document.getElementById(id + '-bar');
  const lbl = document.getElementById(id);
  if (bar) bar.style.width = pctVal + '%';
  if (lbl) lbl.textContent = pctVal + '%';
}

function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB');
}

/* ══════════════════════════════════════════
   ASSIGNED PROPOSALS — FIX 3: correct columns
══════════════════════════════════════════ */
async function loadAssigned() {
  const search = document.getElementById('assigned-search')?.value?.trim() || '';
  const status = document.getElementById('assigned-status')?.value || '';
  const sort   = document.getElementById('assigned-sort')?.value || 'created_at';

  document.getElementById('assigned-tbody').innerHTML = loadingRow(8);
  try {
    const d = await apiFetch(`api/get_proposals.php?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&sort=${sort}&dir=DESC`);
    const rows = d.data || [];
    if (!rows.length) { document.getElementById('assigned-tbody').innerHTML = emptyRow(8, 'No proposals found.'); return; }

    document.getElementById('assigned-tbody').innerHTML = rows.map(row => {
      const fileCell = row.file_name
        ? `<a href="api/get_file.php?id=${row.id}" target="_blank" class="file-link-mini" title="${row.file_name.split('/').pop()}">${fileIcon(row.file_name)} View</a>`
        : `<span style="color:#ccc;font-size:12px;">None</span>`;
      return `<tr>
        <td>${studentCell(row)}</td>
        <td><div class="title-cell"><i class="fa-solid fa-file-lines"></i>${row.title}</div></td>
        <td><span class="course-tag">${row.course_type || '—'}</span></td>
        <td>${row.duration} mo.</td>
        <td>${row.submitted}</td>
        <td>${fileCell}</td>
        <td>${statusBadge(row.status)}</td>
        <td><button class="btn-view" onclick='openViewModal(${safeJson(row)})'><i class="fa-solid fa-eye"></i> View</button></td>
      </tr>`;
    }).join('');
  } catch(e) {
    document.getElementById('assigned-tbody').innerHTML = `<tr><td colspan="8" style="color:#EF4444;padding:16px;text-align:center;">${e.message}</td></tr>`;
  }
}

/* ══════════════════════════════════════════
   PENDING REVIEWS — FIX 4: no priority column
══════════════════════════════════════════ */
async function loadPending() {
  const search  = document.getElementById('pending-search')?.value?.trim() || '';
  const sortVal = document.getElementById('pending-sort')?.value || 'created_at|DESC';
  const [sort, dir] = sortVal.split('|');

  document.getElementById('pending-tbody').innerHTML = loadingRow(6);
  try {
    const d = await apiFetch(`api/get_proposals.php?search=${encodeURIComponent(search)}&status=Pending&sort=${sort}&dir=${dir}`);
    const rows = d.data || [];
    if (!rows.length) { document.getElementById('pending-tbody').innerHTML = emptyRow(6, 'No pending reviews! All caught up 🎉'); return; }

    document.getElementById('pending-tbody').innerHTML = rows.map(row => `
      <tr>
        <td>${studentCell(row)}</td>
        <td><div class="title-cell"><i class="fa-solid fa-file-lines"></i>${row.title}</div></td>
        <td><span class="course-tag">${row.course_type || '—'}</span></td>
        <td>${row.submitted}</td>
        <td>${row.due_date}</td>
        <td><button class="btn-view" onclick='openViewModal(${safeJson(row)})'><i class="fa-solid fa-eye"></i> View</button></td>
      </tr>`).join('');
  } catch(e) {
    document.getElementById('pending-tbody').innerHTML = `<tr><td colspan="6" style="color:#EF4444;padding:16px;text-align:center;">${e.message}</td></tr>`;
  }
}

/* ══════════════════════════════════════════
   COMPLETE REVIEWS — FIX 5: correct display
══════════════════════════════════════════ */
async function loadComplete() {
  const search  = document.getElementById('complete-search')?.value?.trim() || '';
  const result  = document.getElementById('complete-result')?.value || '';
  const sortVal = document.getElementById('complete-sort')?.value || 'reviewed_at|DESC';
  const [sort, dir] = sortVal.split('|');

  document.getElementById('complete-tbody').innerHTML = loadingRow(7);
  try {
    const statusParam = result || 'Approved'; // if empty, fetch both via two requests
    let rows = [];
    if (result) {
      const d = await apiFetch(`api/get_proposals.php?search=${encodeURIComponent(search)}&status=${result}&sort=${sort}&dir=${dir}`);
      rows = d.data || [];
    } else {
      const [da, dr] = await Promise.all([
        apiFetch(`api/get_proposals.php?search=${encodeURIComponent(search)}&status=Approved&sort=${sort}&dir=${dir}`),
        apiFetch(`api/get_proposals.php?search=${encodeURIComponent(search)}&status=Rejected&sort=${sort}&dir=${dir}`)
      ]);
      rows = [...(da.data || []), ...(dr.data || [])];
      // re-sort merged
      rows.sort((a, b) => {
        const av = a[sort] || '', bv = b[sort] || '';
        return dir === 'DESC' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
      });
    }

    if (!rows.length) { document.getElementById('complete-tbody').innerHTML = emptyRow(7, 'No completed reviews yet.'); return; }

    document.getElementById('complete-tbody').innerHTML = rows.map(row => `
      <tr>
        <td>${studentCell(row)}</td>
        <td><div class="title-cell"><i class="fa-solid fa-file-lines"></i>${row.title}</div></td>
        <td>${row.submitted}</td>
        <td>${row.eval_date_fmt || (row.reviewed_at ? fmtDate(row.reviewed_at) : '—')}</td>
        <td><strong style="color:${scoreColor(row.total_score)};font-size:15px;">${row.total_score}<small>/100</small></strong></td>
        <td>${statusBadge(row.status)}</td>
        <td><button class="btn-view" onclick='openCompleteModal(${safeJson(row)})'><i class="fa-solid fa-eye"></i> View</button></td>
      </tr>`).join('');
  } catch(e) {
    document.getElementById('complete-tbody').innerHTML = `<tr><td colspan="7" style="color:#EF4444;padding:16px;text-align:center;">${e.message}</td></tr>`;
  }
}

/* ══════════════════════════════════════════
   RESEARCH REPORT — FIX 7: loads all reviewed
══════════════════════════════════════════ */
async function loadReport() {
  const search = document.getElementById('report-search')?.value?.trim() || '';
  const filter = document.getElementById('report-filter')?.value || '';

  document.getElementById('report-tbody').innerHTML = loadingRow(7);
  try {
    let rows = [];
    if (filter) {
      const d = await apiFetch(`api/get_proposals.php?search=${encodeURIComponent(search)}&status=${filter}&sort=reviewed_at&dir=DESC`);
      rows = d.data || [];
    } else {
      const [da, dr] = await Promise.all([
        apiFetch(`api/get_proposals.php?search=${encodeURIComponent(search)}&status=Approved&sort=reviewed_at&dir=DESC`),
        apiFetch(`api/get_proposals.php?search=${encodeURIComponent(search)}&status=Rejected&sort=reviewed_at&dir=DESC`)
      ]);
      rows = [...(da.data || []), ...(dr.data || [])];
      rows.sort((a, b) => new Date(b.reviewed_at || 0) - new Date(a.reviewed_at || 0));
    }

    if (!rows.length) { document.getElementById('report-tbody').innerHTML = emptyRow(7, 'No reviewed proposals found.'); return; }

    document.getElementById('report-tbody').innerHTML = rows.map(row => `
      <tr>
        <td>${studentCell(row)}</td>
        <td><div class="title-cell"><i class="fa-solid fa-file-lines"></i>${row.title}</div></td>
        <td><span class="course-tag">${row.course_type || '—'}</span></td>
        <td>${row.eval_date_fmt || (row.reviewed_at ? fmtDate(row.reviewed_at) : '—')}</td>
        <td><strong style="color:${scoreColor(row.total_score)};">${row.total_score}/100</strong></td>
        <td>${statusBadge(row.status)}</td>
        <td><button class="btn-view" onclick='openCompleteModal(${safeJson(row)})'><i class="fa-solid fa-eye"></i> View</button></td>
      </tr>`).join('');
  } catch(e) {
    document.getElementById('report-tbody').innerHTML = `<tr><td colspan="7" style="color:#EF4444;padding:16px;text-align:center;">${e.message}</td></tr>`;
  }
}

/* ══════════════════════════════════════════
   VIEW MODAL
══════════════════════════════════════════ */
let _viewData = null;

function openViewModal(row) {
  _viewData = row;
  const isReviewed = row.status === 'Approved' || row.status === 'Rejected';
  document.getElementById('startReviewBtn').style.display = isReviewed ? 'none' : '';

  const fileSection = row.file_name
    ? `<a href="api/get_file.php?id=${row.id}" target="_blank" class="file-attachment-link">
        ${fileIcon(row.file_name)}<span>${row.file_name.split('/').pop()}</span>
        <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px;"></i>
       </a>`
    : '<span style="color:#aaa;font-size:13px;">No file attached</span>';

  const reviewSection = isReviewed ? `
    <div class="view-detail-item full review-summary-box">
      <label><i class="fa-solid fa-star-half-stroke"></i>Review Summary</label>
      <div class="review-summary-inner">
        <div class="review-sum-scores">
          <span>Research Quality: <strong>${row.mark_quality}/25</strong></span>
          <span>Methodology: <strong>${row.mark_method}/25</strong></span>
          <span>Literature: <strong>${row.mark_lit}/25</strong></span>
          <span>Presentation: <strong>${row.mark_pres}/25</strong></span>
        </div>
        <div class="review-sum-total" style="color:${scoreColor(row.total_score)};">
          Total: <strong>${row.total_score}/100</strong>
        </div>
        ${row.eval_date_fmt ? `<div style="font-size:12px;color:#888;"><i class="fa-regular fa-calendar" style="margin-right:4px;"></i>Evaluated on: ${row.eval_date_fmt}</div>` : ''}
        <div class="review-sum-comment">${row.comment || '—'}</div>
      </div>
    </div>` : '';

  document.getElementById('viewModalBody').innerHTML = `
    <div class="view-student-header">
      <div class="view-avatar-initials">${initials(row.Name)}</div>
      <div class="view-student-meta">
        <h4>${row.Name}</h4>
        <span>${row.userID} &bull; ${row.email || ''}</span>
      </div>
      <div style="margin-left:auto;">${statusBadge(row.status)}</div>
    </div>
    <div class="view-details-grid">
      <div class="view-detail-item">
        <label><i class="fa-solid fa-file-lines"></i>Research Title</label>
        <span>${row.title}</span>
      </div>
      <div class="view-detail-item">
        <label><i class="fa-regular fa-calendar"></i>Submitted</label>
        <span>${row.submitted}</span>
      </div>
      <div class="view-detail-item">
        <label><i class="fa-solid fa-flask"></i>Course Type</label>
        <span>${row.course_type || '—'}</span>
      </div>
      <div class="view-detail-item">
        <label><i class="fa-regular fa-clock"></i>Duration / Due</label>
        <span>${row.duration} month${row.duration > 1 ? 's' : ''} &nbsp;(Due: ${row.due_date})</span>
      </div>
      <div class="view-detail-item">
        <label><i class="fa-solid fa-coins"></i>Budget</label>
        <span>Rs. ${parseFloat(row.budget || 0).toLocaleString()}</span>
      </div>
      <div class="view-detail-item">
        <label><i class="fa-solid fa-id-card"></i>Student ID</label>
        <span>${row.userID}</span>
      </div>
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-align-left"></i>Description</label>
        <span>${row.description || '—'}</span>
      </div>
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-paperclip"></i>Attached File</label>
        ${fileSection}
      </div>
      ${reviewSection}
    </div>`;

  document.getElementById('viewModalOverlay').classList.add('open');
}

/* ══════════════════════════════════════════
   REVIEW MODAL
══════════════════════════════════════════ */
function openReviewModal() {
  closeModal('viewModalOverlay');
  const row = _viewData;
  if (!row) return;

  document.getElementById('reviewStudentInfo').innerHTML = `
    <div class="review-proposal-strip">
      <div class="student-avatar-initials" style="width:42px;height:42px;font-size:14px;">${initials(row.Name)}</div>
      <div>
        <strong>${row.Name}</strong>
        <span>${row.title}</span>
      </div>
      <div style="margin-left:auto;">${statusBadge(row.status)}</div>
    </div>`;

  // Reset
  document.querySelectorAll('input[name="reviewDecision"]').forEach(r => r.checked = false);
  document.querySelectorAll('#reviewModalOverlay .decision-card').forEach(c => c.classList.remove('selected'));
  ['markQuality','markMethod','markLit','markPres'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('reviewTotal').textContent = '0 / 100';
  document.getElementById('reviewTotal').style.color = '#10B981';
  document.getElementById('reviewComment').value = '';
  document.getElementById('reviewModalOverlay').classList.add('open');
}

function selectDecision(radio) {
  document.querySelectorAll('#reviewModalOverlay .decision-card').forEach(c => c.classList.remove('selected'));
  radio.closest('.decision-option').querySelector('.decision-card').classList.add('selected');
}

function calcReviewTotal() {
  const total = ['markQuality','markMethod','markLit','markPres']
    .reduce((s, id) => s + (parseInt(document.getElementById(id).value) || 0), 0);
  const el = document.getElementById('reviewTotal');
  el.textContent = total + ' / 100';
  el.style.color = scoreColor(total);
}

async function submitReview() {
  const decision = document.querySelector('input[name="reviewDecision"]:checked');
  if (!decision) { showToast('Please select Approve or Reject.', 'error'); return; }
  const q = parseInt(document.getElementById('markQuality').value) || 0;
  const m = parseInt(document.getElementById('markMethod').value)  || 0;
  const l = parseInt(document.getElementById('markLit').value)     || 0;
  const p = parseInt(document.getElementById('markPres').value)    || 0;
  const comment = document.getElementById('reviewComment').value.trim();
  if (!comment) { showToast('Please add a comment.', 'error'); return; }

  try {
    const res  = await fetch('api/submit_review.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_id: _viewData.id, decision: decision.value,
        mark_quality: q, mark_method: m, mark_lit: l, mark_pres: p,
        comment, evaluation_date: new Date().toISOString().split('T')[0]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    closeModal('reviewModalOverlay');
    showToast(`Review submitted — ${decision.value} (${q+m+l+p}/100)`, 'success');
    doRefresh();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

/* ══════════════════════════════════════════
   COMPLETE DETAIL MODAL
══════════════════════════════════════════ */
function openCompleteModal(row) {
  document.getElementById('completeModalBody').innerHTML = `
    <div class="view-student-header">
      <div class="view-avatar-initials">${initials(row.Name)}</div>
      <div class="view-student-meta"><h4>${row.Name}</h4><span>${row.userID}</span></div>
      <div style="margin-left:auto;">${statusBadge(row.status)}</div>
    </div>
    <div class="view-details-grid">
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-file-lines"></i>Research Title</label>
        <span>${row.title}</span>
      </div>
      <div class="view-detail-item">
        <label><i class="fa-regular fa-calendar"></i>Submitted</label>
        <span>${row.submitted}</span>
      </div>
      <div class="view-detail-item">
        <label><i class="fa-solid fa-calendar-check"></i>Evaluated On</label>
        <span>${row.eval_date_fmt || (row.reviewed_at ? fmtDate(row.reviewed_at) : '—')}</span>
      </div>
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-star"></i>Score Breakdown</label>
        <div class="score-breakdown">
          <div class="sb-item"><span>Research Quality</span><strong>${row.mark_quality}/25</strong>
            <div class="sb-bar"><div class="sb-fill" style="width:${(row.mark_quality/25)*100}%;background:#2F5DD3;"></div></div>
          </div>
          <div class="sb-item"><span>Methodology</span><strong>${row.mark_method}/25</strong>
            <div class="sb-bar"><div class="sb-fill" style="width:${(row.mark_method/25)*100}%;background:#10B981;"></div></div>
          </div>
          <div class="sb-item"><span>Literature Review</span><strong>${row.mark_lit}/25</strong>
            <div class="sb-bar"><div class="sb-fill" style="width:${(row.mark_lit/25)*100}%;background:#F59E0B;"></div></div>
          </div>
          <div class="sb-item"><span>Presentation</span><strong>${row.mark_pres}/25</strong>
            <div class="sb-bar"><div class="sb-fill" style="width:${(row.mark_pres/25)*100}%;background:#8B5CF6;"></div></div>
          </div>
        </div>
        <div class="review-total-bar" style="margin-top:12px;">
          <span>Total Score</span>
          <span class="review-total-val" style="color:${scoreColor(row.total_score)};">${row.total_score}/100</span>
        </div>
      </div>
      <div class="view-detail-item full">
        <label><i class="fa-solid fa-comment-dots"></i>Feedback</label>
        <span style="white-space:pre-wrap;">${row.comment || '—'}</span>
      </div>
    </div>`;
  document.getElementById('completeModalOverlay').classList.add('open');
}

/* ══════════════════════════════════════════
   EVALUATION FORM — FIX 6
══════════════════════════════════════════ */
let _evalProposals = [];

async function loadEvalProposals() {
  try {
    // Load ALL proposals so lecturer can evaluate any (pending or reviewed)
    const [dp, da, dr] = await Promise.all([
      apiFetch('api/get_proposals.php?status=Pending&sort=Name&dir=ASC'),
      apiFetch('api/get_proposals.php?status=Approved&sort=Name&dir=ASC'),
      apiFetch('api/get_proposals.php?status=Rejected&sort=Name&dir=ASC'),
    ]);
    _evalProposals = [...(dp.data || []), ...(da.data || []), ...(dr.data || [])];

    const sel = document.getElementById('eval-proposal');
    if (!sel) return;

    // Group by status
    const groups = { Pending: [], Approved: [], Rejected: [] };
    _evalProposals.forEach(r => { (groups[r.status] || groups.Pending).push(r); });

    sel.innerHTML = '<option value="">Choose proposal…</option>';
    ['Pending','Approved','Rejected'].forEach(grp => {
      if (!groups[grp].length) return;
      const og = document.createElement('optgroup');
      og.label = grp + ' Proposals';
      groups[grp].forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.Name} — ${r.title}`;
        og.appendChild(opt);
      });
      sel.appendChild(og);
    });
  } catch(e) { console.error('loadEvalProposals:', e.message); }
}

function fillEvalForm() {
  const id  = document.getElementById('eval-proposal').value;
  const row = _evalProposals.find(r => String(r.id) === String(id));
  const notice = document.getElementById('eval-notice');

  if (!row) {
    ['eval-student','eval-studentid','eval-title','eval-course','eval-duration','eval-submitted'].forEach(i => {
      const el = document.getElementById(i); if (el) el.value = '';
    });
    ['eval-q','eval-m','eval-l','eval-p'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
    document.getElementById('totalScore').textContent = '0 / 100';
    document.getElementById('totalScore').style.color = '#10B981';
    document.querySelectorAll('input[name="evalDecision"]').forEach(r => r.checked = false);
    document.querySelectorAll('#eval-decision-wrap .decision-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('eval-comment').value = '';
    if (notice) notice.style.display = 'none';
    return;
  }

  document.getElementById('eval-student').value   = row.Name;
  document.getElementById('eval-studentid').value = row.userID;
  document.getElementById('eval-title').value     = row.title;
  document.getElementById('eval-course').value    = row.course_type || '—';
  document.getElementById('eval-duration').value  = row.duration + ' month' + (row.duration > 1 ? 's' : '');
  document.getElementById('eval-submitted').value = row.submitted;

  // FIX 6: Pre-fill marks and decision if already evaluated
  const hasEval = row.status === 'Approved' || row.status === 'Rejected';
  if (hasEval && row.review_id) {
    document.getElementById('eval-q').value = row.mark_quality || 0;
    document.getElementById('eval-m').value = row.mark_method  || 0;
    document.getElementById('eval-l').value = row.mark_lit     || 0;
    document.getElementById('eval-p').value = row.mark_pres    || 0;
    calcEvalTotal();

    // Pre-select decision
    document.querySelectorAll('input[name="evalDecision"]').forEach(r => {
      r.checked = r.value === row.decision;
    });
    document.querySelectorAll('#eval-decision-wrap .decision-card').forEach(c => c.classList.remove('selected'));
    const checked = document.querySelector('input[name="evalDecision"]:checked');
    if (checked) checked.closest('.decision-option').querySelector('.decision-card').classList.add('selected');

    document.getElementById('eval-comment').value = row.comment || '';

    // Show evaluation date notice
    if (notice) {
      notice.style.display = 'flex';
      const dateStr = row.eval_date_fmt || (row.reviewed_at ? fmtDate(row.reviewed_at) : 'a previous date');
      document.getElementById('eval-notice-text').textContent =
        `This proposal was previously evaluated on ${dateStr}. You can update the evaluation below.`;
    }
    // Set date to existing eval date if available
    if (row.evaluation_date) {
      document.getElementById('eval-date').value = row.evaluation_date;
    }
  } else {
    // No existing eval — clear marks
    ['eval-q','eval-m','eval-l','eval-p'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
    document.getElementById('totalScore').textContent = '0 / 100';
    document.getElementById('totalScore').style.color = '#10B981';
    document.querySelectorAll('input[name="evalDecision"]').forEach(r => r.checked = false);
    document.querySelectorAll('#eval-decision-wrap .decision-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('eval-comment').value = '';
    if (notice) notice.style.display = 'none';
    document.getElementById('eval-date').value = new Date().toISOString().split('T')[0];
  }
}

function calcEvalTotal() {
  const total = ['eval-q','eval-m','eval-l','eval-p']
    .reduce((s, id) => s + (parseInt(document.getElementById(id)?.value) || 0), 0);
  const el = document.getElementById('totalScore');
  el.textContent = total + ' / 100';
  el.style.color = scoreColor(total);
}

function evalPickDecision(radio) {
  document.querySelectorAll('#eval-decision-wrap .decision-card').forEach(c => c.classList.remove('selected'));
  radio.closest('.decision-option').querySelector('.decision-card').classList.add('selected');
}

function resetEvalForm() {
  document.getElementById('eval-proposal').value = '';
  fillEvalForm(); // triggers reset of all fields
  document.getElementById('eval-date').value = new Date().toISOString().split('T')[0];
}

async function submitEvalForm() {
  const id = document.getElementById('eval-proposal').value;
  if (!id) { showToast('Please select a proposal.', 'error'); return; }
  const decision = document.querySelector('input[name="evalDecision"]:checked');
  if (!decision) { showToast('Please select a decision.', 'error'); return; }
  const q = parseInt(document.getElementById('eval-q').value) || 0;
  const m = parseInt(document.getElementById('eval-m').value) || 0;
  const l = parseInt(document.getElementById('eval-l').value) || 0;
  const p = parseInt(document.getElementById('eval-p').value) || 0;
  const comment   = document.getElementById('eval-comment').value.trim();
  const evalDate  = document.getElementById('eval-date').value;
  if (!comment) { showToast('Please add feedback.', 'error'); return; }
  if (!evalDate) { showToast('Please set an evaluation date.', 'error'); return; }

  try {
    const res  = await fetch('api/submit_review.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_id: id, decision: decision.value,
        mark_quality: q, mark_method: m, mark_lit: l, mark_pres: p,
        comment, evaluation_date: evalDate
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showToast(`Evaluation submitted — ${decision.value} (${q+m+l+p}/100) on ${evalDate}`, 'success');
    resetEvalForm();
    loadEvalProposals();
    doRefresh();
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

/* ══════════════════════════════════════════
   SETTINGS — FIX 8: editable + avatar upload
══════════════════════════════════════════ */
function switchSettingsTab(name, btn) {
  ['profile','security'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === name ? '' : 'none';
  });
  document.querySelectorAll('.settings-nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

let _avatarFile = null;

function handleAvatarSelect(input) {
  const file = input.files[0];
  if (!file) return;
  _avatarFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('settingsAvatar').src = e.target.result;
    document.getElementById('topbarAvatar').src  = e.target.result;
    document.getElementById('avatar-save-row').style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function cancelAvatarPreview() {
  _avatarFile = null;
  document.getElementById('avatarFileInput').value = '';
  document.getElementById('avatar-save-row').style.display = 'none';
  // Restore original avatar
  document.getElementById('settingsAvatar').src =
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(SESSION.name) + '&background=2F5DD3&color=fff&size=80';
}

async function uploadAvatar() {
  if (!_avatarFile) return;
  const fd = new FormData();
  fd.append('action', 'avatar');
  fd.append('avatar', _avatarFile);
  try {
    const res  = await fetch('api/update_profile.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    _avatarFile = null;
    document.getElementById('avatar-save-row').style.display = 'none';
    showToast('Profile photo updated!', 'success');
  } catch(e) { showToast('Upload error: ' + e.message, 'error'); }
}

async function saveProfile() {
  const name   = document.getElementById('s-name')?.value.trim();
  const email  = document.getElementById('s-email')?.value.trim();
  const mobile = document.getElementById('s-mobile')?.value.trim();
  if (!name || !email) { showToast('Name and email are required.', 'error'); return; }

  const fd = new FormData();
  fd.append('action', 'profile');
  fd.append('name',   name);
  fd.append('email',  email);
  fd.append('mobile', mobile);

  try {
    const res  = await fetch('api/update_profile.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    // Update displayed name
    const nd = document.getElementById('settings-name-display');
    if (nd) nd.textContent = name;
    showToast('Profile updated successfully!', 'success');
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function changePassword() {
  const cur  = document.getElementById('s-cur')?.value;
  const newP = document.getElementById('s-new')?.value;
  const conf = document.getElementById('s-conf')?.value;
  if (!cur || !newP || !conf) { showToast('All password fields required.', 'error'); return; }
  if (newP !== conf)          { showToast('Passwords do not match.', 'error'); return; }
  if (newP.length < 6)        { showToast('Password must be ≥ 6 characters.', 'error'); return; }

  const fd = new FormData();
  fd.append('action',  'password');
  fd.append('current', cur);
  fd.append('new',     newP);
  fd.append('confirm', conf);

  try {
    const res  = await fetch('api/update_profile.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    ['s-cur','s-new','s-conf'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    showToast('Password changed successfully!', 'success');
  } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

/* ══════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════ */
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

function closeViewModal()   { closeModal('viewModalOverlay'); }
function closeReviewModal() { closeModal('reviewModalOverlay'); }

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
let _toastTimer = null;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('reviewToast');
  const icon  = document.getElementById('toastIcon');
  const msgEl = document.getElementById('reviewToastMsg');
  if (!toast) return;
  msgEl.textContent = msg;
  icon.className = type === 'error'
    ? 'fa-solid fa-circle-exclamation'
    : 'fa-solid fa-circle-check';
  icon.style.color = type === 'error' ? '#EF4444' : '#10B981';
  toast.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════════
   SAFE JSON for inline onclick
══════════════════════════════════════════ */
function safeJson(obj) {
  return JSON.stringify(obj).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Modal overlay click-to-close
  ['viewModalOverlay','reviewModalOverlay','completeModalOverlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => { if (e.target === e.currentTarget) el.classList.remove('open'); });
  });

  loadAll();
});

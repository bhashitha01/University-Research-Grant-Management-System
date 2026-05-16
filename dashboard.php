<?php
require_once 'config.php';
requireLogin();

$uid    = $_SESSION['userID'];
$name   = htmlspecialchars($_SESSION['Name']);
$email  = htmlspecialchars($_SESSION['email']);
$course = htmlspecialchars($_SESSION['course']);

$db   = getDB();
$stmt = $db->prepare("SELECT profile_pic, mobile FROM users WHERE userID=?");
$stmt->bind_param('s', $uid);
$stmt->execute();
$row    = $stmt->get_result()->fetch_assoc();
$pic    = $row['profile_pic'] ?? '';
$mobile = $row['mobile']      ?? '';
$avatar = $pic
    ? 'uploads/profiles/' . htmlspecialchars($pic)
    : 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=2F5DD3&color=fff&size=80';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>ResearchDesk — Lecturer</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="lecture.css">
</head>
<body>
<div class="app">

<!-- ══ SIDEBAR ══ -->
<aside class="sidebar">
  <div class="sidebar-logo">
    <div class="logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
    <div class="logo-text"><h2>Lecturer</h2><p>ResearchDesk</p></div>
  </div>
  <nav class="sidebar-nav">
    <button class="nav-btn active" onclick="showPage('dashboard',this)">
      <i class="fa-solid fa-chart-pie"></i>Dashboard
    </button>
    <button class="nav-btn" onclick="showPage('assigned',this)">
      <i class="fa-solid fa-clipboard-list"></i>Assigned Proposals
      <span class="nav-badge blue" id="badge-assigned">…</span>
    </button>
    <button class="nav-btn" onclick="showPage('pending',this)">
      <i class="fa-solid fa-hourglass-half"></i>Pending Reviews
      <span class="nav-badge" id="badge-pending">…</span>
    </button>
    <button class="nav-btn" onclick="showPage('complete',this)">
      <i class="fa-solid fa-circle-check"></i>Complete Reviews
      <span class="nav-badge green" id="badge-complete">…</span>
    </button>
    <button class="nav-btn" onclick="showPage('evaluation',this)">
      <i class="fa-solid fa-star-half-stroke"></i>Evaluation Form
    </button>
    <button class="nav-btn" onclick="showPage('report',this)">
      <i class="fa-solid fa-file-lines"></i>Research Report
    </button>
    <button class="nav-btn" onclick="showPage('settings',this)">
      <i class="fa-solid fa-gear"></i>Settings
    </button>
  </nav>
  <div class="sidebar-footer">
    <a href="logout.php" style="text-decoration:none;">
      <button class="logout-btn"><i class="fa-solid fa-right-from-bracket"></i>Log Out</button>
    </a>
  </div>
</aside>

<!-- ══ MAIN ══ -->
<div class="main">
  <header class="topbar">
    <div class="topbar-left">
      <h1 id="pageTitle">Dashboard</h1>
      <p id="pageSubtitle">Welcome back, <?= $name ?></p>
    </div>
    <div class="topbar-right">
      <!-- FIX 1: Working refresh button with spin -->
      <button class="topbar-icon-btn" id="refreshBtn" title="Refresh" onclick="doRefresh()">
        <i class="fa-solid fa-rotate-right" id="refreshIcon"></i>
      </button>
      <div class="topbar-profile" onclick="showPage('settings',document.querySelector('.nav-btn:nth-child(7)'))">
        <img id="topbarAvatar" src="<?= $avatar ?>" alt="<?= $name ?>">
        <div class="topbar-profile-info">
          <h4><?= $name ?></h4>
          <p><?= $course ?></p>
        </div>
      </div>
    </div>
  </header>

  <div class="content">

    <!-- ══ DASHBOARD ══ -->
    <!-- FIX 2: Stats are filtered by this lecturer's reviews via API -->
    <div id="page-dashboard" class="page active">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fa-solid fa-clipboard-list"></i></div>
          <div class="stat-info"><h3 id="stat-total">–</h3><p>Total Proposals</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber"><i class="fa-solid fa-hourglass-half"></i></div>
          <div class="stat-info"><h3 id="stat-pending">–</h3><p>Pending Reviews</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
          <div class="stat-info"><h3 id="stat-complete">–</h3><p>My Completed Reviews</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="stat-info"><h3 id="stat-overdue">–</h3><p>Overdue Items</p></div>
        </div>
      </div>
      <div class="dash-grid">
        <div class="card">
          <div class="card-header">
            <h3><i class="fa-regular fa-clock"></i>Recent Submissions</h3>
            <button class="view-all" onclick="navTo('assigned')">View all →</button>
          </div>
          <div class="card-body" id="dash-recent">
            <div class="loading-placeholder"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
          </div>
        </div>
        <div class="card" style="height:fit-content;">
          <div class="card-header"><h3><i class="fa-solid fa-chart-pie"></i>Overview</h3></div>
          <div class="card-body">
            <div class="progress-bar-wrap">
              <div class="progress-bar-label"><span>Approval Rate</span><span id="ov-approval">–</span></div>
              <div class="progress-bar-bg"><div class="progress-bar-fill fill-green" id="ov-approval-bar" style="width:0%"></div></div>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-label"><span>Review Completion</span><span id="ov-complete">–</span></div>
              <div class="progress-bar-bg"><div class="progress-bar-fill fill-blue" id="ov-complete-bar" style="width:0%"></div></div>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-label"><span>Pending</span><span id="ov-pending">–</span></div>
              <div class="progress-bar-bg"><div class="progress-bar-fill fill-amber" id="ov-pending-bar" style="width:0%"></div></div>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-label"><span>Rejected Rate</span><span id="ov-rejected">–</span></div>
              <div class="progress-bar-bg"><div class="progress-bar-fill fill-red" id="ov-rejected-bar" style="width:0%"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ ASSIGNED PROPOSALS ══ -->
    <!-- FIX 3: Correct columns shown, file column added, errors fixed -->
    <div id="page-assigned" class="page">
      <div class="table-card">
        <div class="table-toolbar">
          <h3><i class="fa-solid fa-clipboard-list"></i>Assigned Proposals</h3>
          <div class="toolbar-controls">
            <div class="search-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="assigned-search" placeholder="Search student, title…" oninput="loadAssigned()">
            </div>
            <select class="filter-select" id="assigned-status" onchange="loadAssigned()">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select class="filter-select" id="assigned-sort" onchange="loadAssigned()">
              <option value="created_at">Date ↓</option>
              <option value="title">Title A–Z</option>
              <option value="Name">Student A–Z</option>
            </select>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Research Title</th>
              <th>Course</th>
              <th>Duration</th>
              <th>Submitted</th>
              <th>File</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="assigned-tbody">
            <tr><td colspan="8" class="loading-placeholder"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ PENDING REVIEWS ══ -->
    <!-- FIX 4: No priority column — only real data columns -->
    <div id="page-pending" class="page">
      <div class="table-card">
        <div class="table-toolbar">
          <h3><i class="fa-solid fa-hourglass-half"></i>Pending Reviews</h3>
          <div class="toolbar-controls">
            <div class="search-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="pending-search" placeholder="Search…" oninput="loadPending()">
            </div>
            <select class="filter-select" id="pending-sort" onchange="loadPending()">
              <option value="created_at|DESC">Newest First</option>
              <option value="created_at|ASC">Oldest First</option>
              <option value="title|ASC">Title A–Z</option>
            </select>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Research Title</th>
              <th>Course</th>
              <th>Submitted</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="pending-tbody">
            <tr><td colspan="6" class="loading-placeholder"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ COMPLETE REVIEWS ══ -->
    <!-- FIX 5: Correct columns, score shown properly -->
    <div id="page-complete" class="page">
      <div class="table-card">
        <div class="table-toolbar">
          <h3><i class="fa-solid fa-circle-check"></i>Complete Reviews</h3>
          <div class="toolbar-controls">
            <div class="search-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="complete-search" placeholder="Search…" oninput="loadComplete()">
            </div>
            <select class="filter-select" id="complete-result" onchange="loadComplete()">
              <option value="">All Results</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select class="filter-select" id="complete-sort" onchange="loadComplete()">
              <option value="reviewed_at|DESC">Review Date ↓</option>
              <option value="total_score|DESC">Score ↓</option>
              <option value="total_score|ASC">Score ↑</option>
            </select>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Research Title</th>
              <th>Submitted</th>
              <th>Evaluated On</th>
              <th>Score</th>
              <th>Result</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="complete-tbody">
            <tr><td colspan="7" class="loading-placeholder"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ EVALUATION FORM ══ -->
    <!-- FIX 6: Shows existing eval date, marks pre-filled, decision pre-selected, submission notifies date -->
    <div id="page-evaluation" class="page">
      <div class="form-card">
        <div class="form-title">
          <i class="fa-solid fa-star-half-stroke" style="color:#2F5DD3;margin-right:10px;font-size:18px;"></i>
          Evaluation / Mark Form
        </div>
        <div class="form-subtitle">Select a proposal to evaluate. Previously saved marks will auto-load.</div>

        <!-- Existing eval notice -->
        <div id="eval-notice" style="display:none;" class="eval-notice">
          <i class="fa-solid fa-calendar-check"></i>
          <span id="eval-notice-text"></span>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Select Proposal <span>*</span></label>
            <select class="form-select" id="eval-proposal" onchange="fillEvalForm()">
              <option value="">Choose proposal…</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Evaluation Date <span>*</span></label>
            <input type="date" class="form-input" id="eval-date" value="<?= date('Y-m-d') ?>">
          </div>

          <div class="form-group">
            <label class="form-label">Student Name</label>
            <input type="text" class="form-input" id="eval-student" readonly placeholder="Auto-filled">
          </div>
          <div class="form-group">
            <label class="form-label">Student ID</label>
            <input type="text" class="form-input" id="eval-studentid" readonly placeholder="Auto-filled">
          </div>
          <div class="form-group">
            <label class="form-label">Research Title</label>
            <input type="text" class="form-input" id="eval-title" readonly placeholder="Auto-filled">
          </div>
          <div class="form-group">
            <label class="form-label">Course Type</label>
            <input type="text" class="form-input" id="eval-course" readonly placeholder="Auto-filled">
          </div>
          <div class="form-group">
            <label class="form-label">Duration</label>
            <input type="text" class="form-input" id="eval-duration" readonly placeholder="Auto-filled">
          </div>
          <div class="form-group">
            <label class="form-label">Submitted On</label>
            <input type="text" class="form-input" id="eval-submitted" readonly placeholder="Auto-filled">
          </div>

          <div class="form-divider"></div>

          <!-- Marks -->
          <div class="form-group full">
            <label class="form-label">Marking Criteria <span>*</span> &nbsp;<small style="color:#aaa;font-weight:400;">(Each section out of 25 — total 100)</small></label>
            <div class="score-row">
              <div class="score-item">
                <label>Research Quality</label>
                <small>(0 – 25)</small>
                <input type="number" class="form-input" id="eval-q" min="0" max="25" placeholder="0" oninput="clampMark(this,25);calcEvalTotal()">
              </div>
              <div class="score-item">
                <label>Methodology</label>
                <small>(0 – 25)</small>
                <input type="number" class="form-input" id="eval-m" min="0" max="25" placeholder="0" oninput="clampMark(this,25);calcEvalTotal()">
              </div>
              <div class="score-item">
                <label>Literature Review</label>
                <small>(0 – 25)</small>
                <input type="number" class="form-input" id="eval-l" min="0" max="25" placeholder="0" oninput="clampMark(this,25);calcEvalTotal()">
              </div>
              <div class="score-item">
                <label>Presentation</label>
                <small>(0 – 25)</small>
                <input type="number" class="form-input" id="eval-p" min="0" max="25" placeholder="0" oninput="clampMark(this,25);calcEvalTotal()">
              </div>
            </div>
          </div>

          <div class="total-score">
            <span><i class="fa-solid fa-calculator" style="margin-right:8px;"></i>Total Score</span>
            <strong id="totalScore">0 / 100</strong>
          </div>

          <!-- Decision -->
          <div class="form-group full">
            <label class="form-label">Decision <span>*</span></label>
            <div class="review-decision-btns" id="eval-decision-wrap">
              <label class="decision-option">
                <input type="radio" name="evalDecision" value="Approved" onchange="evalPickDecision(this)">
                <span class="decision-card approve"><i class="fa-solid fa-check-circle"></i><span>Approve</span></span>
              </label>
              <label class="decision-option">
                <input type="radio" name="evalDecision" value="Rejected" onchange="evalPickDecision(this)">
                <span class="decision-card reject"><i class="fa-solid fa-times-circle"></i><span>Reject</span></span>
              </label>
            </div>
          </div>

          <div class="form-group full">
            <label class="form-label">Comments / Feedback <span>*</span></label>
            <textarea class="form-textarea" id="eval-comment" rows="4" placeholder="Provide detailed feedback for the student…"></textarea>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" onclick="resetEvalForm()">
              <i class="fa-solid fa-rotate-left"></i>Reset
            </button>
            <button class="btn-primary" onclick="submitEvalForm()">
              <i class="fa-solid fa-paper-plane"></i>Submit Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ RESEARCH REPORT ══ -->
    <!-- FIX 7: All reviewed proposals load correctly -->
    <div id="page-report" class="page">
      <div class="report-grid">
        <div class="report-stat"><h2 id="rpt-total">–</h2><p>Total Proposals</p></div>
        <div class="report-stat"><h2 id="rpt-approved" style="color:#10B981;">–</h2><p>Approved</p></div>
        <div class="report-stat"><h2 id="rpt-rejected" style="color:#EF4444;">–</h2><p>Rejected</p></div>
      </div>
      <div class="table-card" style="margin-bottom:20px;">
        <div class="card-header"><h3><i class="fa-solid fa-chart-bar"></i>Performance Overview</h3></div>
        <div class="card-body">
          <div class="progress-bar-wrap">
            <div class="progress-bar-label"><span>Approval Rate</span><span id="rpt-ar">–</span></div>
            <div class="progress-bar-bg"><div class="progress-bar-fill fill-green" id="rpt-ar-bar" style="width:0%"></div></div>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-label"><span>Review Completion</span><span id="rpt-rc">–</span></div>
            <div class="progress-bar-bg"><div class="progress-bar-fill fill-blue" id="rpt-rc-bar" style="width:0%"></div></div>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-label"><span>Pending</span><span id="rpt-pend">–</span></div>
            <div class="progress-bar-bg"><div class="progress-bar-fill fill-amber" id="rpt-pend-bar" style="width:0%"></div></div>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-label"><span>Overdue Rate</span><span id="rpt-ov">–</span></div>
            <div class="progress-bar-bg"><div class="progress-bar-fill fill-red" id="rpt-ov-bar" style="width:0%"></div></div>
          </div>
        </div>
      </div>
      <div class="table-card">
        <div class="table-toolbar">
          <h3><i class="fa-solid fa-file-lines"></i>All Reviewed Proposals</h3>
          <div class="toolbar-controls">
            <div class="search-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="report-search" placeholder="Search…" oninput="loadReport()">
            </div>
            <select class="filter-select" id="report-filter" onchange="loadReport()">
              <option value="">All</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr><th>Student</th><th>Title</th><th>Course</th><th>Evaluated On</th><th>Score</th><th>Result</th><th>Action</th></tr>
          </thead>
          <tbody id="report-tbody">
            <tr><td colspan="7" class="loading-placeholder"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ SETTINGS ══ -->
    <!-- FIX 8: Editable profile + profile picture upload -->
    <div id="page-settings" class="page">
      <div class="settings-grid">
        <div class="settings-nav">
          <button class="settings-nav-btn active" onclick="switchSettingsTab('profile',this)">
            <i class="fa-solid fa-user"></i>Profile
          </button>
          <button class="settings-nav-btn" onclick="switchSettingsTab('security',this)">
            <i class="fa-solid fa-lock"></i>Security
          </button>
        </div>
        <div class="settings-content">

          <!-- PROFILE TAB -->
          <div id="tab-profile">
            <div class="settings-section-title">Profile Settings</div>

            <!-- Avatar -->
            <div class="profile-avatar-section">
              <div class="avatar-upload-wrap">
                <img id="settingsAvatar" src="<?= $avatar ?>" alt="<?= $name ?>">
                <label class="avatar-cam-btn" title="Change photo">
                  <i class="fa-solid fa-camera"></i>
                  <input type="file" id="avatarFileInput" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none;" onchange="handleAvatarSelect(this)">
                </label>
              </div>
              <div class="avatar-info">
                <h4 id="settings-name-display"><?= $name ?></h4>
                <p><?= $course ?></p>
                <div id="avatar-save-row" style="display:none;gap:8px;margin-top:10px;">
                  <button class="btn-primary" style="padding:6px 14px;font-size:12px;" onclick="uploadAvatar()">
                    <i class="fa-solid fa-upload"></i>Save Photo
                  </button>
                  <button class="btn-secondary" style="padding:6px 14px;font-size:12px;" onclick="cancelAvatarPreview()">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Profile form -->
            <div class="settings-row">
              <div class="settings-field">
                <label class="settings-label">Full Name <span style="color:#EF4444;">*</span></label>
                <input class="settings-input" id="s-name" value="<?= $name ?>" placeholder="Your full name">
              </div>
              <div class="settings-field">
                <label class="settings-label">Employee ID</label>
                <input class="settings-input" value="<?= $uid ?>" readonly style="background:#f5f5f5;color:#aaa;cursor:not-allowed;">
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-field">
                <label class="settings-label">Email Address <span style="color:#EF4444;">*</span></label>
                <input class="settings-input" id="s-email" type="email" value="<?= $email ?>" placeholder="your@email.com">
              </div>
              <div class="settings-field">
                <label class="settings-label">Mobile Number</label>
                <input class="settings-input" id="s-mobile" type="tel" value="<?= htmlspecialchars($mobile) ?>" placeholder="07X XXXXXXX">
              </div>
            </div>
            <div class="settings-field">
              <label class="settings-label">Course / Department</label>
              <input class="settings-input" value="<?= $course ?>" readonly style="background:#f5f5f5;color:#aaa;cursor:not-allowed;">
            </div>
            <div style="display:flex;justify-content:flex-end;margin-top:18px;padding-top:16px;border-top:1px solid #f0f0f0;">
              <button class="btn-primary" onclick="saveProfile()">
                <i class="fa-solid fa-floppy-disk"></i>Save Changes
              </button>
            </div>
          </div>

          <!-- SECURITY TAB -->
          <div id="tab-security" style="display:none;">
            <div class="settings-section-title">Change Password</div>
            <div class="settings-field">
              <label class="settings-label">Current Password</label>
              <input class="settings-input" id="s-cur" type="password" placeholder="Enter current password">
            </div>
            <div class="settings-field">
              <label class="settings-label">New Password</label>
              <input class="settings-input" id="s-new" type="password" placeholder="Min 6 characters">
            </div>
            <div class="settings-field">
              <label class="settings-label">Confirm New Password</label>
              <input class="settings-input" id="s-conf" type="password" placeholder="Repeat new password">
            </div>
            <div style="display:flex;justify-content:flex-end;margin-top:18px;padding-top:16px;border-top:1px solid #f0f0f0;">
              <button class="btn-primary" onclick="changePassword()">
                <i class="fa-solid fa-key"></i>Update Password
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div><!-- /content -->
</div><!-- /main -->
</div><!-- /app -->

<!-- ══ VIEW PROPOSAL MODAL ══ -->
<div class="modal-overlay" id="viewModalOverlay">
  <div class="modal modal-wide">
    <div class="modal-header">
      <h3><i class="fa-solid fa-file-lines" style="color:#2F5DD3;margin-right:8px;"></i>Proposal Details</h3>
      <button class="modal-close" onclick="closeModal('viewModalOverlay')"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="modal-body" id="viewModalBody" style="max-height:72vh;overflow-y:auto;"></div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal('viewModalOverlay')"><i class="fa-solid fa-xmark"></i>Close</button>
      <button class="btn-primary" id="startReviewBtn" onclick="openReviewModal()"><i class="fa-solid fa-pen-to-square"></i>Start Review</button>
    </div>
  </div>
</div>

<!-- ══ REVIEW MODAL ══ -->
<div class="modal-overlay" id="reviewModalOverlay">
  <div class="modal modal-wide">
    <div class="modal-header">
      <h3><i class="fa-solid fa-star-half-stroke" style="color:#2F5DD3;margin-right:8px;"></i>Review Proposal</h3>
      <button class="modal-close" onclick="closeModal('reviewModalOverlay')"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="modal-body" style="max-height:72vh;overflow-y:auto;padding:24px;">
      <div id="reviewStudentInfo"></div>
      <div class="review-section">
        <div class="review-section-title"><i class="fa-solid fa-circle-check"></i>Decision</div>
        <div class="review-decision-btns">
          <label class="decision-option">
            <input type="radio" name="reviewDecision" value="Approved" onchange="selectDecision(this)">
            <span class="decision-card approve"><i class="fa-solid fa-check-circle"></i><span>Approve</span></span>
          </label>
          <label class="decision-option">
            <input type="radio" name="reviewDecision" value="Rejected" onchange="selectDecision(this)">
            <span class="decision-card reject"><i class="fa-solid fa-times-circle"></i><span>Reject</span></span>
          </label>
        </div>
      </div>
      <div class="review-section">
        <div class="review-section-title"><i class="fa-solid fa-star"></i>Marks <small style="font-weight:400;color:#aaa;">(each /25)</small></div>
        <div class="review-marks-row">
          <div class="review-mark-item">
            <label class="review-mark-label">Research Quality</label>
            <div class="mark-input-wrap">
              <input type="number" class="review-mark-input" id="markQuality" min="0" max="25" placeholder="0" oninput="clampMark(this,25);calcReviewTotal()">
              <span class="mark-max">/ 25</span>
            </div>
          </div>
          <div class="review-mark-item">
            <label class="review-mark-label">Methodology</label>
            <div class="mark-input-wrap">
              <input type="number" class="review-mark-input" id="markMethod" min="0" max="25" placeholder="0" oninput="clampMark(this,25);calcReviewTotal()">
              <span class="mark-max">/ 25</span>
            </div>
          </div>
          <div class="review-mark-item">
            <label class="review-mark-label">Literature Review</label>
            <div class="mark-input-wrap">
              <input type="number" class="review-mark-input" id="markLit" min="0" max="25" placeholder="0" oninput="clampMark(this,25);calcReviewTotal()">
              <span class="mark-max">/ 25</span>
            </div>
          </div>
          <div class="review-mark-item">
            <label class="review-mark-label">Presentation</label>
            <div class="mark-input-wrap">
              <input type="number" class="review-mark-input" id="markPres" min="0" max="25" placeholder="0" oninput="clampMark(this,25);calcReviewTotal()">
              <span class="mark-max">/ 25</span>
            </div>
          </div>
        </div>
        <div class="review-total-bar">
          <span>Total Score</span>
          <span class="review-total-val" id="reviewTotal">0 / 100</span>
        </div>
      </div>
      <div class="review-section">
        <div class="review-section-title"><i class="fa-solid fa-comment-dots"></i>Comment / Feedback</div>
        <textarea class="review-comment-box" id="reviewComment" rows="4" placeholder="Provide detailed feedback for the student…"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal('reviewModalOverlay')"><i class="fa-solid fa-arrow-left"></i>Back</button>
      <button class="btn-primary" onclick="submitReview()"><i class="fa-solid fa-paper-plane"></i>Submit Review</button>
    </div>
  </div>
</div>

<!-- ══ COMPLETE DETAIL MODAL ══ -->
<div class="modal-overlay" id="completeModalOverlay">
  <div class="modal modal-wide">
    <div class="modal-header">
      <h3><i class="fa-solid fa-circle-check" style="color:#10B981;margin-right:8px;"></i>Review Details</h3>
      <button class="modal-close" onclick="closeModal('completeModalOverlay')"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="modal-body" id="completeModalBody" style="max-height:72vh;overflow-y:auto;padding:24px;"></div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal('completeModalOverlay')"><i class="fa-solid fa-xmark"></i>Close</button>
    </div>
  </div>
</div>

<!-- ══ TOAST ══ -->
<div class="review-toast" id="reviewToast">
  <i id="toastIcon" class="fa-solid fa-circle-check"></i>
  <span id="reviewToastMsg">Done!</span>
</div>

<script>
const SESSION = {
  userID: '<?= $uid ?>',
  name:   '<?= addslashes($name) ?>',
  course: '<?= addslashes($course) ?>',
  email:  '<?= addslashes($email) ?>'
};
</script>
<script src="lecture.js"></script>
</body>
</html>
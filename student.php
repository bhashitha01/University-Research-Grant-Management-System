<?php
session_start();

if(!isset($_SESSION['name'])){
    $_SESSION['name'] = "Student";
}
if(!isset($_SESSION['email'])){
    $_SESSION['email'] = "";
}
if(!isset($_SESSION['phone'])){
    $_SESSION['phone'] = "";
}
if(!isset($_SESSION['department'])){
    $_SESSION['department'] = "";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResearchDesk Student</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="debug.css?v=2">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

</head>
<body>
<div class="dashboard">

    <!-- ── SIDEBAR ── --> 
    <aside class="sidebar">
        <div class="logo">
            <img src="logo.png" alt="Logo">
            <div><h2>Student</h2><p>ResearchDesk</p></div>
        </div>
        <nav class="nav-menu">
            <button class="nav-item active" onclick="showPage('dashboard',this)">
                <i class="fa-solid fa-desktop"></i><span>Dashboard</span>
            </button>
            <button class="nav-item" onclick="showPage('proposal',this)">
                <i class="fa-solid fa-clipboard-list"></i><span>Proposal</span>
            </button>
            <button class="nav-item" onclick="showPage('upload',this)">
                <i class="fa-solid fa-upload"></i><span>Upload</span>
            </button>
            <button class="nav-item" onclick="showPage('review',this)">
                <i class="fa-solid fa-star"></i><span>Review</span>
            </button>
            <button class="nav-item" onclick="showPage('settings',this)">
                <i class="fa-solid fa-gear"></i> <span>Settings</span>
            </button> 

        </nav>
        <a href="Front.html">
        <button class="nav-item logout">
            <i class="fa-solid fa-right-from-bracket"></i><span>Log out</span>
        </button>
    </a>
    </aside>

    <!-- ── MAIN ── -->
    <main class="main-content">

        <!-- Topbar -->
        <header class="topbar">
            <div class="topbar-left">
                <h3 id="pageTitle"><i class="fa-solid fa-desktop" style="margin-right:8px;"></i>Dashboard</h3>
            </div>
            <div class="topbar-right">
                <!--Dark Mood-->
                <div class="mode-toggle" id="darkModeToggle" style="cursor: pointer;">
                    <i class="fa-regular fa-moon" id="modeIcon"></i>
                </div>
                <i class="fa-regular fa-bell"></i>
                <div class="user-profile">
                    <img src="https://i.pravatar.cc/40?img=12" alt="User">
                    <div><h4> <?php echo $_SESSION['name']; ?> </h4></div>
                </div>
            </div>
        </header>

        <div id="profileData" data-name="<?php echo htmlspecialchars($_SESSION['name']); ?>" data-email="<?php echo htmlspecialchars($_SESSION['email'] ?? ''); ?>" data-phone="<?php echo htmlspecialchars($_SESSION['phone'] ?? ''); ?>" data-department="<?php echo htmlspecialchars($_SESSION['department'] ?? ''); ?>" style="display:none;"></div>

        <!-- ══ DASHBOARD PAGE ══ -->
        <div id="page-dashboard" class="page active">
            <section class="stats-grid">
                <div class="stat-card">
                    <i class="fa-solid fa-folder-open"></i>
                    <div><h3>All Projects</h3><p>38 projects</p></div>
                </div>
                <div class="stat-card">
                    <i class="fa-solid fa-file-arrow-up"></i>
                    <div><h3>Submissions</h3><p>3 Submitted</p></div>
                </div>
                <div class="stat-card">
                    <i class="fa-solid fa-comments"></i>
                    <div><h3>Feedback</h3><p>3 Comments</p></div>
                </div>
            </section>
           <section>
            <!-- pie chart-->
            <div class="dashboard-content">

                <!-- Research Status Chart -->
                <div class="research-status-container">
            
                    <h3 class="section-title">
                        <i class="fa-solid fa-chart-pie"></i>
                        Research Status
                    </h3>
            
                    <div class="chart-content">
                        <div class="chart-wrapper">
                            <canvas id="researchStatusChart"></canvas>
                        </div>
            
                        <div class="custom-legend">
                            <div class="legend-item">
                                <span class="legend-dot completed"></span>
                                <span id="legendCompleted">Completed 0%</span>
                            </div>
            
                            <div class="legend-item">
                                <span class="legend-dot pending"></span>
                                <span id="legendPending">Pending 0%</span>
                            </div>
            
                            <div class="legend-item">
                                <span class="legend-dot rejected"></span>
                                <span id="legendRejected">Rejected 0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            
                <!-- Feedback Card -->
                <div class="feedback-card">
                    <div class="feedback-header">
                        <i class="fa-solid fa-comments"></i>
                        Recent Feedback
                    </div>
            
                    <div class="feedback-item">
                        <img src="https://i.pravatar.cc/40?img=3">
                        <span>Dr. Sumith</span>
                        <button class="btn-comment">Comment</button>
                    </div>
            
                    <div class="feedback-item">
                        <img src="https://i.pravatar.cc/40?img=4">
                        <span>Dr. Kamal</span>
                        <button class="btn-comment">Comment</button>
                    </div>
            
                    <div class="feedback-item">
                        <img src="https://i.pravatar.cc/40?img=5">
                        <span>Dr. Nimal</span>
                        <button class="btn-comment">Comment</button>
                    </div>
            
                </div>
            
            </div>
            </section>
        </div>

        <!-- ══ PROPOSAL PAGE ══ -->
        <div id="page-proposal" class="page">
            <div class="proposal-card">
                <div class="proposal-header">
                    <h2><i class="fa-solid fa-clipboard-list" style="color:#2F5DD3;margin-right:10px;"></i>Research Status</h2>
                    <div class="review-controls">

                        <!-- Search -->
                        <div class="search-bar-wrap">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="searchInput" placeholder="Search title...">
                        </div>

                        <!-- Filter -->
                        <div class="filter-wrap">
                            <button class="filter-btn" id="filterBtn">
                                <i class="fa-solid fa-filter"></i>
                                <span id="filterLabel">Filter</span>
                                <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>
                            </button>
                            <div class="filter-dropdown" id="filterDropdown">
                                <a href="#" data-filter="all"><i class="fa-solid fa-border-all"></i>All</a>
                                <div class="divider"></div>
                                <a href="#" data-filter="pending"><i class="fa-solid fa-clock" style="color:#28a745;"></i>Pending</a>
                                <a href="#" data-filter="approved"><i class="fa-solid fa-circle-check" style="color:#e6a817;"></i>Approved</a>
                                <a href="#" data-filter="rejected"><i class="fa-solid fa-circle-xmark" style="color:#dc3545;"></i>Rejected</a>
                            </div>
                        </div>

                        <!-- Date Picker — real input floats over button -->
                        <div class="date-wrap">
                            <button class="date-btn" id="dateBtn">
                                <i class="fa-regular fa-calendar"></i>
                                <span id="dateBtnLabel">Pick Date</span>
                            </button>
                            <input type="date" class="real-date-input" id="datePicker">
                        </div>
                        <button class="clear-date" id="clearDate" title="Clear date">
                            <i class="fa-solid fa-xmark"></i>
                        </button>

                    </div>
                </div>

                <table class="research-table">
                    <thead>
                        <tr>
                            <th><i class="fa-solid fa-file-lines" style="color:#2F5DD3;margin-right:6px;"></i>Title</th>
                            <th><i class="fa-regular fa-calendar" style="color:#2F5DD3;margin-right:6px;"></i>Date</th>
                            <th><i class="fa-solid fa-tag" style="color:#2F5DD3;margin-right:6px;"></i>Status</th>
                            <th><i class="fa-solid fa-bolt" style="color:#2F5DD3;margin-right:6px;"></i>Action</th>
                            <th><i class="fa-solid fa-marker" style="color:#2F5DD3;margin-right:6px;"></i>Edit</th>
                            <th><i class="fa-solid fa-trash" style="color:#2F5DD3;margin-right:6px;"></i>Delete</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
                <div class="no-results" id="noResults" style="display:none;">
                    <i class="fa-solid fa-magnifying-glass-minus"></i>No matching records found.
                </div>
            </div>
        </div>

        <!-- ══ UPLOAD PAGE ══ -->
        <div id="page-upload" class="page">
           
            <div class="upload-card">
                <div class="upload-header">
                    <i class="fa-solid fa-book"></i>
                    Apply For Grant
                </div>
                <div class="form-grid">
                   
                        <form action="uploaddetails.php" method="POST" enctype="multipart/form-data">
                            <div class="input-row">
                            <input type="text" name="project_title" placeholder="Project_Title" class="custom-input" required>
                        <select id="coursestype" name="coursetype" class="custom-select" required>
                            <option value="">Select course Type</option>
                            <option value="AI">Artifical Inteigenss</option>
                            <option value="ICT">Information and communication techonology</option>
                            <option value="ML">Mashing Learning</option>
                        </select>
             </div>
                    <div class="input-row">
                        <input type="text" name="Estimated_Budget" placeholder="Estimated Budget" class="custom-input" required>
                        <div class="icon-input-container">
                            <select id="coursestype" name="durations" class="custom-select" required>
                                <option value="">Durations</option>
                                <option value="1">1 Month</option>
                                <option value="3">3 Month</option>
                                <option value="6">6 Month</option>
                                <option value="9">9 Month</option>
                                <option value="12">12 Month</option>
                            </select>
                        </div>
                    </div>
                    <textarea placeholder="Description" name="description" class="custom-textarea" rows="4" required></textarea>
                </div>
                <h2><i class="fa-solid fa-upload" style="color:#2F5DD3;margin-right:10px;"></i>Upload Research</h2>
                <p>Upload your research documents here. Accepted formats: PDF, DOCX, PPTX</p>
                <div class="upload-zone" onclick="document.getElementById('fileInput').click()">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span><b>Click to browse</b> or drag & drop your file here</span>
                
                    <input type="file" id="fileInput" name="research_file" hidden required>
                
                    <!-- modern file preview -->
                    <div id="filePreview" class="file-preview hidden">
                        <i class="fa-solid fa-file-lines"></i>
                        <div class="file-info">
                            <p id="fileName">No file selected</p>
                            <small id="fileSize"></small>
                        </div>
                        <button type="button" id="removeFile"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
                <button type="submit" name="submit" class="btn-upload">
                    <i class="fa-solid fa-paper-plane"></i>Submit Research
                </button>
            </form>
            </div>
        </div>

        <!-- ══ REVIEW PAGE ══ -->
        <div id="page-review" class="page">
            <div class="review-info-card">
                <h2><i class="fa-solid fa-star" style="color:#2F5DD3;margin-right:10px;"></i>Recent Feedback</h2>
                <div class="review-feedback-item">
                    <img src="https://i.pravatar.cc/48?img=3" alt="">
                    <div class="rf-info">
                        <strong>Dr. Sumith</strong>
                        <span>AI Research — 31/03/2024</span>
                    </div>
                    <button class="btn-open-comment"><i class="fa-regular fa-comment-dots"></i>View Comment</button>
                </div>
                <div class="review-feedback-item">
                    <img src="https://i.pravatar.cc/48?img=4" alt="">
                    <div class="rf-info">
                        <strong>Dr. Kamal</strong>
                        <span>Computer Research — 09/03/2024</span>
                    </div>
                    <button class="btn-open-comment"><i class="fa-regular fa-comment-dots"></i>View Comment</button>
                </div>
                <div class="review-feedback-item">
                    <img src="https://i.pravatar.cc/48?img=5" alt="">
                    <div class="rf-info">
                        <strong>Dr. Nimal</strong>
                        <span>Computer Research — 09/04/2024</span>
                    </div>
                    <button class="btn-open-comment"><i class="fa-regular fa-comment-dots"></i>View Comment</button>
                </div>
                <div class="review-feedback-item">
                    <img src="https://i.pravatar.cc/48?img=6" alt="">
                    <div class="rf-info">
                        <strong>Dr. Perera</strong>
                        <span>Data Science Study — 15/02/2024</span>
                    </div>
                    <button class="btn-open-comment"><i class="fa-regular fa-comment-dots"></i>View Comment</button>
                </div>
            </div>
        </div>

        <!-- ══ SETTINGS PAGE ══ -->
        <div id="page-settings" class="page">

            <div class="settings-card">

                <div class="settings-header">
                    <i class="fa-solid fa-user-gear"></i>
                    Account Settings
                </div>

                <?php if (isset($_GET['saved']) && $_GET['saved'] == '1'): ?>
                    <div class="save-message success">
                        <i class="fa-solid fa-circle-check"></i> Profile saved successfully.
                    </div>
                <?php endif; ?>

                <div class="profile-image-section">

                    <img src="https://i.pravatar.cc/120?img=12"
                         id="profilePreview"
                         class="settings-profile-img">

                    <label for="profileInput" class="change-photo-btn">
                        <i class="fa-solid fa-camera"></i>
                        Change Photo
                    </label>

                    <input type="file" id="profileInput" name="profile_photo" hidden>

                </div>

                <form class="settings-form" id="settingsForm" action="updateProfile.php?tab=settings" method="POST" enctype="multipart/form-data">

                    <div class="settings-grid">

                        <div class="settings-input-group">
                            <label for="studentName">Full Name</label>
                            <input type="text"
                                   id="studentName"
                                   name="name"
                                   value="<?php echo htmlspecialchars($_SESSION['name']); ?>"
                                   class="settings-input"
                                   placeholder="Full Name"
                                   required>
                        </div>

                        <div class="settings-input-group">
                            <label for="settingsEmail">Email</label>
                            <input type="email"
                                   id="settingsEmail"
                                   name="email"
                                   value="<?php echo htmlspecialchars($_SESSION['email'] ?? ''); ?>"
                                   placeholder="student@gmail.com"
                                   class="settings-input"
                                   required>
                        </div>

                    </div>

                    <div class="settings-grid">

                        <div class="settings-input-group">
                            <label for="settingsPhone">Phone Number</label>
                            <input type="text"
                                   id="settingsPhone"
                                   name="phone"
                                   value="<?php echo htmlspecialchars($_SESSION['phone'] ?? ''); ?>"
                                   placeholder="+94 77 123 4567"
                                   class="settings-input">
                        </div>

                        <div class="settings-input-group">
                            <label for="settingsDepartment">Department</label>
                            <input type="text"
                                   id="settingsDepartment"
                                   name="department"
                                   value="<?php echo htmlspecialchars($_SESSION['department'] ?? ''); ?>"
                                   placeholder="ICT Department"
                                   class="settings-input">
                        </div>

                    </div>

                    <div class="settings-grid">

                        <div class="settings-input-group">
                            <label for="settingsPassword">New Password</label>
                            <div class="password-control">
                                <input type="password"
                                       id="settingsPassword"
                                       name="password"
                                       placeholder="Enter new password"
                                       class="settings-input">
                                <button type="button" class="password-toggle" data-target="settingsPassword">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div class="settings-input-group">
                            <label for="settingsConfirmPassword">Confirm Password</label>
                            <div class="password-control">
                                <input type="password"
                                       id="settingsConfirmPassword"
                                       name="confirm_password"
                                       placeholder="Confirm password"
                                       class="settings-input">
                                <button type="button" class="password-toggle" data-target="settingsConfirmPassword">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                        </div>

                    </div>

                    <button type="submit" class="save-settings-btn">
                        <i class="fa-solid fa-floppy-disk"></i>
                        Save Changes
                    </button>

                </form>

            </div>

        </div>

    </main>
</div>



<!-- ── DETAIL MODAL ── -->
<div class="detail-overlay" id="detailOverlay">
    <div class="detail-modal">
        <div class="detail-modal-header">
            <h3><i class="fa-solid fa-file-lines" style="margin-right:8px;"></i>Research Detail</h3>
            <button class="modal-close" id="modalClose"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="detail-body" id="detailBody"></div>
        <div class="detail-footer">
            <button class="btn-close-modal" id="modalCloseBtn"><i class="fa-solid fa-xmark"></i> Close</button>
        </div>
    </div>
</div>

<!-- ── REVIEW COMMENT MODAL ── -->
<div class="comment-overlay" id="commentOverlay">
    <div class="comment-modal">
        <div class="comment-modal-header">
            <div>
                <h3><i class="fa-regular fa-comment-dots" style="margin-right:8px;"></i>Reviewer Comment</h3>
                <p>Quick feedback from your reviewer.</p>
            </div>
            <button class="modal-close" id="commentClose"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="comment-modal-body">
            <div class="comment-reviewer">
                <div class="comment-reviewer-icon"><i class="fa-solid fa-user"></i></div>
                <div class="comment-reviewer-text" id="commentReviewer">Reviewer</div>
            </div>
            <div class="comment-text" id="commentText">No comment available.</div>
        </div>
        <div class="comment-footer">
            <button class="comment-close-btn" id="commentCloseBtn"><i class="fa-solid fa-xmark"></i> Close</button>
        </div>
    </div>
</div>

<script src="debug.js?v=2" defer></script>
</body>
</html>

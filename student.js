/* ─── DATA ─── */
let researches = [];

fetch("getinform.php")
.then(response => response.json())
.then(data => {
    researches = data;
    render();
})
.catch(error => console.log(error));

let activeFilter="all", activeDate="", searchQuery="";

/* ─── HELPERS ─── */
function fmtDate(iso){const[y,m,d]=iso.split("-");return`${d}/${m}/${y}`;}
function badgeHTML(s){
    const map={pending:{cls:"badge-pending",icon:"fa-clock",label:"Pending"},approved:{cls:"badge-approved",icon:"fa-circle-check",label:"Approved"},rejected:{cls:"badge-rejected",icon:"fa-circle-xmark",label:"Rejected"}};
    const b=map[s];return`<span class="badge ${b.cls}"><i class="fa-solid ${b.icon}"></i>${b.label}</span>`;
}

/* ─── RENDER TABLE ─── */
function render(){
    const body=document.getElementById("tableBody");
    const noRes=document.getElementById("noResults");
    const filtered=researches.filter(r=>{
        const mf=activeFilter==="all"||r.status===activeFilter;
        const md=!activeDate||r.date===activeDate;
        const ms=!searchQuery||r.title.toLowerCase().includes(searchQuery.toLowerCase());
        return mf&&md&&ms;
    });
    if(!filtered.length){body.innerHTML="";noRes.style.display="block";return;}
    noRes.style.display="none";
    body.innerHTML=filtered.map(r=>`
        <tr>
            <td><div class="title-cell"><i class="fa-solid fa-file-lines"></i>${r.title}</div></td>
            <td>${r.date}</td>
            <td>${badgeHTML(r.status)}</td>
            <td><button class="btn-view" onclick="openDetail(${r.id})"><i class="fa-solid fa-eye"></i>View</button></td>
            <td>
            ${
            r.status === "pending"
            ? `<button class="btn-edit" onclick="openEdit(${r.id})"><i class="fa-solid fa-marker"></i>Edit</button>`
            : `<button class="btn-edit disabled" disabled>
            <i class="fa-solid fa-lock"></i>Edit
       </button>`}
       </td>
            <td><button class="btn-delete" onclick="deleteResearch(${r.id})"><i class="fa-solid fa-trash"></i>Delete</button></td>
            </tr>`).join("");
}

function formatTimestamp(ts){
    return new Date(ts * 1000).toISOString().split("T")[0];
}

/* ─── PAGE NAVIGATION ─── */
const pageTitles={
    dashboard:"<i class='fa-solid fa-desktop' style='margin-right:8px;'></i>Dashboard",
    proposal: "<i class='fa-solid fa-clipboard-list' style='margin-right:8px;'></i>Proposal",
    upload:   "<i class='fa-solid fa-upload' style='margin-right:8px;'></i>Upload",
    review:   "<i class='fa-solid fa-star' style='margin-right:8px;'></i>Review",
    settings:"<i class='fa-solid fa-gear' style='margin-right:8px;'></i>Settings",
};
function showPage(name, btn){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));
    document.getElementById("page-"+name).classList.add("active");
    btn.classList.add("active");
    document.getElementById("pageTitle").innerHTML=pageTitles[name];
}

function initSettingsForm(){
    const profileData = document.getElementById('profileData');
    if(!profileData) return;
    const data = profileData.dataset;
    const values = {
        settingsName: data.name || '',
        settingsEmail: data.email || '',
        settingsPhone: data.phone || '',
        settingsDepartment: data.department || ''
    };
    Object.entries(values).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if(el) el.value = value;
    });
}

function openPageFromQuery(){
    const params = new URLSearchParams(window.location.search);
    const page = params.get('tab');
    if(page){
        const btn = document.querySelector(`.nav-item[onclick="showPage('${page}',this)"]`);
        if(btn) showPage(page, btn);
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    initSettingsForm();
    openPageFromQuery();
});

/* ─── FILTER ─── */
const filterBtn=document.getElementById("filterBtn");
const filterDropdown=document.getElementById("filterDropdown");
filterBtn.addEventListener("click",e=>{e.stopPropagation();filterDropdown.classList.toggle("open");});
filterDropdown.querySelectorAll("a").forEach(a=>{
    a.addEventListener("click",e=>{
        e.preventDefault();
        activeFilter=a.dataset.filter;
        document.getElementById("filterLabel").textContent=a.textContent.trim();
        filterDropdown.classList.remove("open");
        render();
    });
});
document.addEventListener("click",()=>filterDropdown.classList.remove("open"));

/* ─── DATE PICKER ─── */
const datePicker  = document.getElementById("datePicker");
const dateBtnLabel= document.getElementById("dateBtnLabel");
const dateBtn     = document.getElementById("dateBtn");
const clearDate   = document.getElementById("clearDate");

// When the hidden input changes, update button label
datePicker.addEventListener("change",()=>{
    activeDate=datePicker.value;
    if(activeDate){
        dateBtnLabel.textContent=fmtDate(activeDate);
        dateBtn.classList.add("active");
        clearDate.style.display="inline-flex";
    } else {
        dateBtnLabel.textContent="Pick Date";
        dateBtn.classList.remove("active");
        clearDate.style.display="none";
    }
    render();
});

clearDate.addEventListener("click",()=>{
    activeDate="";datePicker.value="";
    dateBtnLabel.textContent="Pick Date";
    dateBtn.classList.remove("active");
    clearDate.style.display="none";
    render();
});

/* ─── SEARCH ─── */
document.getElementById("searchInput").addEventListener("input",e=>{searchQuery=e.target.value;render();});

/* ─── REVIEW COMMENT POPUP ─── */
function attachReviewCommentButtons(){
    document.querySelectorAll('.btn-open-comment').forEach(button=>{
        button.addEventListener('click',()=>{
            const name = button.dataset.reviewName || 'Reviewer';
            const comment = button.dataset.reviewComment || 'No comment available.';
            openReviewComment(name, comment);
        });
    });
}

function openReviewComment(name, comment){
    document.getElementById('commentReviewer').textContent = name;
    document.getElementById('commentText').textContent = comment;
    document.getElementById('commentOverlay').classList.add('open');
}

function closeReviewComment(){
    document.getElementById('commentOverlay').classList.remove('open');
}

attachReviewCommentButtons();

const commentOverlay = document.getElementById('commentOverlay');
const commentClose = document.getElementById('commentClose');
const commentCloseBtn = document.getElementById('commentCloseBtn');
if (commentOverlay) {
    commentOverlay.addEventListener('click', e => {
        if (e.target === commentOverlay) closeReviewComment();
    });
}
if (commentClose) commentClose.addEventListener('click', closeReviewComment);
if (commentCloseBtn) commentCloseBtn.addEventListener('click', closeReviewComment);




/* ─── DETAIL MODAL ─── 
function openDetail(id){
    const r=researches.find(x=>x.id===id);if(!r)return;
    const si={pending:{icon:"fa-clock",color:"#28a745"},approved:{icon:"fa-circle-check",color:"#e6a817"},rejected:{icon:"fa-circle-xmark",color:"#dc3545"}}[r.status];
    document.getElementById("detailBody").innerHTML=`
        <div class="detail-row"><i class="fa-solid fa-file-lines"></i><div><label>Title</label><span>${r.title}</span></div></div>
        <div class="detail-row"><i class="fa-regular fa-calendar"></i><div><label>Submitted Date</label><span>${fmtDate(r.date)}</span></div></div>
        <div class="detail-row"><i class="fa-solid ${si.icon}" style="color:${si.color};"></i><div><label>Status</label><span>${badgeHTML(r.status)}</span></div></div>
        <div class="detail-row"><i class="fa-solid fa-user-tie"></i><div><label>Supervisor</label><span>${r.supervisor}</span></div></div>
        <div class="detail-row"><i class="fa-solid fa-align-left"></i><div><label>Description</label><span>${r.description}</span></div></div>`;
    document.getElementById("detailOverlay").classList.add("open");
}
document.getElementById("modalClose").addEventListener("click",closeModal);
document.getElementById("modalCloseBtn").addEventListener("click",closeModal);
document.getElementById("detailOverlay").addEventListener("click",e=>{if(e.target===e.currentTarget)closeModal();});
function closeModal(){document.getElementById("detailOverlay").classList.remove("open");}

render(); */

function openDetail(id){
    const r = researches.find(x => x.id == id);
    if(!r) return;

    const si = {
        pending:{icon:"fa-clock",color:"#28a745"},
        approved:{icon:"fa-circle-check",color:"#e6a817"},
        rejected:{icon:"fa-circle-xmark",color:"#dc3545"}
    }[r.status];

    document.getElementById("detailBody").innerHTML = `
        <div class="detail-row">
            <i class="fa-solid fa-file-lines"></i>
            <div><label>Title</label><span>${r.title}</span></div>
        </div>

        <div class="detail-row">
            <i class="fa-regular fa-calendar"></i>
            <div><label>Date</label><span>${r.date}</span></div>
        </div>

        <div class="detail-row">
            <i class="fa-solid ${si.icon}" style="color:${si.color};"></i>
            <div><label>Status</label><span>${r.status}</span></div>
        </div>

        <div class="detail-row">
            <i class="fa-solid fa-align-left"></i>
            <div><label>course</label><span>${r.course}</span></div>
        </div>

        <div class="detail-row">
            <i class="fa-solid fa-align-left"></i>
            <div><label>Duration</label><span>${r.duration}</span></div>
        </div>

        <div class="detail-row">
        <i class="fa-solid fa-align-left"></i>
        <div><label>Estimate Budget</label><span>${r.buget}</span></div>
    </div>

        <div class="detail-row">
            <i class="fa-solid fa-align-left"></i>
            <div><label>Description</label><span>${r.description}</span></div>
        </div>

        
        <div class="detail-row">
            <i class="fa-solid fa-paperclip"></i>
            <div>
                <label>File</label>
                ${
                    r.file_name
                    ? `<a href="${r.file_name}" target="_blank">📄 Open File</a>`
                    : `<span style="color:red;">No file uploaded</span>`
                }
            </div>
        </div>
    `;

    document.querySelector(".detail-footer").innerHTML =
        `<button class="btn-close-modal" id="modalCloseBtn">Close</button>`;

    document.getElementById("detailOverlay").classList.add("open");

    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
    render();
}


/*
function openEdit(id){
    const r=researches.find(x=>x.id===id);if(!r)return;
    document.getElementById("detailBody").innerHTML=`
        <div class="detail-row"><i class="fa-solid fa-file-lines"></i><div><label>Title</label><input type="text" id="editTitle" value="${r.title}" class="edit-input" required></div></div>
        <div class="detail-row"><i class="fa-solid fa-tag"></i><div><label>Course</label><select id="editStatus" class="edit-input">
        <option value="">Durations</option>
        <option value="1">1 Month</option>
        <option value="3">3 Month</option>
        <option value="6">6 Month</option>
        <option value="9">9 Month</option>
        <option value="12">12 Month</option>
         </select></div></div>
        
        <div class="detail-row"><i class="fa-solid fa-tag"></i><div><label>Course</label><select id="editStatus" class="edit-input">
            <option value="pending">Artificial interligen</option>
            <option value="approved">Information and Communication Technology</option>
            <option value="rejected" >Machine Learnning</option>
        </select></div></div>
        <div class="detail-row"><i class="fa-solid fa-user-tie"></i><div><label>Estimated Buget</label><input type="text" id="editSupervisor" value="${r.supervisor}" class="edit-input" required></div></div>
        <div class="detail-row"><i class="fa-solid fa-align-left"></i><div><label>Description</label><textarea id="editDescription" class="edit-input">${r.description}</textarea></div></div>`;
    document.querySelector(".detail-footer").innerHTML = `<button class="btn-save" onclick="saveEdit(${r.id})"><i class="fa-solid fa-floppy-disk"></i> Save</button><button class="btn-close-modal" id="modalCloseBtn"><i class="fa-solid fa-xmark"></i> Close</button>`;
    document.getElementById("detailOverlay").classList.add("open");
    document.getElementById("modalCloseBtn").addEventListener("click",closeModal);
}*/

function openEdit(id){

    const r = researches.find(x => x.id == id);

    if(!r) return;

    document.getElementById("detailBody").innerHTML = `

        <!-- Title -->
        <div class="detail-row">
            <i class="fa-solid fa-file-lines"></i>
            <div>
                <label>Title</label>
                <input type="text"
                       id="editTitle"
                       value="${r.title}"
                       class="edit-input"
                       required>
            </div>
        </div>

        <!-- Duration -->
        <div class="detail-row">
            <i class="fa-solid fa-clock"></i>
            <div>
                <label>Duration</label>

                <select id="editDuration" class="edit-input">

                    <option value="1 Month"
                        ${r.duration=="1 Month" ? "selected" : ""}>
                        1 Month
                    </option>

                    <option value="3 Month"
                        ${r.duration=="3 Month" ? "selected" : ""}>
                        3 Month
                    </option>

                    <option value="6 Month"
                        ${r.duration=="6 Month" ? "selected" : ""}>
                        6 Month
                    </option>

                    <option value="9 Month"
                        ${r.duration=="9 Month" ? "selected" : ""}>
                        9 Month
                    </option>

                    <option value="12 Month"
                        ${r.duration=="12 Month" ? "selected" : ""}>
                        12 Month
                    </option>

                </select>
            </div>
        </div>

        <!-- Course -->
        <div class="detail-row">
            <i class="fa-solid fa-graduation-cap"></i>
            <div>
                <label>Course</label>

                <select id="editCourse" class="edit-input">

                    <option value="Artificial Intelligence"
                        ${r.course=="Artificial Intelligence" ? "selected" : ""}>
                        Artificial Intelligence
                    </option>

                    <option value="Information and Communication Technology"
                        ${r.course=="Information and Communication Technology" ? "selected" : ""}>
                        Information and Communication Technology
                    </option>

                    <option value="Machine Learning"
                        ${r.course=="Machine Learning" ? "selected" : ""}>
                        Machine Learning
                    </option>

                </select>
            </div>
        </div>

        <!-- Budget -->
        <div class="detail-row">
            <i class="fa-solid fa-money-bill"></i>
            <div>
                <label>Estimated Budget</label>

                <input type="text"
                       id="editBudget"
                       value="${r.buget}"
                       class="edit-input"
                       required>
            </div>
        </div>

        <!-- Description -->
        <div class="detail-row">
            <i class="fa-solid fa-align-left"></i>
            <div>
                <label>Description</label>

                <textarea id="editDescription"
                          class="edit-input">${r.description}</textarea>
            </div>
        </div>

    `;

    document.querySelector(".detail-footer").innerHTML = `
        <button class="btn-save" onclick="saveEdit(${r.id})">
            <i class="fa-solid fa-floppy-disk"></i>
            Save
        </button>

        <button class="btn-close-modal" id="modalCloseBtn">
            <i class="fa-solid fa-xmark"></i>
            Close
        </button>
    `;

    document.getElementById("detailOverlay").classList.add("open");

    document
        .getElementById("modalCloseBtn")
        .addEventListener("click", closeModal);
}




function saveEdit(id){
    const r=researches.find(x=>x.id===id);if(!r)return;
    r.title = document.getElementById("editTitle").value.trim() || r.title;
    r.date = document.getElementById("editDate").value || r.date;
    r.supervisor = document.getElementById("editSupervisor").value.trim() || r.supervisor;
    r.description = document.getElementById("editDescription").value.trim() || r.description;
    closeModal();
    render();
}

function deleteResearch(id){
    if(confirm("Are you sure you want to delete this research?")){
        const index = researches.findIndex(r => r.id === id);
        if(index !== -1){
            researches.splice(index, 1);
            render();
        }
    }
}

function updateStatus(id, status){
    const r=researches.find(x=>x.id===id);if(!r)return;
    r.status = status;
    render();
}

document.getElementById("modalClose").addEventListener("click",closeModal);
document.getElementById("modalCloseBtn").addEventListener("click",closeModal);
document.getElementById("detailOverlay").addEventListener("click",e=>{if(e.target===e.currentTarget)closeModal();});
function closeModal(){document.getElementById("detailOverlay").classList.remove("open");}

render();



const ctx = document.getElementById('researchStatusChart').getContext('2d');

const myChart = new Chart(ctx, {
    type: 'doughnut', // මැද හිස් නිසා doughnut chart එකක් තමයි ගැලපෙන්නේ
    data: {
        labels: ['Completed', 'Pending', 'Rejected'],
        datasets: [{
            data: [60, 25, 15], // මෙතනට ඔයාගේ dynamic values දාන්න
            backgroundColor: [
                '#28a745', // Green
                '#ffc107', // Yellow
                '#dc3545'  // Red
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    },
    options: {
        cutout: '70%', // මැද රවුම විශාල කරන්න (Donut look)
        plugins: {
            legend: {
                display: false // Side legend එක hide කරලා තියෙන්නේ image එකේ වගේම
            }
        },
        responsive: true,
        maintainAspectRatio: false
    },
    // මැද "60%" text එක පෙන්වීමට plugin එකක්
    plugins: [{
        id: 'textCenter',
        beforeDraw: function(chart) {
            var width = chart.width,
                height = chart.height,
                ctx = chart.ctx;

            ctx.restore();
            var fontSize = (height / 120).toFixed(2);
            ctx.font = fontSize + "em sans-serif";
            ctx.textBaseline = "middle";
            ctx.fontWeight = "bold";

            var text = "60%", // මෙතනත් dynamic කරන්න පුළුවන්
                textX = Math.round((width - ctx.measureText(text).width) / 2),
                textY = height / 2;

            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    }]
});

const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const modeIcon = document.getElementById('modeIcon');

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Icon එක මාරු කරන්න (හඳ සහ ඉර අතර)
    if (body.classList.contains('dark-mode')) {
        modeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark'); // User පස්සේ වෙලාවක ආවත් dark mode එක තියාගන්න
    } else {
        modeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Page එක load වෙද්දී කලින් තිබ්බ theme එක චෙක් කරන්න
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    modeIcon.classList.replace('fa-moon', 'fa-sun');
}


// file data show
document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const filePreview = document.getElementById("filePreview");
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");
    const removeFile = document.getElementById("removeFile");

    fileInput.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            fileName.textContent = file.name;
            fileSize.textContent = (file.size / 1024).toFixed(1) + " KB";

            filePreview.classList.remove("hidden");
        }
    });

    removeFile.addEventListener("click", () => {
        fileInput.value = "";
        filePreview.classList.add("hidden");
    });
});

settings:"<i class='fa-solid fa-gear' style='margin-right:8px;'></i>Settings"

const pageTitles={
    dashboard:"<i class='fa-solid fa-desktop' style='margin-right:8px;'></i>Dashboard",
    proposal:"<i class='fa-solid fa-clipboard-list' style='margin-right:8px;'></i>Proposal",
    upload:"<i class='fa-solid fa-upload' style='margin-right:8px;'></i>Upload",
    review:"<i class='fa-solid fa-star' style='margin-right:8px;'></i>Review",
    settings:"<i class='fa-solid fa-gear' style='margin-right:8px;'></i>Settings",
};

/* ─── PROFILE IMAGE PREVIEW ─── */

const profileInput = document.getElementById("profileInput");
const profilePreview = document.getElementById("profilePreview");

if(profileInput){

    profileInput.addEventListener("change", function(){

        const file = this.files[0];

        if(file){

            const reader = new FileReader();

            reader.onload = function(e){

                profilePreview.src = e.target.result;

            }

            reader.readAsDataURL(file);

        }

    });

}
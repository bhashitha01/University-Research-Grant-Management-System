
/* ─── DATA ─── */
const researches = [
    {id:1,title:"AI Research",       date:"2024-03-31",status:"pending",  supervisor:"Dr. Sumith", description:"Research on Artificial Intelligence and machine learning applications."},
    {id:2,title:"Computer Research", date:"2024-03-09",status:"approved", supervisor:"Dr. Kamal",  description:"Study on modern computing architectures and distributed systems."},
    {id:3,title:"Computer Research", date:"2024-04-09",status:"rejected", supervisor:"Dr. Nimal",  description:"Analysis of computer networking protocols — rejected due to scope issues."},
    {id:4,title:"Data Science Study",date:"2024-02-15",status:"approved", supervisor:"Dr. Perera", description:"Exploration of big data analytics and visualization methods."},
    {id:5,title:"IoT Security",      date:"2024-01-20",status:"pending",  supervisor:"Dr. Sumith", description:"Research on security vulnerabilities in IoT devices."},
];

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
            <td>${fmtDate(r.date)}</td>
            <td>${badgeHTML(r.status)}</td>
            <td><button class="btn-view" onclick="openDetail(${r.id})"><i class="fa-solid fa-eye"></i>View</button></td>
        </tr>`).join("");
}

/* ─── PAGE NAVIGATION ─── */
const pageTitles={
    dashboard:"<i class='fa-solid fa-desktop' style='margin-right:8px;'></i>Dashboard",
    proposal: "<i class='fa-solid fa-clipboard-list' style='margin-right:8px;'></i>Proposal",
    upload:   "<i class='fa-solid fa-upload' style='margin-right:8px;'></i>Upload",
    review:   "<i class='fa-solid fa-star' style='margin-right:8px;'></i>Review",
};
function showPage(name, btn){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));
    document.getElementById("page-"+name).classList.add("active");
    btn.classList.add("active");
    document.getElementById("pageTitle").innerHTML=pageTitles[name];
}

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

/* ─── DETAIL MODAL ─── */
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

render();

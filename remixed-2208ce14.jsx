import { useState, useRef, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Search, FolderOpen, Bot, Settings,
  Bell, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Upload, Download, Trash2, Eye, FileText, FileSpreadsheet,
  Image, File, Send, Paperclip, X, CheckCircle, Clock,
  AlertTriangle, TrendingUp, TrendingDown, BookmarkCheck,
  Building2, MapPin, CalendarDays, DollarSign, ShieldCheck,
  Filter, ArrowUpDown, RefreshCw, ExternalLink, Globe,
  Cpu, Lock, Activity, ZapIcon, FileSearch, BarChart2,
  Users, Database, Layers, Tag, Briefcase, FileType2,
  PlusCircle, Info, FolderPlus, Folder, FolderEdit,
  AlertCircle, Edit2, MoreVertical, Check, FilePlus2,
  ChevronsLeft, ChevronsRight, Package, Boxes,
  SlidersHorizontal, RotateCcw
} from "lucide-react";
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";

/* ═══════════════════════════════════════════════════
   TENDER SAHAYAK v4
   1. Paginated tender table
   2. All India states/UTs + smart date/category filters
   3. Folder-based document library with rename/delete
═══════════════════════════════════════════════════ */

const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --navy:#0A1628;--navy2:#0F1F38;--navy3:#162944;--navy4:#1D3557;
      --saffron:#E85D04;--gold:#D4A017;--ashoka:#1565C0;--ashoka2:#1E88E5;
      --green:#2E7D32;--red:#C62828;--amber:#E65100;
      --off:#F2F5FA;--border:#D1D9E6;--border2:#B8C5D9;
      --text:#0A1628;--text2:#2E4168;--muted:#5A6E8C;--muted2:#8A9BB5;
      --card:#FFFFFF;--sw:252px;
    }
    html,body{height:100%;font-family:'IBM Plex Sans',sans-serif;background:var(--off);color:var(--text)}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
    .fi{animation:fadeIn .32s ease both}
    .fi2{animation:fadeIn .32s .06s ease both}
    .fi3{animation:fadeIn .32s .12s ease both}
    .fi4{animation:fadeIn .32s .18s ease both}
    .si{animation:slideIn .28s ease both}
    .sci{animation:scaleIn .22s ease both}
    .spin-a{animation:spin .75s linear infinite}
    .blink-dot{animation:blink 1.6s infinite}
    .shake-a{animation:shake .3s ease}
    table{border-collapse:collapse;width:100%}
    th{background:#EBF0FA;color:var(--text2);font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;padding:9px 13px;text-align:left;border-bottom:2px solid var(--border);white-space:nowrap}
    td{padding:10px 13px;font-size:12.5px;border-bottom:1px solid #EEF2F8;vertical-align:middle}
    tbody tr{transition:background .12s;cursor:pointer}
    tbody tr:hover{background:#EFF4FF}
    .inp{width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;color:var(--text);background:#fff;outline:none;transition:border-color .2s,box-shadow .2s}
    .inp:focus{border-color:var(--ashoka);box-shadow:0 0 0 3px rgba(21,101,192,.1)}
    .btn-p{padding:7px 16px;border-radius:6px;border:none;cursor:pointer;background:var(--ashoka);color:#fff;font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:12.5px;transition:background .18s,transform .1s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
    .btn-p:hover{background:var(--ashoka2)}
    .btn-p:active{transform:scale(.97)}
    .btn-s{padding:6px 14px;border-radius:6px;border:1.5px solid var(--border);cursor:pointer;background:#fff;color:var(--text2);font-family:'IBM Plex Sans',sans-serif;font-weight:500;font-size:12px;transition:all .18s;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
    .btn-s:hover{border-color:var(--ashoka);color:var(--ashoka);background:#EFF4FF}
    .btn-danger{padding:7px 16px;border-radius:6px;border:none;cursor:pointer;background:#C62828;color:#fff;font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:12.5px;transition:background .18s;display:inline-flex;align-items:center;gap:6px}
    .btn-danger:hover{background:#B71C1C}
    .nav-btn{width:100%;display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:7px;border:none;cursor:pointer;margin-bottom:1px;transition:all .18s;background:transparent;color:#8A9BB5;font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:400;text-align:left;white-space:nowrap;overflow:hidden}
    .nav-btn.active{background:rgba(21,101,192,.18);color:#42A5F5;font-weight:600}
    .nav-btn:hover:not(.active){background:rgba(255,255,255,.05);color:#CBD5E1}
    .td{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--saffron);margin:0 2px;animation:blink 1.2s infinite}
    .td:nth-child(2){animation-delay:.2s}.td:nth-child(3){animation-delay:.4s}
    .modal-overlay{position:fixed;inset:0;background:rgba(6,16,30,.55);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
    select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6E8C' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:30px}
  `}</style>
);

/* ══ ALL INDIA STATES & UTs ══ */
const INDIA_LOCATIONS = [
  "All States / UTs",
  "── States ──",
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "── Union Territories ──",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu",
  "Delhi (NCT)","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
  "── Pan India ──",
  "Nationwide","Pan India / Remote"
];

const PRODUCT_SERVICES = [
  "All Products & Services",
  "── Civil & Infrastructure ──",
  "Road Construction","Building Construction","Bridge & Flyover","Dam & Irrigation",
  "Railway Infrastructure","Metro Rail","Ports & Waterways",
  "── Information Technology ──",
  "Hardware Procurement","Software & Licensing","Networking Equipment","IT Services & AMC",
  "Cloud Services","Cybersecurity","Data Center",
  "── Energy & Environment ──",
  "Solar Power","Wind Energy","Electric Vehicles","Smart Metering","Water Treatment",
  "Waste Management","Green Infrastructure",
  "── Services ──",
  "Consulting & Advisory","Facility Management","Catering Services","Security Services",
  "Transport & Logistics","Printing & Stationery","Training & Capacity Building",
  "── Healthcare & Education ──",
  "Medical Equipment","Pharmaceuticals","Hospital Infrastructure","School Furniture",
  "Lab Equipment","Digital Education Tools",
  "── Maintenance & Repair ──",
  "Annual Maintenance Contract","Equipment Repair","Housekeeping","Landscaping",
];

const SOURCES = ["All Sources","GeM Portal","CPPP","eProcure","NIC Tenders","State Portals","PSU Portals","Defence Procurement"];
const CATEGORIES = ["All Categories","Infrastructure","IT / Technology","Maintenance","Energy","Consulting","Services","Healthcare","Education","Defence"];
const PAGE_SIZES = [5, 10, 20, 50];

/* ══ GENERATE 40 MOCK TENDERS ══ */
const makeTenders = () => {
  const titles = [
    "Construction of Rural Roads under PMGSY Phase-III","Procurement of IT Equipment & Networking Hardware",
    "Annual Maintenance Contract – Lifts & Escalators","Supply & Installation of Solar Panels – Govt. Buildings",
    "Consultancy Services – Smart City Data Infrastructure","Catering & Facility Management – Central Secretariat",
    "Supply of Medical Equipment to District Hospitals","Development of Mobile Application for Citizen Services",
    "Construction of Multi-Level Car Parking – City Centre","Procurement of Electric Buses for State Transport",
    "Supply of Laboratory Equipment – Central University","Digital Literacy Programme – Rural Areas",
    "Construction of Community Health Centres","Procurement of CCTV Surveillance System – Metro Stations",
    "Supply of Uniforms & Accessories – State Police","Construction of Staff Quarters – Govt. Employees",
    "Procurement of Firefighting Equipment – Municipal Corp.","Supply of Furniture for Primary Schools",
    "Operation of Solid Waste Management Plant","Water Treatment Plant Upgradation",
    "Installation of LED Street Lights","Development of Land Records Portal",
    "Supply of Ambulances – Emergency Services","Construction of Foot Over Bridges",
    "Procurement of Tractor & Farm Equipment","Renovation of District Courts",
    "Construction of Community Toilet Blocks","Supply of Safety Equipment – Mining Dept.",
    "Integrated Traffic Management System","Construction of Stadiums & Sports Complex",
    "Supply of Printing Equipment – Govt. Press","Cloud Migration of Govt. IT Systems",
    "District Hospital Equipment Procurement","Consultancy for Urban Transport Master Plan",
    "Supply of Rice & Pulses – PDS System","Construction of Check Dams & Ponds",
    "Procurement of Body Cameras – Police Force","Rooftop Solar for Govt. Schools",
    "Smart Classroom Equipment – Kendriya Vidyalaya","E-Governance Platform Development",
  ];
  const orgs = [
    "NRIDA","BSNL Corporate Office","Airports Authority of India","MNRE Procurement Division",
    "Smart Cities Mission","DOPT, GoI","NHM Directorate","NIC MeitY",
    "Municipal Corp. Mumbai","SBSTC, Kolkata","UGC New Delhi","Digital India Corp.",
    "MoHFW","Delhi Metro Rail Corp.","State Police Dept.","CPWD New Delhi",
    "Municipal Fire Dept.","State Education Dept.","NMCG","Jal Shakti Ministry",
    "Urban Local Body","Revenue Dept.","CATS Delhi","NHAI",
    "Agriculture Dept.","Dept. of Justice","Swachh Bharat Mission","Coal India Ltd.",
    "MoRTH","SAI","DIPP","MeitY","ESIC","DIMTS","FCI","NABARD","BPR&D","SECI","KVS","NeSDA"
  ];
  const ministries = [
    "Ministry of Rural Development","Ministry of Communications","Ministry of Civil Aviation",
    "Ministry of New & Renewable Energy","Ministry of Housing & Urban Affairs","Ministry of Personnel",
    "Ministry of Health & Family Welfare","Ministry of Electronics & IT","Ministry of Road Transport",
    "Ministry of Education","Ministry of Agriculture","Ministry of Law & Justice",
    "Ministry of Home Affairs","Ministry of Finance","Ministry of Defence",
  ];
  const states = ["Rajasthan","Delhi","Mumbai","Karnataka","Tamil Nadu","West Bengal","Gujarat","Uttar Pradesh","Madhya Pradesh","Kerala","Punjab","Haryana","Telangana","Andhra Pradesh","Nationwide"];
  const cats = ["Infrastructure","IT / Technology","Maintenance","Energy","Consulting","Services","Healthcare","Education"];
  const values = ["₹45,00,000","₹78,50,000","₹1,10,00,000","₹2,80,00,000","₹4,20,00,000","₹8,50,00,000","₹12,00,00,000","₹22,00,00,000","₹55,00,000","₹3,40,00,000","₹6,75,00,000","₹18,00,00,000"];
  const emds = ["₹90,000","₹1,57,000","₹2,20,000","₹5,60,000","₹8,40,000","₹17,00,000","₹24,00,000","₹44,00,000","₹1,10,000","₹6,80,000","₹13,50,000","₹36,00,000"];
  const dates = ["25 Mar 2025","28 Mar 2025","02 Apr 2025","10 Apr 2025","15 Apr 2025","20 Apr 2025","25 Apr 2025","01 May 2025","10 May 2025","18 May 2025","25 May 2025","05 Jun 2025"];
  const startDates = ["01 Mar 2025","05 Mar 2025","10 Mar 2025","15 Mar 2025","18 Mar 2025","20 Mar 2025"];
  return titles.map((title, i) => ({
    id: `TND-2025-${String(i+100).padStart(4,'0')}`,
    title,
    org: orgs[i % orgs.length],
    ministry: ministries[i % ministries.length],
    deadline: dates[i % dates.length],
    startDate: startDates[i % startDates.length],
    value: values[i % values.length],
    emd: emds[i % emds.length],
    cat: cats[i % cats.length],
    loc: states[i % states.length],
    status: i % 5 === 0 ? "closing" : "open",
    gem: i % 3 === 0,
    ref: `${orgs[i%orgs.length].slice(0,4).toUpperCase()}/${cats[i%cats.length].slice(0,3).toUpperCase()}/2025/${i+100}`,
    product: PRODUCT_SERVICES[Math.floor(Math.random()*PRODUCT_SERVICES.filter(p=>!p.startsWith('─')).length)+2] || "Road Construction",
    source: SOURCES[i % (SOURCES.length-1) + 1],
  }));
};
const ALL_TENDERS = makeTenders();

/* ══ INITIAL FOLDER STRUCTURE ══ */
const initFolders = () => [
  {
    id:"f1", name:"Registration Documents", color:"#1565C0", createdAt:"01 Jan 2025",
    files:[
      {id:"d1",name:"PAN Card – Infratech Pvt Ltd.pdf",type:"pdf",size:"230 KB",uploadedAt:"01 Mar 2025",status:"verified"},
      {id:"d2",name:"GST Registration Certificate.pdf",type:"pdf",size:"415 KB",uploadedAt:"01 Mar 2025",status:"verified"},
      {id:"d5",name:"Work Experience Certificate.jpg",type:"img",size:"1.8 MB",uploadedAt:"20 Jan 2025",status:"verified"},
    ]
  },
  {
    id:"f2", name:"BSNL IT Tender 2025", color:"#E85D04", createdAt:"10 Mar 2025",
    files:[
      {id:"d3",name:"Technical Bid – BSNL IT Tender.docx",type:"docx",size:"1.2 MB",uploadedAt:"18 Mar 2025",status:"draft"},
    ]
  },
  {
    id:"f3", name:"Financial Records", color:"#2E7D32", createdAt:"01 Feb 2025",
    files:[
      {id:"d4",name:"Audited Financial Statement 2023-24.xlsx",type:"xlsx",size:"890 KB",uploadedAt:"15 Feb 2025",status:"verified"},
    ]
  },
  {
    id:"f4", name:"PMGSY Road Project", color:"#6A1B9A", createdAt:"05 Mar 2025",
    files:[
      {id:"d6",name:"TOR – PMGSY Road Construction.pdf",type:"pdf",size:"3.4 MB",uploadedAt:"10 Mar 2025",status:"processing"},
    ]
  },
];

/* ══ FILE HELPERS ══ */
const FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.json";
const getFileIcon = (name, size=15) => {
  const ext = name?.split('.').pop()?.toLowerCase();
  const p = {size,strokeWidth:1.8};
  if(["pdf"].includes(ext)) return <FileText {...p} color="#DC2626"/>;
  if(["doc","docx"].includes(ext)) return <FileText {...p} color="#1565C0"/>;
  if(["xls","xlsx","csv"].includes(ext)) return <FileSpreadsheet {...p} color="#166534"/>;
  if(["jpg","jpeg","png","gif","webp"].includes(ext)) return <Image {...p} color="#9333EA"/>;
  if(["txt","md","json"].includes(ext)) return <FileType2 {...p} color="#0891B2"/>;
  return <File {...p} color="#64748B"/>;
};
const formatBytes = b => b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
const processFile = (file) => new Promise((resolve,reject) => {
  const ext = file.name.split('.').pop().toLowerCase();
  if(["jpg","jpeg","png","gif","webp"].includes(ext)){
    const r=new FileReader(); r.onload=()=>resolve({kind:"image",b64:r.result.split(",")[1],mediaType:file.type||`image/${ext==="jpg"?"jpeg":ext}`,name:file.name,size:formatBytes(file.size)}); r.onerror=reject; r.readAsDataURL(file);
  } else if(ext==="pdf"){
    const r=new FileReader(); r.onload=()=>resolve({kind:"pdf",b64:r.result.split(",")[1],mediaType:"application/pdf",name:file.name,size:formatBytes(file.size)}); r.onerror=reject; r.readAsDataURL(file);
  } else if(["doc","docx"].includes(ext)){
    const r=new FileReader(); r.onload=async()=>{ try{const res=await mammoth.extractRawText({arrayBuffer:r.result});resolve({kind:"text",text:res.value,name:file.name,size:formatBytes(file.size),label:"Word Document"})}catch{resolve({kind:"text",text:`[Could not parse ${file.name}]`,name:file.name,size:formatBytes(file.size)})} }; r.onerror=reject; r.readAsArrayBuffer(file);
  } else if(["xls","xlsx","csv"].includes(ext)){
    const r=new FileReader(); r.onload=()=>{ try{const wb=XLSX.read(r.result,{type:"binary"});let out="";wb.SheetNames.forEach(sn=>{out+=`\n--- Sheet: ${sn} ---\n`;out+=XLSX.utils.sheet_to_csv(wb.Sheets[sn])});resolve({kind:"text",text:out.trim(),name:file.name,size:formatBytes(file.size),label:"Spreadsheet"})}catch{resolve({kind:"text",text:`[Could not parse ${file.name}]`,name:file.name,size:formatBytes(file.size)})} }; r.onerror=reject; r.readAsBinaryString(file);
  } else {
    const r=new FileReader(); r.onload=()=>resolve({kind:"text",text:r.result,name:file.name,size:formatBytes(file.size),label:ext.toUpperCase()}); r.onerror=reject; r.readAsText(file);
  }
});
const fileToBlock = pf => {
  if(pf.kind==="image") return {type:"image",source:{type:"base64",media_type:pf.mediaType,data:pf.b64}};
  if(pf.kind==="pdf") return {type:"document",source:{type:"base64",media_type:"application/pdf",data:pf.b64}};
  return {type:"text",text:`--- File: ${pf.name} (${pf.size}) ---\n${pf.text}\n--- End ---`};
};

/* ══ EMBLEM ══ */
const Emblem = ({size=36}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="47" fill="#0A1628" stroke="#D4A017" strokeWidth="2.5"/>
    <circle cx="50" cy="50" r="24" fill="none" stroke="#D4A017" strokeWidth="1.5"/>
    {Array.from({length:24},(_,i)=>{const a=(i/24)*Math.PI*2;return <line key={i} x1={50+24*Math.cos(a)} y1={50+24*Math.sin(a)} x2={50+30*Math.cos(a)} y2={50+30*Math.sin(a)} stroke="#D4A017" strokeWidth="1.2"/>})}
    <circle cx="50" cy="50" r="7" fill="#D4A017"/>
    <circle cx="50" cy="50" r="3.5" fill="#0A1628"/>
    <text x="50" y="78" textAnchor="middle" fill="#D4A017" fontSize="9" fontFamily="serif" fontWeight="bold">सहायक</text>
  </svg>
);

/* ══ STATUS CHIP ══ */
const Chip = ({status}) => {
  const M={open:{bg:"#E8F5E9",c:"#2E7D32",label:"OPEN",dot:"#4CAF50"},closing:{bg:"#FFF3E0",c:"#E65100",label:"CLOSING SOON",dot:"#FF9800"},verified:{bg:"#E3F2FD",c:"#1565C0",label:"VERIFIED",dot:"#42A5F5"},draft:{bg:"#F3E5F5",c:"#6A1B9A",label:"DRAFT",dot:"#AB47BC"},processing:{bg:"#FFF8E1",c:"#F57F17",label:"PROCESSING",dot:"#FFC107"}};
  const s=M[status]||M.open;
  return <span style={{background:s.bg,color:s.c,fontSize:9.5,fontWeight:700,padding:"2px 7px",borderRadius:3,letterSpacing:".06em",display:"inline-flex",alignItems:"center",gap:4,fontFamily:"'IBM Plex Mono',monospace",whiteSpace:"nowrap"}}><span style={{width:5,height:5,borderRadius:"50%",background:s.dot,display:"inline-block"}}/>{s.label}</span>;
};

const Spark = ({data,color,h=30}) => {
  const max=Math.max(...data),min=Math.min(...data);
  const pts=data.map((v,i)=>`${(i/(data.length-1))*78},${h-((v-min)/(max-min||1))*(h-6)-3}`).join(" ");
  return <svg width="78" height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="78" cy={h-((data[data.length-1]-min)/(max-min||1))*(h-6)-3} r="2.5" fill={color}/></svg>;
};

const MiniBar = ({pct,color}) => (
  <div style={{background:"#E8EDF5",borderRadius:3,height:3,width:"100%",overflow:"hidden",marginTop:4}}>
    <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3}}/>
  </div>
);

const StatCard = ({label,value,icon:Icon,accent,sub,trend,spark}) => (
  <div className="fi" style={{background:"#fff",border:"1px solid var(--border)",borderRadius:8,padding:"16px 18px",position:"relative",overflow:"hidden",boxShadow:"0 1px 3px rgba(10,22,40,.05)"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div>
        <div style={{fontSize:10,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".09em",marginBottom:9,display:"flex",alignItems:"center",gap:5}}><Icon size={11} strokeWidth={2}/>{label}</div>
        <div style={{fontSize:25,fontWeight:700,fontFamily:"'Crimson Pro',serif",color:"var(--text)",lineHeight:1}}>{value}</div>
        <div style={{fontSize:10,color:trend>0?"#2E7D32":"#C62828",marginTop:5,fontWeight:600,display:"flex",alignItems:"center",gap:3}}>
          {trend>0?<TrendingUp size={10}/>:<TrendingDown size={10}/>} {Math.abs(trend)} {sub}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
        <div style={{width:36,height:36,borderRadius:8,background:accent+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={18} color={accent} strokeWidth={1.8}/></div>
        {spark && <Spark data={spark} color={accent}/>}
      </div>
    </div>
  </div>
);

/* ══ DELETE CONFIRM MODAL ══ */
const DeleteModal = ({item, itemType, onConfirm, onCancel}) => {
  const [shake, setShake] = useState(false);
  const isFolder = itemType === "folder";
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="sci" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:12,padding:"28px 32px",width:420,boxShadow:"0 20px 60px rgba(6,16,30,.3)",border:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:18}}>
          <div style={{width:44,height:44,borderRadius:10,background:"#FEF2F2",border:"1.5px solid #FFCDD2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <AlertTriangle size={22} color="#C62828" strokeWidth={2}/>
          </div>
          <div>
            <div style={{fontFamily:"'Crimson Pro',serif",fontSize:19,fontWeight:700,color:"var(--text)",marginBottom:5}}>
              {isFolder ? "Delete Folder?" : "Delete File?"}
            </div>
            <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>
              {isFolder
                ? <>You are about to permanently delete the folder <strong style={{color:"var(--text)"}}>{item.name}</strong> and all <strong style={{color:"#C62828"}}>{item.files?.length || 0} file{item.files?.length!==1?"s":""}</strong> inside it. This action <strong>cannot be undone.</strong></>
                : <>You are about to permanently delete <strong style={{color:"var(--text)"}}>{item.name}</strong>. This action <strong>cannot be undone.</strong></>
              }
            </div>
          </div>
        </div>
        {isFolder && item.files?.length > 0 && (
          <div style={{background:"#FFF8E1",border:"1px solid #FFE082",borderRadius:7,padding:"10px 13px",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <AlertCircle size={14} color="#F57F17"/>
            <span style={{fontSize:12,color:"#E65100",fontWeight:500}}>{item.files.length} file{item.files.length!==1?"s":""} will be permanently deleted along with this folder.</span>
          </div>
        )}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn-s" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}><Trash2 size={13}/>Yes, Delete Permanently</button>
        </div>
      </div>
    </div>
  );
};

/* ══ RENAME MODAL ══ */
const RenameModal = ({item, itemType, onConfirm, onCancel}) => {
  const [val, setVal] = useState(item.name);
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="sci" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:12,padding:"26px 30px",width:400,boxShadow:"0 20px 60px rgba(6,16,30,.3)",border:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:18,fontWeight:700,color:"var(--text)",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <Edit2 size={16} color="var(--ashoka)"/>Rename {itemType==="folder"?"Folder":"File"}
        </div>
        <label style={{fontSize:10.5,fontWeight:600,color:"var(--muted)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>
          {itemType==="folder"?"Folder Name":"File Name"}
        </label>
        <input className="inp" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&val.trim()&&onConfirm(val.trim())} autoFocus
          style={{marginBottom:18}}/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn-s" onClick={onCancel}>Cancel</button>
          <button className="btn-p" onClick={()=>val.trim()&&onConfirm(val.trim())} disabled={!val.trim()}><Check size={13}/>Rename</button>
        </div>
      </div>
    </div>
  );
};

/* ══ CREATE FOLDER MODAL ══ */
const CreateFolderModal = ({onConfirm, onCancel}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1565C0");
  const COLORS = ["#1565C0","#E85D04","#2E7D32","#6A1B9A","#C62828","#D4A017","#0891B2","#374151"];
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="sci" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:12,padding:"26px 30px",width:400,boxShadow:"0 20px 60px rgba(6,16,30,.3)",border:"1px solid var(--border)"}}>
        <div style={{fontFamily:"'Crimson Pro',serif",fontSize:18,fontWeight:700,color:"var(--text)",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <FolderPlus size={16} color="var(--ashoka)"/>Create New Folder
        </div>
        <label style={{fontSize:10.5,fontWeight:600,color:"var(--muted)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Folder Name</label>
        <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. PMGSY Bid Documents 2025" autoFocus onKeyDown={e=>e.key==="Enter"&&name.trim()&&onConfirm(name.trim(),color)} style={{marginBottom:16}}/>
        <label style={{fontSize:10.5,fontWeight:600,color:"var(--muted)",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:".08em"}}>Folder Color</label>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {COLORS.map(c=>(
            <button key={c} onClick={()=>setColor(c)} style={{width:26,height:26,borderRadius:6,background:c,border:color===c?"2.5px solid var(--text)":"2px solid transparent",cursor:"pointer",transition:"border .15s"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn-s" onClick={onCancel}>Cancel</button>
          <button className="btn-p" onClick={()=>name.trim()&&onConfirm(name.trim(),color)} disabled={!name.trim()}><FolderPlus size={13}/>Create Folder</button>
        </div>
      </div>
    </div>
  );
};

/* ══ DOCUMENT LIBRARY ══ */
const DocumentLibrary = ({lang}) => {
  const T = (en,hi) => lang==="HI"?hi:en;
  const [folders, setFolders] = useState(initFolders());
  const [openFolders, setOpenFolders] = useState({"f1":true});
  const [modal, setModal] = useState(null); // {type:"delete"|"rename"|"createFolder"|"addFile", target, targetType}
  const [selectedFolder, setSelectedFolder] = useState(null);
  const fileInputRef = useRef();

  const toggleFolder = id => setOpenFolders(p=>({...p,[id]:!p[id]}));

  const handleDeleteFolder = (folder) => setModal({type:"delete",target:folder,targetType:"folder"});
  const handleDeleteFile = (file, folderId) => setModal({type:"delete",target:file,targetType:"file",folderId});
  const handleRenameFolder = (folder) => setModal({type:"rename",target:folder,targetType:"folder"});
  const handleRenameFile = (file, folderId) => setModal({type:"rename",target:file,targetType:"file",folderId});

  const confirmDelete = () => {
    if(modal.targetType==="folder"){
      setFolders(p=>p.filter(f=>f.id!==modal.target.id));
    } else {
      setFolders(p=>p.map(f=>f.id===modal.folderId?{...f,files:f.files.filter(d=>d.id!==modal.target.id)}:f));
    }
    setModal(null);
  };
  const confirmRename = (newName) => {
    if(modal.targetType==="folder"){
      setFolders(p=>p.map(f=>f.id===modal.target.id?{...f,name:newName}:f));
    } else {
      setFolders(p=>p.map(f=>f.id===modal.folderId?{...f,files:f.files.map(d=>d.id===modal.target.id?{...d,name:newName}:d)}:f));
    }
    setModal(null);
  };
  const confirmCreateFolder = (name, color) => {
    const newF = {id:"f"+Date.now(),name,color,createdAt:new Date().toLocaleDateString("en-IN"),files:[]};
    setFolders(p=>[...p,newF]);
    setOpenFolders(p=>({...p,[newF.id]:true}));
    setModal(null);
  };
  const handleFileUpload = async (files, folderId) => {
    for(const f of Array.from(files)){
      const ext = f.name.split('.').pop().toLowerCase();
      const type = ["jpg","jpeg","png","gif","webp"].includes(ext)?"img":["xls","xlsx","csv"].includes(ext)?"xlsx":["doc","docx"].includes(ext)?"docx":ext;
      const newFile = {id:"d"+Date.now()+Math.random(),name:f.name,type,size:formatBytes(f.size),uploadedAt:new Date().toLocaleDateString("en-IN"),status:"processing"};
      setFolders(p=>p.map(fold=>fold.id===folderId?{...fold,files:[...fold.files,newFile]}:fold));
      setTimeout(()=>setFolders(p=>p.map(fold=>fold.id===folderId?{...fold,files:fold.files.map(d=>d.id===newFile.id?{...d,status:"verified"}:d)}:fold)),2000);
    }
  };

  const totalFiles = folders.reduce((a,f)=>a+f.files.length,0);

  return (
    <div>
      {modal?.type==="delete" && <DeleteModal item={modal.target} itemType={modal.targetType} onConfirm={confirmDelete} onCancel={()=>setModal(null)}/>}
      {modal?.type==="rename" && <RenameModal item={modal.target} itemType={modal.targetType} onConfirm={confirmRename} onCancel={()=>setModal(null)}/>}
      {modal?.type==="createFolder" && <CreateFolderModal onConfirm={confirmCreateFolder} onCancel={()=>setModal(null)}/>}

      {/* Header */}
      <div className="fi" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <h1 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,fontWeight:700,color:"var(--text)"}}>{T("Document Library","दस्तावेज़ पुस्तकालय")}</h1>
          <p style={{fontSize:11.5,color:"var(--muted)",marginTop:3,display:"flex",alignItems:"center",gap:5}}><Database size={11}/>Folder-based repository · Auto-indexed · OCR enabled</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-s" onClick={()=>setModal({type:"createFolder"})}><FolderPlus size={13}/>{T("New Folder","नया फ़ोल्डर")}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="fi2" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
        {[[folders.length,"Folders",Folder,"#1565C0"],[totalFiles,"Total Files",FileText,"#E85D04"],[folders.reduce((a,f)=>a+f.files.filter(d=>d.status==="verified").length,0),"Verified",CheckCircle,"#2E7D32"],[folders.reduce((a,f)=>a+f.files.filter(d=>d.status==="processing").length,0),"Processing",Clock,"#E65100"]].map(([v,l,Ic,c])=>(
          <div key={l} style={{background:"#fff",border:"1px solid var(--border)",borderRadius:7,padding:"11px 14px",boxShadow:"0 1px 2px rgba(10,22,40,.04)"}}>
            <div style={{fontSize:10,color:"var(--muted)",marginBottom:5,display:"flex",alignItems:"center",gap:5}}><Ic size={11} color={c}/>{l}</div>
            <div style={{fontSize:19,fontWeight:700,fontFamily:"'Crimson Pro',serif",color:"var(--text)"}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Folder list */}
      <div className="fi3" style={{display:"flex",flexDirection:"column",gap:10}}>
        {folders.map(folder=>(
          <div key={folder.id} style={{background:"#fff",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(10,22,40,.04)"}}>
            {/* Folder header */}
            <div style={{display:"flex",alignItems:"center",gap:0,padding:"0",borderBottom:openFolders[folder.id]?"1px solid var(--border)":"none"}}>
              {/* Color strip */}
              <div style={{width:4,background:folder.color,alignSelf:"stretch",flexShrink:0}}/>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer"}} onClick={()=>toggleFolder(folder.id)}>
                <div style={{width:32,height:32,borderRadius:7,background:folder.color+"18",border:`1.5px solid ${folder.color}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Folder size={16} color={folder.color} strokeWidth={1.8}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13.5,color:"var(--text)",fontFamily:"'Crimson Pro',serif"}}>{folder.name}</div>
                  <div style={{fontSize:10.5,color:"var(--muted)",marginTop:1,display:"flex",alignItems:"center",gap:6}}>
                    <span>{folder.files.length} file{folder.files.length!==1?"s":""}</span>
                    <span>·</span>
                    <span>Created {folder.createdAt}</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {openFolders[folder.id]?<ChevronUp size={15} color="var(--muted)"/>:<ChevronDown size={15} color="var(--muted)"/>}
                </div>
              </div>
              {/* Folder actions */}
              <div style={{display:"flex",gap:4,padding:"0 12px",alignItems:"center"}}>
                <button onClick={(e)=>{e.stopPropagation();const fi=document.createElement('input');fi.type='file';fi.accept=FILE_ACCEPT;fi.multiple=true;fi.onchange=ev=>handleFileUpload(ev.target.files,folder.id);fi.click();}}
                  className="btn-s" style={{padding:"4px 10px",fontSize:11}}><FilePlus2 size={11}/>Add File</button>
                <button onClick={(e)=>{e.stopPropagation();handleRenameFolder(folder);}} style={{width:28,height:28,borderRadius:5,border:"1.5px solid var(--border)",background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#1565C0";e.currentTarget.style.color="#1565C0";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--muted)";}}>
                  <Edit2 size={12}/>
                </button>
                <button onClick={(e)=>{e.stopPropagation();handleDeleteFolder(folder);}} style={{width:28,height:28,borderRadius:5,border:"1.5px solid var(--border)",background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#C62828";e.currentTarget.style.color="#C62828";e.currentTarget.style.background="#FEF2F2";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--muted)";e.currentTarget.style.background="none";}}>
                  <Trash2 size={12}/>
                </button>
              </div>
            </div>

            {/* Files inside folder */}
            {openFolders[folder.id] && (
              <div>
                {folder.files.length === 0 ? (
                  <div style={{padding:"24px",textAlign:"center",color:"var(--muted)"}}>
                    <FilePlus2 size={28} style={{margin:"0 auto 8px",opacity:.3}}/>
                    <div style={{fontSize:13,fontWeight:500,color:"var(--text2)"}}>No files in this folder</div>
                    <div style={{fontSize:11.5,marginTop:3}}>Click "Add File" to upload documents here</div>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th style={{paddingLeft:20}}><div style={{display:"flex",alignItems:"center",gap:5}}><FileText size={10}/>File Name</div></th>
                        <th>Type</th><th>Size</th>
                        <th><div style={{display:"flex",alignItems:"center",gap:5}}><CalendarDays size={10}/>Uploaded</div></th>
                        <th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {folder.files.map((d,i)=>(
                        <tr key={d.id} className="fi" style={{animationDelay:`${i*.04}s`}}>
                          <td style={{paddingLeft:20}}>
                            <div style={{display:"flex",alignItems:"center",gap:9}}>
                              {getFileIcon(d.name,14)}
                              <span style={{fontSize:12.5,fontWeight:500,color:"var(--text)"}}>{d.name}</span>
                            </div>
                          </td>
                          <td><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--muted)",textTransform:"uppercase"}}>{d.type}</span></td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--muted)"}}>{d.size}</td>
                          <td style={{fontSize:11.5,color:"var(--muted)"}}>{d.uploadedAt}</td>
                          <td><Chip status={d.status}/></td>
                          <td>
                            <div style={{display:"flex",gap:5}}>
                              <button className="btn-s" style={{padding:"3px 8px",fontSize:11}}><Eye size={10}/>View</button>
                              <button className="btn-s" style={{padding:"3px 8px",fontSize:11}} onClick={()=>handleRenameFile(d,folder.id)}><Edit2 size={10}/></button>
                              <button className="btn-p" style={{padding:"3px 8px",fontSize:11}}><Download size={10}/></button>
                              <button onClick={()=>handleDeleteFile(d,folder.id)} style={{padding:"3px 8px",borderRadius:5,border:"1px solid #FFCDD2",background:"#FEF2F2",color:"#C62828",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:3,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#FFEBEE"} onMouseLeave={e=>e.currentTarget.style.background="#FEF2F2"}><Trash2 size={10}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {folders.length === 0 && (
          <div style={{background:"#fff",border:"2px dashed var(--border2)",borderRadius:8,padding:"50px 20px",textAlign:"center"}}>
            <FolderOpen size={44} style={{margin:"0 auto 12px",opacity:.25}}/>
            <div style={{fontSize:18,fontFamily:"'Crimson Pro',serif",color:"var(--text)"}}>No folders yet</div>
            <div style={{fontSize:12.5,color:"var(--muted)",marginTop:5,marginBottom:16}}>Create your first folder to start organizing documents</div>
            <button className="btn-p" onClick={()=>setModal({type:"createFolder"})}><FolderPlus size={13}/>Create First Folder</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══ AI CHAT ══ */
const AIChat = () => {
  const SYS = `You are OM, the AI assistant for Tender Sahayak — India's enterprise government tender management platform. Be expert, concise. Analyze uploaded files thoroughly. Use GFR 2017, GeM, CPPP, CVC guidelines terminology.`;
  const [msgs, setMsgs] = useState([{role:"assistant",content:"**Namaste, Rajesh ji.** I am OM — your Tender Intelligence Agent.\n\nUpload any file — PDF, Word, Excel, Image, CSV — and I will analyze it completely for tender-related insights, compliance gaps, or bid strategy.",files:[]}]);
  const [inp, setInp] = useState(""); const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState([]); const [procFiles, setProcFiles] = useState(false);
  const [drag, setDrag] = useState(false);
  const ref = useRef(); const fileRef = useRef();
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"})},[msgs]);

  const handleFiles = async files => {
    setProcFiles(true);
    const out=[];
    for(const f of Array.from(files)){try{out.push(await processFile(f))}catch(e){out.push({kind:"text",text:`[Error: ${e.message}]`,name:f.name,size:"0 B"})}}
    setPending(p=>[...p,...out]); setProcFiles(false);
  };
  const send = async (text) => {
    const q=(text||inp).trim(); if((!q&&!pending.length)||busy) return;
    const um={role:"user",content:q||(pending.length?`Analyze the uploaded file${pending.length>1?"s":""}`:""),files:[...pending]};
    const nm=[...msgs,um]; setMsgs(nm); setInp(""); setPending([]); setBusy(true);
    try{
      const apiMsgs=nm.map(m=>{
        if(m.role==="user"){
          const c=[];
          if(m.files?.length) m.files.forEach(pf=>c.push(fileToBlock(pf)));
          const t=m.content||(m.files?.length?`Analyze the file${m.files.length>1?"s":""} and provide complete analysis.`:"");
          if(t) c.push({type:"text",text:t});
          return{role:"user",content:c.length===1&&c[0].type==="text"?c[0].text:c};
        }
        return{role:"assistant",content:m.content};
      });
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:SYS,messages:apiMsgs})});
      const d=await r.json();
      setMsgs(p=>[...p,{role:"assistant",content:d.content?.[0]?.text||"Error.",files:[]}]);
    }catch(e){setMsgs(p=>[...p,{role:"assistant",content:`Error: ${e.message}`,files:[]}]);}
    setBusy(false);
  };
  const renderMd = txt => txt?.split('\n').map((line,i)=>{
    if(line.startsWith('### ')) return <div key={i} style={{fontWeight:700,fontSize:13,marginBottom:3,marginTop:i?8:0,color:"var(--navy4)",borderBottom:"1px solid #E8EDF5",paddingBottom:2}}>{line.slice(4)}</div>;
    if(line.startsWith('## ')) return <div key={i} style={{fontWeight:700,fontSize:14,marginBottom:4,marginTop:i?8:0}}>{line.slice(3)}</div>;
    if(line.startsWith('**')&&line.endsWith('**')) return <div key={i} style={{fontWeight:700,marginBottom:3,marginTop:i?6:0}}>{line.slice(2,-2)}</div>;
    if(line.startsWith('- ')||line.startsWith('• ')) return <div key={i} style={{display:'flex',gap:7,marginBottom:3}}><span style={{color:"var(--saffron)",fontWeight:700,flexShrink:0}}>›</span><span>{line.slice(2).replace(/\*\*(.*?)\*\*/g,(_,m)=>m)}</span></div>;
    if(/^\d+\./.test(line)) return <div key={i} style={{display:'flex',gap:7,marginBottom:3}}><span style={{color:"var(--ashoka)",fontWeight:600,fontSize:11,flexShrink:0}}>{line.match(/^\d+/)[0]}.</span><span>{line.replace(/^\d+\.\s*/,'').replace(/\*\*(.*?)\*\*/g,(_,m)=>m)}</span></div>;
    const parts=line.split(/\*\*(.*?)\*\*/g);
    return <span key={i} style={{display:'block',minHeight:line?'auto':'8px'}}>{parts.map((p,j)=>j%2===0?p:<strong key={j}>{p}</strong>)}</span>;
  });
  const FileChip = ({pf,onRemove,sm}) => (
    <div style={{display:"flex",alignItems:"center",gap:6,background:"#F0F4FF",border:"1px solid #C7D7F5",borderRadius:6,padding:sm?"3px 7px":"5px 9px",maxWidth:200}}>
      {getFileIcon(pf.name,sm?11:13)}<div style={{minWidth:0,flex:1}}><div style={{fontSize:sm?9.5:10.5,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pf.name}</div>{!sm&&<div style={{fontSize:9,color:"var(--muted)"}}>{pf.size}</div>}</div>
      {onRemove&&<button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:1,display:"flex"}}><X size={11}/></button>}
    </div>
  );
  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden",position:"relative"}} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handleFiles(e.dataTransfer.files)}}>
      {drag&&<div style={{position:"absolute",inset:0,zIndex:100,background:"rgba(21,101,192,.12)",border:"3px dashed #1565C0",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}><div style={{textAlign:"center"}}><Upload size={44} color="#1565C0" style={{margin:"0 auto 10px"}}/><div style={{fontFamily:"'Crimson Pro',serif",fontSize:20,fontWeight:700,color:"#1565C0"}}>Drop files here</div></div></div>}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"12px 18px",borderBottom:"1px solid var(--border)",background:"#fff",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{width:40,height:40,borderRadius:8,background:"linear-gradient(135deg,#0A1628,#1D3557)",display:"flex",alignItems:"center",justifyContent:"center"}}><Bot size={20} color="#42A5F5" strokeWidth={1.8}/></div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:"var(--text)",fontFamily:"'Crimson Pro',serif"}}>OM — Tender Intelligence Agent</div><div style={{fontSize:11,color:"var(--muted)",display:"flex",alignItems:"center",gap:6}}><span style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",display:"inline-block"}} className="blink-dot"/>Active · All file types supported</div></div>
          <span style={{fontSize:10,background:"#E3F2FD",color:"#1565C0",padding:"3px 9px",borderRadius:4,fontWeight:600,display:"flex",alignItems:"center",gap:4}}><Lock size={10}/>Encrypted</span>
        </div>
        <div style={{padding:"6px 18px",background:"#F8FAFD",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <Paperclip size={10} color="var(--muted)"/><span style={{fontSize:11,color:"var(--muted)"}}>Accepts:</span>
          {[["PDF","#DC2626"],["Word","#1565C0"],["Excel/CSV","#166534"],["Images","#9333EA"],["TXT/JSON","#0891B2"]].map(([l,c])=><span key={l} style={{fontSize:9.5,fontWeight:600,color:c,background:c+"12",padding:"1px 6px",borderRadius:3}}>{l}</span>)}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:14,background:"#F7FAFD"}}>
          {msgs.map((m,i)=>(
            <div key={i} className="fi" style={{display:"flex",gap:10,flexDirection:m.role==="user"?"row-reverse":"row",alignItems:"flex-start"}}>
              <div style={{width:30,height:30,borderRadius:6,background:m.role==="user"?"linear-gradient(135deg,#1565C0,#1E88E5)":"linear-gradient(135deg,#0A1628,#E85D04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {m.role==="user"?<Users size={13} color="#fff" strokeWidth={2}/>:<ZapIcon size={13} color="#fff" strokeWidth={2}/>}
              </div>
              <div style={{maxWidth:"76%",display:"flex",flexDirection:"column",gap:5,alignItems:m.role==="user"?"flex-end":"flex-start"}}>
                {m.files?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:m.role==="user"?"flex-end":"flex-start"}}>{m.files.map((pf,fi)=><FileChip key={fi} pf={pf} sm/>)}</div>}
                {m.content&&<div style={{background:m.role==="user"?"linear-gradient(135deg,#1565C0,#1E88E5)":"#fff",color:m.role==="user"?"#fff":"var(--text)",padding:"11px 14px",borderRadius:m.role==="user"?"10px 3px 10px 10px":"3px 10px 10px 10px",fontSize:12.5,lineHeight:1.68,border:m.role==="assistant"?"1px solid var(--border)":"none",boxShadow:m.role==="assistant"?"0 1px 3px rgba(10,22,40,.06)":"none"}}>{renderMd(m.content)}</div>}
              </div>
            </div>
          ))}
          {busy&&<div style={{display:"flex",gap:10,alignItems:"flex-start"}}><div style={{width:30,height:30,borderRadius:6,background:"linear-gradient(135deg,#0A1628,#E85D04)",display:"flex",alignItems:"center",justifyContent:"center"}}><ZapIcon size={13} color="#fff" strokeWidth={2}/></div><div style={{background:"#fff",border:"1px solid var(--border)",padding:"11px 15px",borderRadius:"3px 10px 10px 10px",display:"flex",alignItems:"center",gap:6}}><RefreshCw size={11} color="var(--saffron)" className="spin-a"/><span style={{fontSize:12,color:"var(--muted)"}}>OM is analysing…</span></div></div>}
          <div ref={ref}/>
        </div>
        {msgs.length<=1&&<div style={{padding:"0 18px 8px",display:"flex",gap:7,flexWrap:"wrap",background:"#F7FAFD"}}>
          {["Analyse BSNL tender eligibility","Prepare AAI AMC checklist","Documents needed for GeM?","Compare all open tender EMDs"].map(q=><button key={q} onClick={()=>send(q)} style={{padding:"5px 12px",borderRadius:16,border:"1px solid var(--border)",background:"#fff",fontSize:11.5,color:"var(--text2)",cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .18s"}} onMouseEnter={e=>{e.target.style.borderColor="#1565C0";e.target.style.color="#1565C0"}} onMouseLeave={e=>{e.target.style.borderColor="var(--border)";e.target.style.color="var(--text2)"}}>{q}</button>)}
        </div>}
        {pending.length>0&&<div style={{padding:"7px 18px",background:"#F0F4FF",borderTop:"1px solid #C7D7F5",display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}><span style={{fontSize:11,color:"var(--ashoka)",fontWeight:600,display:"flex",alignItems:"center",gap:4}}><Paperclip size={11}/>Attached:</span>{pending.map((pf,i)=><FileChip key={i} pf={pf} onRemove={()=>setPending(p=>p.filter((_,j)=>j!==i))}/>)}</div>}
        <div style={{padding:"12px 18px 15px",borderTop:"1px solid var(--border)",background:"#fff"}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <button onClick={()=>fileRef.current?.click()} disabled={procFiles} style={{width:36,height:36,borderRadius:7,border:"1.5px solid var(--border)",background:"#F8FAFD",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"var(--muted)",transition:"all .18s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#1565C0";e.currentTarget.style.color="#1565C0"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--muted)"}}>
              {procFiles?<RefreshCw size={15} className="spin-a" color="var(--ashoka)"/>:<Paperclip size={15}/>}
            </button>
            <input ref={fileRef} type="file" accept={FILE_ACCEPT} multiple onChange={e=>{handleFiles(e.target.files);e.target.value=""}} style={{display:"none"}}/>
            <textarea value={inp} onChange={e=>setInp(e.target.value)} rows={1} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask OM anything, or attach a tender document, spreadsheet, or image…" style={{flex:1,resize:"none",padding:"8px 12px",border:"1.5px solid var(--border)",borderRadius:8,fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:"var(--text)",background:"#F8FAFD",outline:"none",lineHeight:1.5,maxHeight:100}} onFocus={e=>e.target.style.borderColor="#1565C0"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            <button onClick={()=>send()} disabled={busy||(!inp.trim()&&!pending.length)} className="btn-p" style={{height:36,padding:"0 16px",borderRadius:7,opacity:(busy||(!inp.trim()&&!pending.length))?.6:1,flexShrink:0}}>
              {busy?<RefreshCw size={13} className="spin-a"/>:<Send size={13}/>}{!busy&&"Send"}
            </button>
          </div>
          <div style={{fontSize:10,color:"var(--muted)",marginTop:6,display:"flex",alignItems:"center",gap:4}}><Info size={9}/>Shift+Enter for new line · All file types supported · End-to-end encrypted</div>
        </div>
      </div>
      {/* Context sidebar */}
      <div style={{width:200,borderLeft:"1px solid var(--border)",background:"#fff",overflowY:"auto",flexShrink:0}}>
        <div style={{padding:"11px 13px 7px",borderBottom:"1px solid var(--border)",background:"#F8FAFD",display:"flex",alignItems:"center",gap:5}}><Database size={10} color="var(--muted)"/><div style={{fontSize:9,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".1em"}}>Context Loaded</div></div>
        <div style={{padding:"8px 13px",borderBottom:"1px solid #F0F4FA"}}><div style={{fontSize:9.5,fontWeight:700,color:"var(--ashoka)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Active Tenders</div>{ALL_TENDERS.slice(0,6).map(t=><div key={t.id} style={{padding:"5px 0",borderBottom:"1px solid #F8FAFC",fontSize:10,color:"var(--text2)",lineHeight:1.4}}>{t.title.slice(0,42)}…</div>)}</div>
        <div style={{padding:"8px 13px"}}><div style={{fontSize:9.5,fontWeight:700,color:"var(--ashoka)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Indexed Docs</div>{["PAN Card","GST Certificate","BSNL Technical Bid","Financial Statement","PMGSY TOR"].map(n=><div key={n} style={{padding:"4px 0",fontSize:10,color:"var(--text2)",display:"flex",alignItems:"center",gap:5}}><div style={{width:4,height:4,borderRadius:"50%",background:"#22C55E",flexShrink:0}}/>{n}</div>)}</div>
      </div>
    </div>
  );
};

/* ══ PAGINATED TENDER TABLE ══ */
const TenderDiscovery = ({lang}) => {
  const T = (en,hi) => lang==="HI"?hi:en;

  // Filter state
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All Categories");
  const [loc, setLoc] = useState("All States / UTs");
  const [source, setSource] = useState("All Sources");
  const [product, setProduct] = useState("All Products & Services");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selTender, setSelTender] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter logic
  const filtered = ALL_TENDERS.filter(t => {
    const searchMatch = !search || (t.title+t.org+t.ref+t.ministry).toLowerCase().includes(search.toLowerCase());
    const catMatch = cat==="All Categories" || t.cat===cat;
    const locMatch = loc==="All States / UTs" || loc.startsWith("──") || t.loc===loc || (loc==="Nationwide"&&t.loc==="Nationwide");
    const sourceMatch = source==="All Sources" || t.source===source || (source==="GeM Portal"&&t.gem);
    const productMatch = product==="All Products & Services" || product.startsWith("──") || t.product===product;
    // Date filtering (simple string comparison on "DD Mon YYYY")
    let dateMatch = true;
    if(startDate){
      const sd = new Date(startDate); const td = new Date(t.startDate.replace(/(\d+) (\w+) (\d+)/,'$2 $1 $3'));
      if(!isNaN(sd)&&!isNaN(td)) dateMatch = dateMatch && td >= sd;
    }
    if(endDate){
      const ed = new Date(endDate); const td = new Date(t.deadline.replace(/(\d+) (\w+) (\d+)/,'$2 $1 $3'));
      if(!isNaN(ed)&&!isNaN(td)) dateMatch = dateMatch && td <= ed;
    }
    return searchMatch&&catMatch&&locMatch&&sourceMatch&&productMatch&&dateMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length/pageSize));
  const paginated = filtered.slice((page-1)*pageSize, page*pageSize);
  const resetFilters = () => { setSearch(""); setCat("All Categories"); setLoc("All States / UTs"); setSource("All Sources"); setProduct("All Products & Services"); setStartDate(""); setEndDate(""); setPage(1); };
  const activeFilters = [cat!=="All Categories",loc!=="All States / UTs",source!=="All Sources",product!=="All Products & Services",!!startDate,!!endDate].filter(Boolean).length;

  // Reset page on filter change
  useEffect(()=>setPage(1),[search,cat,loc,source,product,startDate,endDate]);

  const selOpts = (opts) => opts.map(o => (
    <option key={o} disabled={o.startsWith("──")} style={{fontWeight:o.startsWith("──")?"700":"400",color:o.startsWith("──")?"#5A6E8C":"inherit",fontSize:o.startsWith("──")?11:12}}>{o}</option>
  ));

  return (
    <div>
      <div className="fi" style={{marginBottom:14}}>
        <h1 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,fontWeight:700,color:"var(--text)"}}>{T("Tender Discovery","टेंडर खोज")}</h1>
        <p style={{fontSize:11.5,color:"var(--muted)",marginTop:3,display:"flex",alignItems:"center",gap:5}}><Globe size={11}/>Aggregated from GeM · CPPP · eProcure · Department Portals</p>
      </div>

      {/* Filter panel */}
      <div className="fi2" style={{background:"#fff",border:"1px solid var(--border)",borderRadius:8,padding:"13px 16px",marginBottom:13,boxShadow:"0 1px 3px rgba(10,22,40,.04)"}}>
        {/* Row 1: Search + primary filters */}
        <div style={{display:"flex",gap:9,alignItems:"center",flexWrap:"wrap",marginBottom:showAdvanced?10:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,flex:"1 1 220px",background:"#F4F6FA",border:"1px solid var(--border)",borderRadius:6,padding:"7px 11px"}}>
            <Search size={13} color="var(--muted)"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T("Search by title, ref no., ministry, org…","खोजें…")} style={{flex:1,border:"none",outline:"none",background:"none",fontSize:12.5,color:"var(--text)",fontFamily:"'IBM Plex Sans',sans-serif"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",display:"flex"}}><X size={12}/></button>}
          </div>
          <select value={cat} onChange={e=>setCat(e.target.value)} className="inp" style={{width:"auto",flex:"0 1 160px",fontSize:12,fontWeight:500}}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={loc} onChange={e=>setLoc(e.target.value)} className="inp" style={{width:"auto",flex:"0 1 170px",fontSize:12,fontWeight:500}}>
            {selOpts(INDIA_LOCATIONS)}
          </select>
          <select value={source} onChange={e=>setSource(e.target.value)} className="inp" style={{width:"auto",flex:"0 1 150px",fontSize:12,fontWeight:500}}>
            {SOURCES.map(s=><option key={s}>{s}</option>)}
          </select>
          <button onClick={()=>setShowAdvanced(!showAdvanced)} className="btn-s" style={{fontSize:11,borderColor:showAdvanced||activeFilters>0?"var(--ashoka)":"var(--border)",color:showAdvanced||activeFilters>0?"var(--ashoka)":"var(--text2)",background:showAdvanced||activeFilters>0?"#EFF4FF":"#fff"}}>
            <SlidersHorizontal size={12}/> {T("Smart Filters","स्मार्ट फ़िल्टर")}{activeFilters>0&&<span style={{background:"var(--ashoka)",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:10}}>{activeFilters}</span>}
          </button>
          {activeFilters>0&&<button onClick={resetFilters} className="btn-s" style={{fontSize:11,borderColor:"#EF4444",color:"#EF4444"}}><RotateCcw size={11}/>Reset</button>}
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="fi" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,paddingTop:10,borderTop:"1px solid var(--border)"}}>
            <div>
              <label style={{fontSize:9.5,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5,display:"flex",alignItems:"center",gap:4}}><Package size={10}/>Products &amp; Services</label>
              <select value={product} onChange={e=>setProduct(e.target.value)} className="inp" style={{fontSize:12}}>
                {selOpts(PRODUCT_SERVICES)}
              </select>
            </div>
            <div>
              <label style={{fontSize:9.5,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5,display:"flex",alignItems:"center",gap:4}}><CalendarDays size={10}/>Publication Date From</label>
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="inp" style={{fontSize:12}}/>
            </div>
            <div>
              <label style={{fontSize:9.5,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5,display:"flex",alignItems:"center",gap:4}}><CalendarDays size={10}/>Bid Deadline Before</label>
              <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="inp" style={{fontSize:12}}/>
            </div>
          </div>
        )}
      </div>

      {/* Results bar + page size */}
      <div className="fi3" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:12,color:"var(--muted)",display:"flex",alignItems:"center",gap:6}}>
          <span>Showing <strong style={{color:"var(--text)"}}>{((page-1)*pageSize)+1}–{Math.min(page*pageSize,filtered.length)}</strong> of <strong style={{color:"var(--text)"}}>{filtered.length}</strong> tenders</span>
          {activeFilters>0&&<span style={{fontSize:10,background:"#EFF4FF",color:"var(--ashoka)",padding:"1px 7px",borderRadius:3,fontWeight:600,border:"1px solid #C7D7F5"}}>{activeFilters} filter{activeFilters>1?"s":""} active</span>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11.5,color:"var(--muted)"}}>Rows per page:</span>
          <select value={pageSize} onChange={e=>{setPageSize(+e.target.value);setPage(1);}} style={{padding:"4px 8px",borderRadius:5,border:"1.5px solid var(--border)",background:"#fff",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif",cursor:"pointer",outline:"none"}}>
            {PAGE_SIZES.map(s=><option key={s}>{s}</option>)}
          </select>
          <button className="btn-s" style={{fontSize:11}}><Download size={11}/>Export CSV</button>
        </div>
      </div>

      {/* Table */}
      <div className="fi4" style={{background:"#fff",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(10,22,40,.04)"}}>
        <table>
          <thead>
            <tr>
              <th><div style={{display:"flex",alignItems:"center",gap:5}}><Tag size={10}/>Ref / Source</div></th>
              <th><div style={{display:"flex",alignItems:"center",gap:5}}><FileSearch size={10}/>Title & Organization</div></th>
              <th><div style={{display:"flex",alignItems:"center",gap:5}}><Building2 size={10}/>Ministry</div></th>
              <th><div style={{display:"flex",alignItems:"center",gap:5}}><DollarSign size={10}/>Value</div></th>
              <th>EMD</th>
              <th><div style={{display:"flex",alignItems:"center",gap:5}}><CalendarDays size={10}/>Deadline</div></th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((t,i)=>(
              <tr key={t.id} onClick={()=>setSelTender(selTender?.id===t.id?null:t)} className="fi" style={{animationDelay:`${i*.03}s`,background:selTender?.id===t.id?"#EFF4FF":""}}>
                <td>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9.5,color:"var(--ashoka)",fontWeight:600,marginBottom:2}}>{t.ref}</div>
                  <div style={{display:"flex",gap:4}}>
                    {t.gem&&<span style={{fontSize:8.5,background:"#E3F2FD",color:"#1565C0",padding:"1px 5px",borderRadius:3,fontWeight:700,display:"inline-flex",alignItems:"center",gap:2}}><Globe size={7}/>GeM</span>}
                    <span style={{fontSize:8.5,background:"#F0F4FF",color:"#3D5A99",padding:"1px 5px",borderRadius:3,fontWeight:600}}>{t.source}</span>
                  </div>
                </td>
                <td style={{maxWidth:240}}>
                  <div style={{fontWeight:500,fontSize:12,color:"var(--text)",lineHeight:1.4,marginBottom:2}}>{t.title}</div>
                  <div style={{fontSize:10,color:"var(--muted)",display:"flex",alignItems:"center",gap:3}}><Building2 size={8}/>{t.org}</div>
                </td>
                <td style={{fontSize:11,color:"var(--text2)",maxWidth:140,lineHeight:1.4}}>{t.ministry}</td>
                <td><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11.5,fontWeight:700,color:"var(--text)"}}>{t.value}</span></td>
                <td><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--muted)"}}>{t.emd}</span></td>
                <td><div style={{display:"flex",alignItems:"center",gap:3,color:t.status==="closing"?"#E65100":"var(--text2)",fontWeight:t.status==="closing"?600:400,fontSize:11.5}}>{t.status==="closing"&&<AlertTriangle size={10} color="#E65100"/>}{t.deadline}</div></td>
                <td><Chip status={t.status}/></td>
                <td>
                  <div style={{display:"flex",gap:5}}>
                    <button className="btn-s" style={{padding:"3px 8px",fontSize:10.5}} onClick={e=>{e.stopPropagation();setSelTender(selTender?.id===t.id?null:t)}}><Eye size={10}/>View</button>
                    <button className="btn-p" style={{padding:"3px 9px",fontSize:10.5}} onClick={e=>e.stopPropagation()}><Bot size={10}/>AI</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length===0&&(
          <div style={{padding:"48px 20px",textAlign:"center",color:"var(--muted)"}}>
            <Search size={38} style={{margin:"0 auto 12px",opacity:.25}}/>
            <div style={{fontSize:17,fontFamily:"'Crimson Pro',serif",color:"var(--text)"}}>No tenders match your filters</div>
            <div style={{fontSize:12,marginTop:4,marginBottom:12}}>Try adjusting or resetting your filters</div>
            <button className="btn-s" onClick={resetFilters}><RotateCcw size={12}/>Reset Filters</button>
          </div>
        )}
      </div>

      {/* ══ PAGINATION ══ */}
      {filtered.length > 0 && (
        <div className="fi" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,flexWrap:"wrap",gap:10}}>
          <div style={{fontSize:11.5,color:"var(--muted)"}}>
            Page <strong style={{color:"var(--text)"}}>{page}</strong> of <strong style={{color:"var(--text)"}}>{totalPages}</strong>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {/* First */}
            <button onClick={()=>setPage(1)} disabled={page===1} style={{width:30,height:30,borderRadius:5,border:"1.5px solid var(--border)",background:page===1?"#F8FAFD":"#fff",cursor:page===1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:page===1?"var(--border2)":"var(--text2)",transition:"all .15s"}} onMouseEnter={e=>{if(page!==1){e.currentTarget.style.borderColor="#1565C0";e.currentTarget.style.color="#1565C0"}}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color=page===1?"var(--border2)":"var(--text2)"}}>
              <ChevronsLeft size={13}/>
            </button>
            {/* Prev */}
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{width:30,height:30,borderRadius:5,border:"1.5px solid var(--border)",background:page===1?"#F8FAFD":"#fff",cursor:page===1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:page===1?"var(--border2)":"var(--text2)",transition:"all .15s"}} onMouseEnter={e=>{if(page!==1){e.currentTarget.style.borderColor="#1565C0";e.currentTarget.style.color="#1565C0"}}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color=page===1?"var(--border2)":"var(--text2)"}}>
              <ChevronLeft size={13}/>
            </button>
            {/* Page numbers */}
            {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>{
              if(totalPages<=7) return true;
              if(p===1||p===totalPages) return true;
              if(p>=page-2&&p<=page+2) return true;
              return false;
            }).reduce((acc,p,i,arr)=>{
              if(i>0&&p-arr[i-1]>1) acc.push("...");
              acc.push(p); return acc;
            },[]).map((p,i)=>(
              p==="..."
                ? <span key={`d${i}`} style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",fontSize:13}}>…</span>
                : <button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:5,border:"1.5px solid",borderColor:page===p?"var(--ashoka)":"var(--border)",background:page===p?"var(--ashoka)":"#fff",color:page===p?"#fff":"var(--text2)",cursor:"pointer",fontSize:12.5,fontWeight:page===p?700:400,fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center"}} onMouseEnter={e=>{if(page!==p){e.currentTarget.style.borderColor="#1565C0";e.currentTarget.style.color="#1565C0"}}} onMouseLeave={e=>{if(page!==p){e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)"}}}>{p}</button>
            ))}
            {/* Next */}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{width:30,height:30,borderRadius:5,border:"1.5px solid var(--border)",background:page===totalPages?"#F8FAFD":"#fff",cursor:page===totalPages?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:page===totalPages?"var(--border2)":"var(--text2)",transition:"all .15s"}} onMouseEnter={e=>{if(page!==totalPages){e.currentTarget.style.borderColor="#1565C0";e.currentTarget.style.color="#1565C0"}}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color=page===totalPages?"var(--border2)":"var(--text2)"}}>
              <ChevronRight size={13}/>
            </button>
            {/* Last */}
            <button onClick={()=>setPage(totalPages)} disabled={page===totalPages} style={{width:30,height:30,borderRadius:5,border:"1.5px solid var(--border)",background:page===totalPages?"#F8FAFD":"#fff",cursor:page===totalPages?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:page===totalPages?"var(--border2)":"var(--text2)",transition:"all .15s"}} onMouseEnter={e=>{if(page!==totalPages){e.currentTarget.style.borderColor="#1565C0";e.currentTarget.style.color="#1565C0"}}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color=page===totalPages?"var(--border2)":"var(--text2)"}}>
              <ChevronsRight size={13}/>
            </button>
          </div>
          {/* Jump to page */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11.5,color:"var(--muted)"}}>Jump to:</span>
            <input type="number" min={1} max={totalPages} defaultValue={page} key={page} onKeyDown={e=>{if(e.key==="Enter"){const v=Math.max(1,Math.min(totalPages,+e.target.value));setPage(v)}}} style={{width:52,padding:"4px 8px",borderRadius:5,border:"1.5px solid var(--border)",fontSize:12,textAlign:"center",fontFamily:"'IBM Plex Sans',sans-serif",outline:"none",color:"var(--text)"}} onFocus={e=>e.target.style.borderColor="#1565C0"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
          </div>
        </div>
      )}

      {/* Tender detail panel */}
      {selTender && (
        <div className="fi" style={{marginTop:14,background:"#fff",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",boxShadow:"0 2px 8px rgba(10,22,40,.07)"}}>
          <div style={{background:"linear-gradient(135deg,var(--navy),var(--navy4))",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"var(--gold)",letterSpacing:".14em",marginBottom:5,fontFamily:"'IBM Plex Mono',monospace"}}>{selTender.ref}</div>
              <div style={{fontFamily:"'Crimson Pro',serif",fontSize:18,fontWeight:700,color:"#fff",lineHeight:1.3,marginBottom:3}}>{selTender.title}</div>
              <div style={{fontSize:11.5,color:"#8A9BB5",display:"flex",alignItems:"center",gap:5}}><Building2 size={10}/>{selTender.org} · {selTender.ministry}</div>
            </div>
            <button onClick={()=>setSelTender(null)} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",borderRadius:5,padding:"5px 11px",cursor:"pointer",fontSize:11.5,display:"flex",alignItems:"center",gap:5}}><X size={11}/>Close</button>
          </div>
          <div style={{padding:"14px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10}}>
            {[["Value",selTender.value,DollarSign],["EMD",selTender.emd,ShieldCheck],["Deadline",selTender.deadline,CalendarDays],["Location",selTender.loc,MapPin],["Category",selTender.cat,Tag],["Source",selTender.gem?"GeM Portal":selTender.source,Globe]].map(([k,v,Ic])=>(
              <div key={k} style={{padding:"9px 12px",background:"#F8FAFD",borderRadius:6,border:"1px solid var(--border)"}}>
                <div style={{fontSize:9.5,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:3,display:"flex",alignItems:"center",gap:3}}><Ic size={8}/>{k}</div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--text)",fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"0 18px 14px",display:"flex",gap:8}}>
            <button className="btn-p"><Bot size={12}/>Analyse with OM AI</button>
            <button className="btn-s"><Download size={11}/>Download TOR</button>
            <button className="btn-s"><BookmarkCheck size={11}/>Save Tender</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══ MAIN APP ══ */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState("EN");
  const [sideX, setSideX] = useState(true);
  const T = (en,hi) => lang==="HI"?hi:en;

  const NAV = [
    {g:"MAIN",items:[
      {id:"dashboard",Icon:LayoutDashboard,label:T("Dashboard","डैशबोर्ड")},
      {id:"discover", Icon:Search,         label:T("Tender Discovery","टेंडर खोज")},
      {id:"documents",Icon:FolderOpen,      label:T("Document Library","दस्तावेज़")},
    ]},
    {g:"INTELLIGENCE",items:[
      {id:"ai",Icon:Bot,label:"OM AI Agent",badge:"AI"},
    ]},
    {g:"ACCOUNT",items:[
      {id:"settings",Icon:Settings,label:T("Settings","सेटिंग्स")},
    ]},
  ];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--off)",fontFamily:"'IBM Plex Sans',sans-serif"}}>
      <GS/>

      {/* SIDEBAR */}
      <aside style={{width:sideX?"var(--sw)":"60px",background:"var(--navy)",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",transition:"width .25s ease",overflow:"hidden",zIndex:50,flexShrink:0}}>
        <div style={{height:3,background:"linear-gradient(90deg,#FF9933 33.3%,#fff 33.3% 66.6%,#138808 66.6%)",flexShrink:0}}/>
        <div style={{padding:"11px 12px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{flexShrink:0}}><Emblem size={35}/></div>
          {sideX&&<div className="si" style={{minWidth:0}}>
            <div style={{color:"#fff",fontFamily:"'Crimson Pro',serif",fontSize:15.5,fontWeight:700,lineHeight:1.1,whiteSpace:"nowrap"}}>Tender Sahayak</div>
            <div style={{color:"var(--gold)",fontSize:8,fontWeight:600,letterSpacing:".14em",marginTop:2}}>DIGITAL PROCUREMENT</div>
          </div>}
          <button onClick={()=>setSideX(!sideX)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#5A6E8C",display:"flex",alignItems:"center",flexShrink:0}}>
            {sideX?<ChevronLeft size={14}/>:<ChevronRight size={14}/>}
          </button>
        </div>
        {sideX&&<div style={{margin:"9px 10px",padding:"8px 10px",background:"rgba(212,160,23,.08)",border:"1px solid rgba(212,160,23,.18)",borderRadius:7}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:5,background:"linear-gradient(135deg,#1565C0,#E85D04)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:11,flexShrink:0}}>RK</div>
            <div><div style={{color:"#fff",fontSize:11,fontWeight:600}}>Rajesh Kumar</div><div style={{color:"#8A9BB5",fontSize:9}}>Infratech Pvt. Ltd.</div></div>
          </div>
          <div style={{marginTop:6,display:"flex",gap:4}}>
            {[["MSME","#4CAF50","rgba(19,136,8,.2)"],["GeM","#42A5F5","rgba(21,101,192,.2)"],["✓","#D4A017","rgba(212,160,23,.2)"]].map(([l,c,bg])=>(
              <span key={l} style={{fontSize:8,fontWeight:700,background:bg,color:c,padding:"1px 5px",borderRadius:3}}>{l}</span>
            ))}
          </div>
        </div>}
        <nav style={{flex:1,overflowY:"auto",padding:"6px 8px"}}>
          {NAV.map(g=>(
            <div key={g.g} style={{marginBottom:4}}>
              {sideX&&<div style={{fontSize:8,fontWeight:700,color:"#3A4E6C",letterSpacing:".16em",padding:"4px 8px 3px"}}>{g.g}</div>}
              {g.items.map(n=>{
                const active=page===n.id;
                return(
                  <button key={n.id} onClick={()=>setPage(n.id)} title={n.label} className={`nav-btn${active?" active":""}`}>
                    <n.Icon size={15} strokeWidth={active?2:1.7} style={{flexShrink:0,color:active?"#42A5F5":"#5A6E8C"}}/>
                    {sideX&&<span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{n.label}</span>}
                    {sideX&&n.badge&&<span style={{fontSize:8,background:"#E85D04",color:"#fff",padding:"1px 5px",borderRadius:3,fontWeight:800,letterSpacing:".06em",flexShrink:0}}>{n.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        {sideX&&<div style={{padding:"9px 10px 13px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <button onClick={()=>setLang(l=>l==="EN"?"HI":"EN")} style={{width:"100%",padding:"6px",borderRadius:6,border:"1px solid rgba(255,255,255,.09)",background:"rgba(255,255,255,.03)",color:"#8A9BB5",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'IBM Plex Sans',sans-serif",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <Globe size={11}/>{lang==="EN"?"Switch to हिंदी":"Switch to English"}
          </button>
          <div style={{fontSize:9,color:"#2D3E56",textAlign:"center"}}>v4.0.0 · © 2025 Tender Sahayak</div>
        </div>}
      </aside>

      {/* CONTENT */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>
        <header style={{background:"#fff",borderBottom:"1px solid var(--border)",padding:"0 22px",height:50,display:"flex",alignItems:"center",gap:14,flexShrink:0,position:"sticky",top:0,zIndex:40,boxShadow:"0 1px 4px rgba(10,22,40,.05)"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:"var(--muted)"}}>Tender Sahayak</span>
            <ChevronRight size={11} color="var(--border2)"/>
            <span style={{fontSize:11,color:"var(--text)",fontWeight:600}}>{({dashboard:"Dashboard",discover:"Tender Discovery",documents:"Document Library",ai:"OM AI Agent",settings:"Settings"})[page]}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 11px",background:"#FFF3E0",border:"1px solid #FFB74D",borderRadius:5}}>
            <AlertTriangle size={10} color="#E65100"/>
            <span style={{fontSize:11,fontWeight:600,color:"#E65100"}}>2 tenders closing within 72 hours</span>
          </div>
          <button style={{width:33,height:33,borderRadius:6,border:"1px solid var(--border)",background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
            <Bell size={14} color="var(--text2)"/>
            <span style={{position:"absolute",top:7,right:7,width:6,height:6,borderRadius:"50%",background:"#E85D04",border:"2px solid #fff"}}/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"4px 10px",borderRadius:6,border:"1px solid var(--border)",cursor:"pointer",background:"#F8FAFD"}}>
            <div style={{width:23,height:23,borderRadius:4,background:"linear-gradient(135deg,#1565C0,#E85D04)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:9.5}}>RK</div>
            <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>Rajesh Kumar</span>
          </div>
        </header>

        <main style={{flex:1,overflowY:"auto",padding:page==="ai"?"0":"22px 26px 40px"}}>
          {/* DASHBOARD */}
          {page==="dashboard"&&<>
            <div className="fi" style={{marginBottom:16}}>
              <h1 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,fontWeight:700,color:"var(--text)"}}>{T("Executive Dashboard","कार्यकारी डैशबोर्ड")}</h1>
              <p style={{fontSize:11,color:"var(--muted)",marginTop:3,display:"flex",alignItems:"center",gap:5}}><Activity size={10}/> {new Date().toLocaleString("en-IN",{dateStyle:"long",timeStyle:"short"})} · <span style={{width:5,height:5,borderRadius:"50%",background:"#22C55E",display:"inline-block"}} className="blink-dot"/> Live</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))",gap:12,marginBottom:18}}>
              <StatCard label="Active Tenders"     value={ALL_TENDERS.length} icon={Layers}      accent="#1565C0" sub="vs last month" trend={3}  spark={[5,7,6,9,8,12,10,ALL_TENDERS.length]}/>
              <StatCard label="Pipeline Value"      value="₹21.3 Cr"           icon={BarChart2}   accent="#E85D04" sub="total pipeline" trend={8} spark={[12,15,13,18,16,19,17,21]}/>
              <StatCard label="Saved Tenders"       value="4"                   icon={BookmarkCheck} accent="#D4A017" sub="vs last month" trend={1} spark={[1,2,2,3,3,3,4,4]}/>
              <StatCard label="Documents Indexed"   value="6"                   icon={Database}    accent="#138808" sub="all active"    trend={2} spark={[2,3,4,4,5,5,6,6]}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:15}}>
              <div className="fi2">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:16,fontWeight:700,color:"var(--text)",display:"flex",alignItems:"center",gap:7}}><Briefcase size={15} color="var(--ashoka)"/>Active Tender Portfolio</h2>
                  <button onClick={()=>setPage("discover")} className="btn-s" style={{fontSize:11}}><ExternalLink size={11}/>View All ({ALL_TENDERS.length})</button>
                </div>
                <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(10,22,40,.04)"}}>
                  <table>
                    <thead><tr><th>Ref</th><th>Title & Org</th><th>Value</th><th>Deadline</th><th>Status</th></tr></thead>
                    <tbody>
                      {ALL_TENDERS.slice(0,6).map((t,i)=>(
                        <tr key={t.id} className="fi" style={{animationDelay:`${i*.04}s`}} onClick={()=>setPage("discover")}>
                          <td><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--ashoka)",fontWeight:600}}>{t.ref.slice(0,18)}</div></td>
                          <td style={{maxWidth:200}}><div style={{fontSize:11.5,fontWeight:500,lineHeight:1.3}}>{t.title.slice(0,42)}…</div><div style={{fontSize:9.5,color:"var(--muted)"}}>{t.org.slice(0,30)}</div></td>
                          <td><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700}}>{t.value}</span></td>
                          <td><span style={{fontSize:11,color:t.status==="closing"?"#E65100":"var(--text2)",fontWeight:t.status==="closing"?600:400}}>{t.deadline}</span></td>
                          <td><Chip status={t.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="fi3" style={{display:"flex",flexDirection:"column",gap:13}}>
                <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(10,22,40,.04)"}}>
                  <div style={{padding:"10px 14px",borderBottom:"1px solid var(--border)",background:"#F8FAFD",display:"flex",alignItems:"center",gap:6}}><CalendarDays size={12} color="var(--text2)"/><span style={{fontWeight:700,fontSize:13,fontFamily:"'Crimson Pro',serif",color:"var(--text)"}}>Deadline Tracker</span></div>
                  <div style={{padding:"10px 13px"}}>
                    {ALL_TENDERS.slice(0,5).map(t=>(
                      <div key={t.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:9}}>
                        <div style={{width:36,textAlign:"center",padding:"3px 4px",background:t.status==="closing"?"#FFF3E0":"#EBF0FA",borderRadius:5,flexShrink:0}}>
                          <div style={{fontSize:14,fontWeight:700,fontFamily:"'Crimson Pro',serif",color:t.status==="closing"?"#E65100":"var(--text)",lineHeight:1}}>{t.deadline.split(" ")[0]}</div>
                          <div style={{fontSize:7.5,color:"var(--muted)",fontWeight:600}}>{t.deadline.split(" ")[1]}</div>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:10,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:1}}>{t.title.slice(0,32)}…</div>
                          <MiniBar pct={t.status==="closing"?87:40} color={t.status==="closing"?"#E65100":"#1565C0"}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div onClick={()=>setPage("ai")} style={{background:"linear-gradient(135deg,var(--navy),var(--navy4))",border:"1px solid rgba(212,160,23,.25)",borderRadius:8,padding:"15px",cursor:"pointer",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-15,right:-15,width:70,height:70,border:"1px solid rgba(212,160,23,.1)",borderRadius:"50%"}}/>
                  <div style={{fontSize:8.5,fontWeight:700,color:"var(--gold)",letterSpacing:".15em",marginBottom:5,display:"flex",alignItems:"center",gap:4}}><Cpu size={9}/>OM AI AGENT</div>
                  <div style={{fontFamily:"'Crimson Pro',serif",fontSize:16,fontWeight:700,color:"#fff",marginBottom:4}}>Intelligent File Analysis</div>
                  <div style={{fontSize:11,color:"#8A9BB5",marginBottom:11,lineHeight:1.5}}>Upload any file — OM will analyze it completely.</div>
                  <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"var(--saffron)",color:"#fff",padding:"5px 13px",borderRadius:5,fontSize:11.5,fontWeight:700}}><Bot size={11}/>Open AI Agent</div>
                </div>
              </div>
            </div>
          </>}

          {page==="discover" && <TenderDiscovery lang={lang}/>}
          {page==="documents" && <DocumentLibrary lang={lang}/>}
          {page==="ai" && <div style={{height:"calc(100vh - 50px)",display:"flex",flexDirection:"column"}}><AIChat/></div>}

          {/* SETTINGS */}
          {page==="settings"&&<div style={{maxWidth:720}}>
            <div className="fi" style={{marginBottom:20}}>
              <h1 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,fontWeight:700,color:"var(--text)"}}>{T("Account Settings","खाता सेटिंग्स")}</h1>
            </div>
            {[
              {title:T("Personal Information","व्यक्तिगत जानकारी"),Icon:Users,fields:[{l:"Full Name",v:"Rajesh Kumar",t:"text",w:"half"},{l:"Email",v:"rajesh@infratech.in",t:"email",w:"half"},{l:"Mobile",v:"+91 98765 43210",t:"tel",w:"half"},{l:"Designation",v:"Managing Director",t:"text",w:"half"}]},
              {title:T("Company Details","कंपनी विवरण"),Icon:Building2,fields:[{l:"Company Name",v:"Infratech Pvt. Ltd.",t:"text",w:"half"},{l:"GST Number",v:"27AABCS1429B1ZB",t:"text",w:"half"},{l:"PAN Number",v:"AABCS1429B",t:"text",w:"half"},{l:"Business Type",v:"Private Limited",t:"text",w:"half"},{l:"Registered Address",v:"B-12, Sector 5, Noida, UP - 201301",t:"text",w:"full"}]},
            ].map(sec=>(
              <div key={sec.title} className="fi2" style={{background:"#fff",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",marginBottom:13,boxShadow:"0 1px 3px rgba(10,22,40,.04)"}}>
                <div style={{padding:"11px 16px",borderBottom:"1px solid var(--border)",background:"#F8FAFD",display:"flex",alignItems:"center",gap:8}}><sec.Icon size={14} color="var(--ashoka)"/><span style={{fontFamily:"'Crimson Pro',serif",fontSize:15,fontWeight:700,color:"var(--text)"}}>{sec.title}</span></div>
                <div style={{padding:"15px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {sec.fields.map(f=><div key={f.l} style={{gridColumn:f.w==="full"?"1/-1":"auto"}}>
                    <label style={{fontSize:9.5,fontWeight:600,color:"var(--muted)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:".08em"}}>{f.l}</label>
                    <input defaultValue={f.v} type={f.t} className="inp"/>
                  </div>)}
                </div>
                <div style={{padding:"0 15px 15px"}}><button className="btn-p" style={{fontSize:12}}><CheckCircle size={12}/>Save Changes</button></div>
              </div>
            ))}
            <div className="fi3" style={{background:"#fff",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(10,22,40,.04)"}}>
              <div style={{padding:"11px 16px",borderBottom:"1px solid var(--border)",background:"#F8FAFD",display:"flex",alignItems:"center",gap:8}}><Lock size={14} color="var(--ashoka)"/><span style={{fontFamily:"'Crimson Pro',serif",fontSize:15,fontWeight:700,color:"var(--text)"}}>Security & Password</span></div>
              <div style={{padding:"15px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {["Current Password","New Password","Confirm New Password"].map((l,i)=><div key={l} style={{gridColumn:i===0?"1/-1":"auto"}}><label style={{fontSize:9.5,fontWeight:600,color:"var(--muted)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:".08em"}}>{l}</label><input type="password" placeholder="••••••••••" className="inp"/></div>)}
              </div>
              <div style={{padding:"0 15px 15px"}}><button className="btn-p" style={{fontSize:12}}><Lock size={12}/>Update Password</button></div>
            </div>
          </div>}
        </main>

        <footer style={{height:24,background:"var(--navy)",display:"flex",alignItems:"center",padding:"0 18px",gap:12,flexShrink:0}}>
          {[[Cpu,"v4.0.0"],[Activity,null,"blink"],[ShieldCheck,"256-bit SSL"],[Database,`${ALL_TENDERS.length} Tenders · OM AI Active`]].map(([Ic,label,cls],i)=>(
            <span key={i} style={{fontSize:9,color:"#2D3E56",fontFamily:"'IBM Plex Mono',monospace",display:"flex",alignItems:"center",gap:4}}>
              <Ic size={9} color="#2D3E56"/>{label}
              {cls&&<><span style={{width:5,height:5,borderRadius:"50%",background:"#22C55E",display:"inline-block"}} className="blink-dot"/><span>Operational</span></>}
            </span>
          ))}
        </footer>
      </div>
    </div>
  );
}

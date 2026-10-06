// 正式環境只呼叫私有 API，不在 GitHub 公開完整店號資料。
const API_BASE = "https://YOUR-WORKER.workers.dev";

const storeId = document.querySelector("#storeId");
const searchBtn = document.querySelector("#searchBtn");
const statusEl = document.querySelector("#status");
const result = document.querySelector("#result");
const notFound = document.querySelector("#notFound");
const rStoreId = document.querySelector("#rStoreId");
const rStoreName = document.querySelector("#rStoreName");
const rPhone = document.querySelector("#rPhone");
const rCircuit = document.querySelector("#rCircuit");
const copyBtn = document.querySelector("#copyBtn");

function normalize(v){ return v.trim().toUpperCase(); }

function clearState(){
  result.classList.add("hidden");
  notFound.classList.add("hidden");
  statusEl.textContent = "";
}

async function search(){
  clearState();
  const id = normalize(storeId.value);
  if(!id){ statusEl.textContent = "請先輸入店號。"; storeId.focus(); return; }

  statusEl.textContent = "查詢中…";
  searchBtn.disabled = true;

  try{
    const res = await fetch(`${API_BASE}/api/store/${encodeURIComponent(id)}`, {
      headers: { "Accept": "application/json" }
    });
    if(res.status === 404){
      statusEl.textContent = "";
      notFound.classList.remove("hidden");
      return;
    }
    if(!res.ok) throw new Error("API_ERROR");
    const data = await res.json();

    rStoreId.textContent = data.storeId || "-";
    rStoreName.textContent = data.storeName || "-";
    rPhone.textContent = data.phone || "-";
    rPhone.href = data.phone ? `tel:${data.phone.replace(/[^0-9+#*]/g,"")}` : "#";
    rCircuit.textContent = data.circuit || "-";
    result.classList.remove("hidden");
    statusEl.textContent = "";
  }catch(e){
    statusEl.textContent = "目前無法連線查詢，請稍後再試。";
  }finally{
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", search);
storeId.addEventListener("keydown", e => { if(e.key === "Enter") search(); });

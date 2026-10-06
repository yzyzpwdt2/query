// HL-IOT 電路編號查詢
// 正式資料不放 GitHub，透過 Cloudflare Worker + KV 查詢


const API_BASE =
  "https://hl-iot-api.toshibatec.workers.dev";


// ============================
// DOM
// ============================

const loginCard =
  document.querySelector("#loginCard");

const queryApp =
  document.querySelector("#queryApp");


const employeeId =
  document.querySelector("#employeeId");

const loginBtn =
  document.querySelector("#loginBtn");

const loginStatus =
  document.querySelector("#loginStatus");


const currentEmployeeId =
  document.querySelector("#currentEmployeeId");

const logoutBtn =
  document.querySelector("#logoutBtn");


const storeId =
  document.querySelector("#storeId");

const searchBtn =
  document.querySelector("#searchBtn");

const statusEl =
  document.querySelector("#status");


const result =
  document.querySelector("#result");

const notFound =
  document.querySelector("#notFound");


const rStoreId =
  document.querySelector("#rStoreId");

const rStoreName =
  document.querySelector("#rStoreName");

const rPhone =
  document.querySelector("#rPhone");

const rCircuit =
  document.querySelector("#rCircuit");



// ============================
// 共用
// ============================

function normalize(v) {

  return v.trim().toUpperCase();

}


function showLogin() {

  loginCard.classList.remove("hidden");

  queryApp.classList.add("hidden");

  currentEmployeeId.textContent = "-";

  employeeId.focus();

}


function showQuery(employee) {

  loginCard.classList.add("hidden");

  queryApp.classList.remove("hidden");


  if (employee) {

    currentEmployeeId.textContent =
      employee;

  }


  storeId.focus();

}



// ============================
// 登入
// ============================

async function login() {

  const id =
    normalize(employeeId.value);


  if (!id) {

    loginStatus.textContent =
      "請輸入員編。";

    employeeId.focus();

    return;

  }


  loginBtn.disabled = true;

  loginStatus.textContent =
    "登入中…";


  try {

    const res =
      await fetch(
        `${API_BASE}/api/login`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body:
            JSON.stringify({
              employeeId: id
            })
        }
      );


    if (
      res.status === 401 ||
      res.status === 403
    ) {

      loginStatus.textContent =
        "員編無權限，請確認員編是否正確。";

      return;

    }


    if (!res.ok) {

      throw new Error(
        "LOGIN_ERROR"
      );

    }


    const data =
      await res.json();


    loginStatus.textContent =
      "";


    showQuery(
      data.employeeId || id
    );


  } catch (e) {

    loginStatus.textContent =
      "目前無法連線，請稍後再試。";

  } finally {

    loginBtn.disabled = false;

  }

}



// ============================
// 登出
// ============================

async function logout() {

  logoutBtn.disabled = true;

  logoutBtn.textContent =
    "登出中…";


  try {

    const res =
      await fetch(
        `${API_BASE}/api/logout`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    if (!res.ok) {

      throw new Error(
        "LOGOUT_ERROR"
      );

    }


    result.classList.add(
      "hidden"
    );

    notFound.classList.add(
      "hidden"
    );

    statusEl.textContent =
      "";

    storeId.value =
      "";

    currentEmployeeId.textContent =
      "-";

    employeeId.value =
      "";

    loginStatus.textContent =
      "";


    showLogin();


  } catch (e) {

    console.error(
      "LOGOUT_ERROR:",
      e
    );


    loginStatus.textContent =
      "登出失敗，請稍後再試。";

  } finally {

    logoutBtn.disabled =
      false;

    logoutBtn.textContent =
      "登出";

  }

}



// ============================
// 查詢門市
// ============================

function clearState() {

  result.classList.add(
    "hidden"
  );

  notFound.classList.add(
    "hidden"
  );

  statusEl.textContent =
    "";

}



async function search() {

  clearState();


  const id =
    normalize(storeId.value);


  if (!id) {

    statusEl.textContent =
      "請先輸入店號。";

    storeId.focus();

    return;

  }


  statusEl.textContent =
    "查詢中…";

  searchBtn.disabled =
    true;


  try {

    const res =
      await fetch(
        `${API_BASE}/api/store/${encodeURIComponent(id)}`,
        {
          method: "GET",

          credentials: "include",

          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    // Session 已失效

    if (res.status === 401) {

      alert(
        "登入已失效，請重新登入。"
      );


      showLogin();

      loginStatus.textContent =
        "請重新登入。";

      return;

    }


    // 找不到門市

    if (res.status === 404) {

      statusEl.textContent =
        "";

      notFound.classList.remove(
        "hidden"
      );

      return;

    }


    if (!res.ok) {

      throw new Error(
        "API_ERROR"
      );

    }


    const data =
      await res.json();


    // Worker 回傳格式：
    // data.data.storeId
    // data.data.storeName
    // data.data.phone
    // data.data.circuit


    rStoreId.textContent =
      data.data.storeId || "-";


    rStoreName.textContent =
      data.data.storeName || "-";


    if (data.data.phone) {

      rPhone.textContent =
        data.data.phone;


      rPhone.href =
        `tel:${data.data.phone.replace(
          /[^0-9+#*]/g,
          ""
        )}`;

    } else {

      rPhone.textContent =
        "-";

      rPhone.removeAttribute(
        "href"
      );

    }


    rCircuit.textContent =
      data.data.circuit || "-";


    result.classList.remove(
      "hidden"
    );


    statusEl.textContent =
      "";


  } catch (e) {

    console.error(
      "SEARCH_ERROR:",
      e
    );


    statusEl.textContent =
      "查詢發生錯誤，請看 F12 Console。";

  } finally {

    searchBtn.disabled =
      false;

  }

}



// ============================
// 事件
// ============================

loginBtn.addEventListener(
  "click",
  login
);


employeeId.addEventListener(
  "keydown",
  e => {

    if (e.key === "Enter") {

      login();

    }

  }
);


searchBtn.addEventListener(
  "click",
  search
);


storeId.addEventListener(
  "keydown",
  e => {

    if (e.key === "Enter") {

      search();

    }

  }
);


logoutBtn.addEventListener(
  "click",
  logout
);



// ============================
// 開啟網站時確認 Session
// ============================

async function checkLogin() {

  try {

    const res =
      await fetch(
        `${API_BASE}/api/me`,
        {
          method: "GET",

          credentials: "include",

          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    if (res.ok) {

      const data =
        await res.json();


      showQuery(
        data.employeeId || "-"
      );


    } else {

      showLogin();

    }


  } catch (e) {

    showLogin();

  }

}



// ============================
// 啟動
// ============================

checkLogin();

// ===================================
// إعدادات ومراجع عناصر الصفحة
// ===================================

const ordersContainer = document.getElementById("ordersContainer");
const searchInput = document.getElementById("searchInput");
const totalOrders = document.getElementById("totalOrders");
const newOrders = document.getElementById("newOrders");
const deliveredOrders = document.getElementById("deliveredOrders");
const sortSelect = document.getElementById("sortSelect");
const refreshBtn = document.getElementById("refreshBtn");

let orders = [];

// ===================================
// أسماء حالات الطلبات
// ===================================

function getStatusText(status) {
    const statuses = {
        new: "طلب جديد",
        processing: "قيد التجهيز",
        delivered: "تم التوصيل"
    };

    return statuses[status] || "غير معروف";
}

// ===================================
// عرض الطلبات
// ===================================

function renderOrders(list) {
    ordersContainer.innerHTML = "";

    if (list.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <p>لا توجد طلبات مطابقة للبحث.</p>
            </div>
        `;
        return;
    }

    list.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";

        card.innerHTML = `
            <div class="order-info">
                <h4>${order.customer}</h4>
                <p>رقم الطلب: #${order.id}</p>
                <p>المدينة: ${order.city}</p>
                <p>التاريخ: ${order.date}</p>
            </div>

            <div class="order-details">
                <span class="status ${order.status}">
                    ${getStatusText(order.status)}
                </span>

                <strong>
                    ${Number(order.total).toLocaleString("ar-YE")} ريال
                </strong>
            </div>
        `;

        ordersContainer.appendChild(card);
    });
}

// ===================================
// تحديث الإحصائيات
// ===================================

function updateStats() {
    totalOrders.textContent = orders.length;

    newOrders.textContent = orders.filter(
        order => order.status === "new"
    ).length;

    deliveredOrders.textContent = orders.filter(
        order => order.status === "delivered"
    ).length;
}

// ===================================
// البحث والترتيب
// ===================================

function searchOrders() {
    const query = searchInput.value.trim().toLowerCase();
    const sortValue = sortSelect.value;

    let filteredOrders = orders.filter(order =>
        order.customer.toLowerCase().includes(query)
    );

    filteredOrders.sort((a, b) => {
        if (sortValue === "newest") {
            return b.date.localeCompare(a.date);
        }

        if (sortValue === "oldest") {
            return a.date.localeCompare(b.date);
        }

        if (sortValue === "highest") {
            return b.total - a.total;
        }

        if (sortValue === "lowest") {
            return a.total - b.total;
        }

        return 0;
    });

    renderOrders(filteredOrders);
}

// ===================================
// عرض التحميل
// ===================================

function showLoading() {
    ordersContainer.innerHTML = `
        <div class="loading-state">
            <div class="loader"></div>
            <p>جاري تحميل الطلبات...</p>
        </div>
    `;
}

// ===================================
// عرض الخطأ وإعادة المحاولة
// ===================================

function showError(message) {
    ordersContainer.innerHTML = `
        <div class="error-state">
            <p>${message}</p>
            <button id="retryBtn">إعادة المحاولة</button>
        </div>
    `;

    document.getElementById("retryBtn").addEventListener(
        "click",
        loadOrders
    );
}

// ===================================
// تحميل الطلبات من ملف JSON
// ===================================

async function loadOrders() {
    showLoading();

    refreshBtn.disabled = true;
    refreshBtn.textContent = "جاري التحديث...";

    try {
        const response = await fetch("orders.json");

        if (!response.ok) {
            throw new Error("تعذر تحميل بيانات الطلبات");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("صيغة بيانات الطلبات غير صحيحة");
        }

        orders = data;

        updateStats();
        searchOrders();

    } catch (error) {
        console.error("خطأ في تحميل الطلبات:", error);

        showError(
            "تعذر تحميل الطلبات. تحقق من اتصال الإنترنت ثم حاول مرة أخرى."
        );

    } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "تحديث الطلبات";
    }
}

// ===================================
// أحداث الصفحة
// ===================================

searchInput.addEventListener("input", searchOrders);

sortSelect.addEventListener("change", searchOrders);

refreshBtn.addEventListener("click", loadOrders);

// ===================================
// تشغيل الصفحة
// ===================================

loadOrders();
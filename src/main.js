const initModal = () => {
  const errorModal = document.querySelector('[data-modal="error"]');
  const modalErrorText = errorModal?.querySelector?.("[data-modal-error-text]");
  const closeBtn = errorModal?.querySelector?.("[data-destroyer]");

  const show = (text) => {
    modalErrorText.textContent = text;
    errorModal?.classList.add("active");
  };

  const hide = () => errorModal?.classList.remove("active");

  errorModal?.addEventListener(
    "click",
    (e) => e.target === errorModal && hide()
  );

  closeBtn?.addEventListener("click", hide);

  return { show, hide };
};

const errorModal = initModal();

const emailField = document.querySelector("#email");
const emailDisplay = document.querySelector("[data-email-display]");

const resendWrapper = document.querySelector(".resend-wrapper");
const resendBtn = document.querySelector("[data-resend-btn]");

const timerDisplay = document.querySelector("[data-timer-text]");

const steps = document.querySelectorAll(".step");
const prevBtn = document.querySelector("[data-step-prev-btn]");
const nextBtn = document.querySelector("[data-step-next-btn]");

const submitBtn = document.querySelector("[data-submit-btn]");

const getInfo = async () => {
  const queryParams = new URLSearchParams(document.location.search);
  const order_id = queryParams.get("order_id");

  try {
    const res = await page.executeBackendScenario(
      "supercell_poluchit_posledniy_zapros_koda",
      {
        order_id,
      }
    );

    return {
      email: res?.email ?? null,
      canSendCode: res?.can_send_code ?? true,
      secondsPassed: res?.seconds_passed ?? 0,
    };
  } catch (error) {
    console.error(`Error on get info: ${error}`);
    return {
      email: null,
      canSendCode: true,
      secondsPassed: 0,
    };
  }
};

const handleNextStep = async () => {
  const currentEmail = emailField.value;

  if (!isEmailValid(currentEmail)) return;

  nextBtn.classList.add("loading");

  const { email, canSendCode, secondsPassed } = await getInfo();

  if (!canSendCode) {
    emailDisplay.textContent = email;
    nextBtn.classList.remove("loading");
    startTimer(secondsPassed);

    changeStep(1);

    return;
  }

  const isCodeSended = await sendCode();
  if (isCodeSended) {
    startTimer(0);
    emailDisplay.textContent = currentEmail;
    changeStep(1);
    nextBtn.classList.remove("loading");
  }
};

let interval;
const startTimer = (secondsPassed) => {
  clearInterval(interval);

  if (secondsPassed >= 60) return;

  let time = 60 - secondsPassed;

  resendWrapper.classList.add("hidden");
  timerDisplay.classList.remove("hidden");
  timerDisplay.textContent = `Код отправлен. Повторная отправка будет доступна через ${time} секунд`;

  interval = setInterval(() => {
    time--;
    timerDisplay.textContent = `Код отправлен. Повторная отправка будет доступна через ${time} секунд`;

    if (time <= 0) {
      clearInterval(interval);
      timerDisplay.classList.add("hidden");
      resendWrapper.classList.remove("hidden");
    }
  }, 1000);
};

const sendCode = async () => {
  const queryParams = new URLSearchParams(document.location.search);
  const order_id = queryParams.get("order_id");
  const order_serial_number = queryParams.get("order_serial_number");

  if (!order_id || !order_serial_number) {
    errorModal.setText("Заказ не найден.");
    errorModal.show();

    return;
  }

  const email = emailField.value;

  try {
    const response = await page.executeBackendScenario(
      "supercell_otpravka_koda",
      {
        order_id,
        order_serial_number,
        email,
      },
      {}
    );

    if (!response.ok) {
      errorModal.show(response.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending code:", error);
    return false;
  }
};

const compareCode = async () => {
  const queryParams = new URLSearchParams(document.location.search);
  const order_id = queryParams.get("order_id");
  const order_serial_number = queryParams.get("order_serial_number");

  const email = emailField.value;
  const code = getCode();

  if (code.length !== 6) return;

  submitBtn.classList.add("loading");

  try {
    await page
      .executeBackendScenario(
        "supercell_proverka_koda",
        {
          order_id,
          order_serial_number,
          email,
          code,
        },
        {}
      )
      .then((res) => {
        if (!res.ok) {
          errorModal.show(res.message);
        }
      });
  } catch (error) {
    console.error("Error confirm code:", error);
  } finally {
    submitBtn.classList.remove("loading");
  }
};

// Util functions
const getCode = () => {
  const inputs = Array.from(document.querySelectorAll(".code"));
  return inputs.map((input) => input.value).join("");
};

const changeStep = (index) => {
  steps.forEach((step, i) => {
    step.dataset.visible = i === index ? "true" : "false";
  });
};

const isEmailValid = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const initCodeInputAutoFocus = () => {
  const codeInputs = document.querySelectorAll(".code");

  codeInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1) {
        const nextInput = codeInputs[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "") {
        const prevInput = codeInputs[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      }
    });
  });
};

initCodeInputAutoFocus();

// Primary code

prevBtn?.addEventListener("click", () => changeStep(0));

nextBtn?.addEventListener("click", handleNextStep);

submitBtn?.addEventListener("click", compareCode);

resendBtn?.addEventListener("click", async () => {
  submitBtn.classList.add("loading");

  const { secondsPassed } = await getInfo();

  await sendCode();
  startTimer(secondsPassed);

  submitBtn.classList.remove("loading");
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
const showHelpPopup = () => {
  const popup = page.getPopup("popup-faq");
  popup.show();
  errorModal.hide();
};

const helpBtns = document.querySelectorAll("[data-help-btn]");
helpBtns.forEach((helpBtn) => helpBtn.addEventListener("click", showHelpPopup));

// Tabs
const tabInit = () => {
  const tab = document.querySelector(".tab");
  const panels = tab?.querySelectorAll(".tab__panel");
  const btns = tab?.querySelectorAll(".tab__btn");

  btns?.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      btns.forEach((btn) => btn.classList.remove("active"));
      btn.classList.add("active");
      changeTab(index);
    });
  });

  const changeTab = (index) => {
    panels.forEach((panel, i) => {
      panel.dataset.visible = i === index ? "true" : "false";
    });
  };
};

tabInit();

const ordersContainer = document.querySelector(".orders-container");
const ordersUploadBtn = document.querySelector(".orders-upload");
let currentPage = 1;

const getOrders = async (currentPage) => {
  try {
    await page
      .executeBackendScenario(
        params.scenario,
        {
          client_id: params.client_id.toString(),
          limit: params.limit,
          page: currentPage,
        },
        {}
      )
      .then((res) => {
        return res.orders;
      });
  } catch (error) {
    console.error("Error getting orders:", error);
    return {
      ok: true,
      rows: [
        {
          order_id: "652c1aiorsje5ibn488jgu56",
          order_serial_number: 10000,
          created_at: {
            date: "2024-11-23 10:02:39.000000",
            timezone_type: 1,
            timezone: "+00:00",
          },
          client_id: "652c0fe0zmnnv3y043tj3533",
          order_status_code: "ORDER_PENDING",
          order_status_name: "Ожидает оплаты",
          order_status_color: "#DC3545",
          total_amount: 1,
          cart_items_text: "Brawl Stars - 30 гемов | 1 шт. | 1 руб.",
        },
        {
          order_id: "652c1aiorsje5ibn488jgu56",
          order_serial_number: 20000,
          created_at: {
            date: "2024-11-23 10:02:39.000000",
            timezone_type: 1,
            timezone: "+00:00",
          },
          client_id: "652c0fe0zmnnv3y043tj3533",
          order_status_code: "ORDER_PENDING",
          order_status_name: "Ожидает оплаты",
          order_status_color: "#DC3545",
          total_amount: 1,
          cart_items_text: "Brawl Stars - 30 гемов | 1 шт. | 1 руб.",
        },
        {
          order_id: "652c1aiorsje5ibn488jgu56",
          order_serial_number: 30000,
          created_at: {
            date: "2024-11-23 10:02:39.000000",
            timezone_type: 1,
            timezone: "+00:00",
          },
          client_id: "652c0fe0zmnnv3y043tj3533",
          order_status_code: "ORDER_PENDING",
          order_status_name: "Ожидает оплаты",
          order_status_color: "#DC3545",
          total_amount: 1,
          cart_items_text: "Brawl Stars - 30 гемов | 1 шт. | 1 руб.",
        },
      ],
      total_count: 3, // Кол-во заказов в базе данных по текущему клиенту;
    };
  }
};

const createOrderCard = (data) => {
  const order = document.createElement("div");

  order.className = "order";
  order.innerHTML = `
    <div class="order__top">
      <div class="order__id order__title">
        Заказ <span>№${data.order_serial_number}</span>
      </div>
      <div class="order__date">
        <span>${data.created_at.date.slice(
          0,
          10
        )}</span> <span>${data.created_at.date.slice(11, 16)}</span>
      </div>
    </div>

    <div class="order__status" style="color: ${data.order_status_color}">${
    data.order_status_name
  }</div>

    <div class="order__title mb-12">Состав заказа:</div>

    <div class="order__items">
      <div class="order__text">
        ${data.cart_items_text}
      </div>
    </div>

    <div class="order__bottom">
      <div class="order__title">Сумма:</div>
      <div class="order__title">${data.total_amount} ₽</div>
    </div>

    <button class="order__btn btn w-full btn-reset">
      Оплатить
    </button>
`;

  return order;
};

const renderOrders = (data) => {
  for (let i = 0; i < 5; i++) {
    const orderCard = createOrderCard(data[i]);
    ordersContainer.appendChild(orderCard);
  }
};

const initOrders = async (currentPage) => {
  const data = await getOrders(currentPage);
  const orders = data.rows;

  if (!orders.length && currentPage === 1) {
    const text = document.createElement("div");
    text.innerHTML = `Здесь пока ничего нет. <br> Вперед за покупками!`;
    text.className = "orders-empty";
    ordersContainer.appendChild(text);
  }

  if (orders.length < 5) {
    ordersUploadBtn.setAttribute("data-visible", "false");
  }

  renderOrders(orders);
};

initOrders(currentPage);

ordersUploadBtn.addEventListener("click", async () => {
  currentPage++;

  ordersUploadBtn.classList.add("loading");
  await initOrders(currentPage);
  ordersUploadBtn.classList.remove("loading");
});

// let exampleResponse = {
//   ok: true,
//   orders: [
//     {
//       order_id: "652c1aiorsje5ibn488jgu56",
//       order_serial_number: 20000,
//       created_at: {
//         date: "2024-11-23 10:02:39.000000",
//         timezone_type: 1,
//         timezone: "+00:00",
//       },
//       client_id: "652c0fe0zmnnv3y043tj3533",
//       order_status_code: "ORDER_PENDING",
//       order_status_name: "Ожидает оплаты",
//       order_status_color: "#DC3545",
//       total_amount: 1,
//       cart_items_text: "Brawl Stars - 30 гемов | 1 шт. | 1 руб.",
//     },
//   ],
//   total_count: 2, // Кол-во заказов в базе данных по текущему клиенту
// };

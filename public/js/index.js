let wrapper = document.querySelector(".wrapper");
let loginLink = document.querySelector(".login-link");
let registerLink = document.querySelector(".register-link");
let iconClose = document.querySelector(".close__button");
let btnPopup = document.querySelector(".floating__button");
const loginForm = document.querySelector(".form-box.login form");
const registerForm = document.querySelector(".form-box.register form");

if (btnPopup && wrapper) {
  btnPopup.addEventListener("click", () => {
    wrapper.classList.add("open");
  });
}

if (iconClose && wrapper) {
  iconClose.addEventListener("click", () => {
    wrapper.classList.remove("open");
  });
}

if (registerLink && wrapper) {
  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    wrapper.classList.add("active");
  });
}

if (loginLink && wrapper) {
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    wrapper.classList.remove("active");
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = registerForm.querySelector("#regEmail");
    const passwordInput = registerForm.querySelector("#regPassword");
    const usernameInput = registerForm.querySelector("#regUsername");

    if (!emailInput || !passwordInput || !usernameInput) {
      console.error("Register inputs not found in form");
      alert("Помилка форми реєстрації: поля не знайдено");
      return;
    }

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const usernameValue = usernameInput.value.trim();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          password: passwordValue,
          username: usernameValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Помилка реєстрації: ${data.error || response.statusText}`);
        return;
      }

      alert("Реєстрація успішна! Тепер ви можете увійти.");
      registerForm.reset();
      if (wrapper) {
        wrapper.classList.remove("active");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Помилка з'єднання із сервером");
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById("userEmail");
    const passwordInput = document.getElementById("userPassword");

    if (!emailInput || !passwordInput) return;

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          password: passwordValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || "Невірний email або пароль");
        return;
      }

      alert(`Вітаємо, ${data.username}! Успішний вхід.`);
      loginForm.reset();
    } catch (err) {
      console.error("Network error:", err);
      alert("Помилка з'єднання із сервером");
    }
  });
}

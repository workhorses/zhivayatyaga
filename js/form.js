document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("participant-form");
    if (!form) return;

    const submitBtn = document.getElementById("submitBtn");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const nameInput = form.querySelector("input[name='name']");
    const consent = form.querySelector("input[name='consent']");
    const checkboxes = form.querySelectorAll("input[name='format[]']");
    const toast = document.getElementById("successToast");

    /* ================= PHONE MASK ================= */

    phoneInput.addEventListener("input", function () {
        let value = phoneInput.value.replace(/\D/g, "");

        if (value.startsWith("8")) {
            value = "7" + value.slice(1);
        }

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        let formatted = "+7";

        if (value.length > 1) {
            formatted += " (" + value.slice(1, 4);
        }
        if (value.length >= 4) {
            formatted += ") " + value.slice(4, 7);
        }
        if (value.length >= 7) {
            formatted += "-" + value.slice(7, 9);
        }
        if (value.length >= 9) {
            formatted += "-" + value.slice(9, 11);
        }

        phoneInput.value = formatted;
    });

    function validatePhone() {
        const digits = phoneInput.value.replace(/\D/g, "");
        return digits.length === 11;
    }

    /* ================= EMAIL VALIDATION ================= */

    function validateEmail() {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(emailInput.value.trim());
    }

    /* ================= NAME VALIDATION ================= */

    function validateName() {
        return nameInput.value.trim().length >= 3;
    }

    /* ================= CHECKBOX VALIDATION ================= */

    function validateFormats() {
        let checked = false;
        checkboxes.forEach(box => {
            if (box.checked) checked = true;
        });
        return checked;
    }

    /* ================= FIELD STATE ================= */

    function updateFieldState(input, isValid) {
        input.classList.remove("valid", "invalid");

        if (input.value.trim() === "") return;

        if (isValid) {
            input.classList.add("valid");
        } else {
            input.classList.add("invalid");
        }
    }

    /* ================= FORM VALIDATION ================= */

    function validateForm() {

        const nameValid = validateName();
        const phoneValid = validatePhone();
        const emailValid = validateEmail();
        const formatsValid = validateFormats();
        const consentValid = consent.checked;

        updateFieldState(nameInput, nameValid);
        updateFieldState(phoneInput, phoneValid);
        updateFieldState(emailInput, emailValid);

        const formValid =
            nameValid &&
            phoneValid &&
            emailValid &&
            formatsValid &&
            consentValid;

        submitBtn.disabled = !formValid;
    }

    form.addEventListener("input", validateForm);
    form.addEventListener("change", validateForm);

    /* ================= TOAST ================= */

    function showToast() {
        if (!toast) return;

        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 4000);
    }

    /* ================= SUBMIT ================= */

    form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    fetch("submit.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast();
            form.reset();
            submitBtn.disabled = true;

            const inputs = form.querySelectorAll("input, textarea");
            inputs.forEach(input => {
                input.classList.remove("valid", "invalid");
            });
        }
    })
    .catch(error => {
        console.error("Ошибка отправки:", error);
    });
});


});

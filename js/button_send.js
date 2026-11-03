document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("participant-form");
    if (!form) return;

    const submitBtn = document.getElementById("submitBtn");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");

    const nameInput = form.querySelector("input[name='name']");
    const consent = form.querySelector("input[name='consent']");
    const checkboxes = form.querySelectorAll("input[name='format[]']");

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

    /* ================= FIELD VALIDATION ================= */

    function validateName() {
        return nameInput.value.trim().length >= 3;
    }

    function validateFormats() {
        let checked = false;
        checkboxes.forEach(box => {
            if (box.checked) checked = true;
        });
        return checked;
    }

    function updateFieldState(input, isValid) {
        input.classList.remove("valid", "invalid");

        if (input.value.trim() === "") return;

        if (isValid) {
            input.classList.add("valid");
        } else {
            input.classList.add("invalid");
        }
    }

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

    form.addEventListener("submit", function (e) {
    e.preventDefault(); // временно отключаем отправку

    showToast();
    form.reset();
    submitBtn.disabled = true;
});

});

/* ================= TOAST SUCCESS ================= */

function showToast() {
    const toast = document.getElementById("successToast");
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

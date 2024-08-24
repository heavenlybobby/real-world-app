document.addEventListener("DOMContentLoaded", () => {
  const amountForm = document.getElementById("amount-form");
  const price1 = document.getElementById("price1");
  const depositAmount = document.getElementById("deposit-amount");
  const modalSubmitBtn = document.getElementById("modal-submit-btn");

  modalSubmitBtn.addEventListener("click", () => {
    depositvalue = parseFloat(depositAmount.value) || 0;

    if (depositvalue < 100) {
      alert("Minimum deposit amount is 100");
      return;
    } else {
      price1.innerHTML = depositvalue;
    }
  });

  amountForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  
});

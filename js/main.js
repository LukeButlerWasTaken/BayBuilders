/* Bay Builders — navbar state, modals, and EmailJS enquiry form. */
const EMAILJS = { serviceId: "service_mlabskb", templateId: "template_ukt4dau", publicKey: "nSNb0TgAsh7unKR41" };
const TO_EMAIL = "baybuilderspe1@gmail.com";

if (window.emailjs) emailjs.init({ publicKey: EMAILJS.publicKey });

// Navbar: solid background after scrolling; highlight current section
const nav = document.getElementById("mainNav");
const setScrolled = () => nav.classList.toggle("scrolled", window.scrollY > 40);
setScrolled();
window.addEventListener("scroll", setScrolled, { passive: true });
new bootstrap.ScrollSpy(document.body, { target: "#mainNav", rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll("#navMenu .nav-link").forEach(l => l.addEventListener("click", () => {
  const c = bootstrap.Collapse.getInstance(document.getElementById("navMenu")); if (c) c.hide();
}));

// Keyboard support for clickable cards
document.querySelectorAll('[role="button"][data-bs-toggle="modal"]').forEach(el =>
  el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } }));

// Enquiry modal: remember which button opened it and preselect the service
const enquiryModal = document.getElementById("enquiryModal");
const modalForm = enquiryModal.querySelector("form");
enquiryModal.addEventListener("show.bs.modal", e => {
  const b = e.relatedTarget; if (!b) return;
  if (b.dataset.service) modalForm.service.value = b.dataset.service;
  modalForm.dataset.source = b.dataset.source || "Inquiry Modal";
  modalForm.dataset.section = b.dataset.section || "Services";
});
enquiryModal.addEventListener("hidden.bs.modal", () => {
  modalForm.hidden = false; enquiryModal.querySelector(".enquiry-done").hidden = true; setStatus(modalForm, "");
});

// Gallery lightbox
const lb = document.getElementById("lightboxModal");
lb.addEventListener("show.bs.modal", e => {
  const d = e.relatedTarget.dataset;
  document.getElementById("lbImg").src = d.img;
  document.getElementById("lbImg").alt = d.heading;
  document.getElementById("lbTitle").textContent = d.heading;
  document.getElementById("lbLoc").textContent = d.location;
  const btn = document.getElementById("lbEnquire");
  btn.dataset.service = d.service; btn.dataset.heading = d.heading;
});
document.getElementById("lbEnquire").addEventListener("click", e => {
  const d = e.currentTarget.dataset;
  lb.addEventListener("hidden.bs.modal", () => {
    modalForm.service.value = d.service;
    modalForm.dataset.source = "Lightbox " + d.service.toUpperCase() + " Button";
    modalForm.dataset.section = "Gallery Lightbox";
    bootstrap.Modal.getOrCreateInstance(enquiryModal).show();
  }, { once: true });
});

// Forms
function setStatus(form, msg, type) {
  const s = form.querySelector(".form-status"); if (!s) return;
  s.hidden = !msg; s.textContent = msg || ""; s.className = "form-status small " + (type || "");
}

async function submitEnquiry(form) {
  const f = Object.fromEntries(new FormData(form));
  const timestamp = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" }) + " SAST";
  const section = form.dataset.section || "Contact Page";
  const v = {
    to_email: TO_EMAIL, recipient_email: TO_EMAIL,
    from_name: f.name, name: f.name, customer_name: f.name, customerName: f.name, client_name: f.name,
    from_email: f.email, email: f.email, email_address: f.email, emailAddress: f.email, reply_to: f.email,
    phone: f.phone || "Not provided", phone_number: f.phone || "Not provided", contact_number: f.phone || "Not provided", contactNumber: f.phone || "Not provided",
    service: f.service, selected_service: f.service, selectedService: f.service, interested_service: f.service,
    message: f.message, project_details: f.message, projectDetails: f.message, message_details: f.message,
    website_page: section, page: section, page_section: section, submitted_from: section,
    lead_source: section + " - " + (form.dataset.source || "Inquiry Form"),
    timestamp, date_time: timestamp, submission_date: timestamp, dateSubmitted: timestamp, date_submitted: timestamp
  };
  await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, v);
}

document.querySelectorAll(".enquiry-form").forEach(form => {
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = form.querySelector('[type="submit"]'), label = btn.innerHTML;
    btn.disabled = true; btn.textContent = "SENDING..."; setStatus(form, "");
    try {
      if (!window.emailjs) throw new Error("offline");
      await submitEnquiry(form);
      form.reset();
      if (form.closest("#enquiryModal")) {
        form.hidden = true; enquiryModal.querySelector(".enquiry-done").hidden = false;
      } else {
        setStatus(form, "Thank you! Your project inquiry has been sent to Bay Builders. Our team will contact you shortly.", "ok");
      }
    } catch (err) {
      console.error("Enquiry failed:", err);
      setStatus(form, "We couldn't send your enquiry. Please try again, or email us at " + TO_EMAIL + ".", "error");
    } finally { btn.disabled = false; btn.innerHTML = label; }
  });
});

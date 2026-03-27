document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quotation-form");
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Envoi en cours...';

    try {
      const formData = new FormData(form);
      const data = {
        nom: formData.get("nom"),
        telephone: formData.get("telephone"),
        typeClient: formData.get("typeClient"),
        typeLocal: formData.get("typeLocal"),
        ville: formData.get("ville"),
        referenceSTEG: formData.get("referenceSTEG"),
        message: formData.get("message"),
      };

      // 2. Handle file upload to Cloudinary (if file exists)
      const fileInput = document.getElementById("facture-input");
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", file);
        cloudinaryData.append("upload_preset", "devis en ligne");

        const cloudinaryRes = await fetch(
          "https://api.cloudinary.com/v1_1/dpl33j0wx/image/upload",
          {
            method: "POST",
            body: cloudinaryData,
          },
        );

        if (!cloudinaryRes.ok) {
          throw new Error(
            "Erreur lors de l'upload de la facture sur Cloudinary",
          );
        }

        const cloudinaryResult = await cloudinaryRes.json();
        data.facture = cloudinaryResult.secure_url;
      } else {
        data.facture = ""; // No file uploaded
      }

      // 3. Send data to Make Webhook
      const makeRes = await fetch(
        "https://hook.eu2.make.com/but0vgy8zsjubqbpjvxdbjozreskjrok",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!makeRes.ok) {
        throw new Error("Erreur lors de l'envoi au webhook Make");
      }

      // 4. Success handling
      alert(
        "Votre demande de devis a été envoyée avec succès ! Notre équipe vous contactera prochainement.",
      );
      form.reset();
    } catch (error) {
      console.error("Automation Error:", error);
      alert(
        "Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter par téléphone.",
      );
    } finally {
      // 5. Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
});

// emailUtils.ts
export const sendEmail = async (formData: any) => {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      return await response.json(); // Handle success, return email sending result
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Email sending failed");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

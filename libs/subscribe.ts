// libs/subscribe.ts

interface SubscribeResponse {
  success: boolean;
  message: string;
}

export async function subscribeEmail(
  email: string,
): Promise<SubscribeResponse> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      let message = "Failed to subscribe";

      if (errorData?.errors?.email?.length) {
        message = errorData.errors.email[0];
      } else if (errorData?.message) {
        message = errorData.message;
      }

      throw new Error(message);
    }

    return { success: true, message: "Thank you for subscribing!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Subscription failed." };
  }
}

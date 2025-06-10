import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";

export async function POST(req: Request) {
  // Helper function to check if file is too large
  function isFileTooLarge(attachments: any[]): boolean {
    const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total attachment limit
    let totalSize = 0;

    for (const att of attachments) {
      // Calculate approximate size of base64 content
      if (att.content) {
        const contentLength =
          typeof att.content === "string" ? att.content.length : 0;
        // Base64 string length * 0.75 gives approximate byte size
        totalSize += contentLength * 0.75;
      } else if (att.size) {
        totalSize += att.size;
      }
    }

    return totalSize > MAX_TOTAL_SIZE;
  }

  // Set up your SMTP transporter with proper typing
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Use host instead of service
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const body = await req.json();
    const { to, subject, message, attachments } = body;

    // Check if attachments are too large
    if (attachments && attachments.length > 0 && isFileTooLarge(attachments)) {
      return NextResponse.json(
        {
          success: false,
          error: "Total attachment size exceeds 25MB limit",
        },
        { status: 400 },
      );
    }

    // Format current date for email footer
    const currentDate = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Properly type the mailOptions object with attachments
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject || "Reply from Support Team", // default subject if none provided
      text: message,
      html: `
        <p>${message.replace(/\n/g, "<br />")}</p>
        <p style="color: #777; font-size: 0.9em; margin-top: 20px;">
          Sent on: ${currentDate}
        </p>
      `,
      attachments: [], // Initialize empty array
    };

    // Add attachments if they exist
    if (attachments && attachments.length > 0) {
      // Process each attachment
      mailOptions.attachments = attachments.map((att: any): Attachment => {
        // Make sure content is a string before trying to convert to Buffer
        const content = typeof att.content === "string" ? att.content : "";

        // For debugging
        console.log(
          `Processing attachment: ${att.name}, type: ${att.type}, content length: ${content.length}`,
        );

        // For video files, ensure proper content type and encoding
        if (att.type && att.type.startsWith("video/")) {
          return {
            filename: att.name,
            content: Buffer.from(content, "base64"),
            contentType: att.type,
            encoding: "base64",
            contentDisposition: "attachment", // Force as attachment
          };
        }

        // For all other files
        return {
          filename: att.name,
          content: Buffer.from(content, "base64"),
          contentType: att.type,
          encoding: "base64",
        };
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    return NextResponse.json(
      { success: true, message: "Email sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 },
    );
  }
}

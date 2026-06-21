import nodemailer from "nodemailer";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcryptjs from "bcryptjs";

export const sendEmail = async ({ email, emailType, userId }) => {
  try {
    // 1. Create a hashed token
    // (Note: We hash the userId/email to make a secure token, just like before)
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);
    console.log(hashedToken);

    // 2. Update user in DynamoDB based on email type
    if (emailType === "VERIFY") {
      const updateCommand = new UpdateCommand({
        TableName: "Users",
        Key: { email: email }, // Find the user by their email (Partition Key)
        UpdateExpression:
          "set verifyToken = :token, verifyTokenExpiry = :expiry",
        ExpressionAttributeValues: {
          ":token": hashedToken,
          ":expiry": Date.now() + 3600000, // 1 hour from now
        },
      });
      await docClient.send(updateCommand);
    } else if (emailType === "RESET") {
      const updateCommand = new UpdateCommand({
        TableName: "Users",
        Key: { email: email },
        UpdateExpression:
          "set forgotPasswordToken = :token, forgotPasswordTokenExpiry = :expiry",
        ExpressionAttributeValues: {
          ":token": hashedToken,
          ":expiry": Date.now() + 3600000,
        },
      });
      await docClient.send(updateCommand);
    }

    // 3. Nodemailer transporter (I highly recommend moving these to .env.local!)
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER, // Put "2e606edd20aba9" in .env.local
        pass: process.env.MAILTRAP_PASS, // Put "2bcddb7b204795" in .env.local
      },
    });

    const mailOptions = {
      from: "george29183@gmail.com",
      to: email,
      subject:
        emailType === "VERIFY" ? "VERIFY YOUR EMAIL" : "RESET YOUR PASSWORD",
      html: `<p>hahaha yes yes Click <a href="${process.env.DOMAIN}/verify-email?token=${hashedToken}">here</a> to ${
        emailType === "VERIFY" ? "VERIFY YOUR EMAIL" : "RESET YOUR PASSWORD"
      }. Or click copy this and go => <br/> ${process.env.DOMAIN}/verify-email?token=${hashedToken}</p>`,
    };
    console.log(mailOptions);

    return await transport.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error.message);
  }
};
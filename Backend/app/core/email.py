from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_otp_email(email: EmailStr, otp: str):
    html = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #f43f5e; margin: 0; font-size: 28px;">Bid Out</h1>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">Verification Code</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hello,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Please use the following One Time Password (OTP) to complete your login. This code is valid for a short period of time.</p>
            
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">{otp}</span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
            <p>&copy; 2026 Bid Out Logistics. All rights reserved.</p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject="Bid Out - Your Login Verification Code",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

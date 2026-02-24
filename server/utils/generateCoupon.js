// utils/generateCoupon.js
import QRCode from "qrcode";

// Generate QR code as base64 image string
export const generateQRCode = async (text) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      width: 300,
    });

    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

// Generate full coupon object with QR code
export const generateCouponWithQR = async (coupon) => {
  try {
    // QR encodes the coupon code so scanner can read it
    const qrCode = await generateQRCode(coupon.code);

    return {
      code: coupon.code,
      qrCode,           // base64 image — render directly in frontend
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      expiresAt: coupon.expiresAt,
    };
  } catch (error) {
    throw new Error(`Coupon QR generation failed: ${error.message}`);
  }
};
import { query } from './db';
import { sendEmail } from './mail';
import { getAllSettings } from './settings';

export interface Inquiry {
  id: number;
  inquiry_number: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  product_price?: number;
  product_image?: string;
  variation_name?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  quantity_sqft?: string;
  message?: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'Closed';
  created_at: string;
}

export async function ensureInquiriesTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inquiry_number VARCHAR(100) UNIQUE,
        product_id VARCHAR(100),
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100),
        product_price DECIMAL(10,2),
        product_image TEXT,
        variation_name VARCHAR(150),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(100) NOT NULL,
        quantity_sqft VARCHAR(100),
        message TEXT,
        status ENUM('New', 'Contacted', 'Quoted', 'Closed') DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.warn('Could not verify/create inquiries table:', err);
  }
}

export async function getInquiries(): Promise<Inquiry[]> {
  await ensureInquiriesTable();
  const rows = await query<Inquiry[]>(`
    SELECT * FROM inquiries ORDER BY created_at DESC
  `);
  return rows || [];
}

export async function createInquiry(data: {
  product_id?: string;
  product_name: string;
  product_sku?: string;
  product_price?: number;
  product_image?: string;
  variation_name?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  quantity_sqft?: string;
  message?: string;
}): Promise<{ success: boolean; inquiry_number: string; error?: string }> {
  try {
    await ensureInquiriesTable();

    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const inquiryNumber = `MOGA-INQ-${timestampPart}${randomPart}`;

    await query(
      `INSERT INTO inquiries 
      (inquiry_number, product_id, product_name, product_sku, product_price, product_image, variation_name, customer_name, customer_email, customer_phone, quantity_sqft, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
      [
        inquiryNumber,
        data.product_id || null,
        data.product_name,
        data.product_sku || null,
        data.product_price ?? null,
        data.product_image || null,
        data.variation_name || null,
        data.customer_name,
        data.customer_email,
        data.customer_phone,
        data.quantity_sqft || null,
        data.message || null,
      ]
    );

    // Send notification email to store owner
    try {
      const settings = await getAllSettings();
      const adminEmail = settings.admin_notification_email || settings.contact_email || 'info@mogacarpet.ca';

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #1212ff 0%, #0a0ad8 100%); padding: 24px 28px; color: #ffffff;">
            <div style="display: inline-block; background: #ff0000; color: #ffffff; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              New Product Inquiry
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Inquiry Reference: ${inquiryNumber}</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Moga Carpet & Flooring Brampton</p>
          </div>

          <div style="padding: 24px 28px;">
            <!-- Product Card -->
            <div style="display: flex; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              ${data.product_image ? `<img src="${data.product_image}" alt="${data.product_name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1;" />` : ''}
              <div>
                <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #0f172a;">${data.product_name}</h3>
                ${data.variation_name ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #1212ff; font-weight: 600;">Selected Color/Variation: ${data.variation_name}</p>` : ''}
                ${data.product_sku ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b;">SKU: ${data.product_sku}</p>` : ''}
                ${data.product_price ? `<p style="margin: 0; font-size: 14px; font-weight: 800; color: #ff0000;">Unit Price: $${Number(data.product_price).toFixed(2)}</p>` : ''}
              </div>
            </div>

            <!-- Customer Details Table -->
            <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; border-bottom: 2px solid #1212ff; padding-bottom: 6px;">Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 600;">Customer Name:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${data.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email Address:</td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${data.customer_email}" style="color: #1212ff; text-decoration: none; font-weight: 600;">${data.customer_email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone Number:</td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="tel:${data.customer_phone}" style="color: #0f172a; font-weight: 700;">${data.customer_phone}</a></td>
              </tr>
              ${data.quantity_sqft ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Requested Quantity / Sq Ft:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${data.quantity_sqft}</td>
              </tr>
              ` : ''}
            </table>

            <!-- Customer Message -->
            ${data.message ? `
            <div style="background: #f1f5f9; border-left: 4px solid #1212ff; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #475569; margin-bottom: 6px;">Customer Notes / Special Request:</div>
              <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
            </div>
            ` : ''}

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; text-align: center;">
              <a href="mailto:${data.customer_email}?subject=Re:%20Inquiry%20for%20${encodeURIComponent(data.product_name)}%20(${inquiryNumber})" style="display: inline-block; background: #1212ff; color: #ffffff; padding: 10px 24px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 13px;">
                Reply directly to ${data.customer_name}
              </a>
            </div>
          </div>

          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 12px; color: #64748b; text-align: center;">
            Moga Carpet & Flooring • 1-8550 Torbram Road, Brampton ON • (905) 848-2222
          </div>
        </div>
      `;

      await sendEmail({
        to: adminEmail,
        replyTo: data.customer_email,
        subject: `[Product Inquiry] ${data.product_name} - ${data.customer_name} (${inquiryNumber})`,
        html: htmlContent,
      });
    } catch (mailErr) {
      console.warn('Inquiry email could not be dispatched (check SMTP settings):', mailErr);
    }

    return { success: true, inquiry_number: inquiryNumber };
  } catch (err: any) {
    console.error('Failed to create inquiry:', err);
    return { success: false, inquiry_number: '', error: err.message };
  }
}

export async function updateInquiryStatus(id: number, status: string): Promise<boolean> {
  await ensureInquiriesTable();
  await query(`UPDATE inquiries SET status = ? WHERE id = ?`, [status, id]);
  return true;
}

export async function deleteInquiry(id: number): Promise<boolean> {
  await ensureInquiriesTable();
  await query(`DELETE FROM inquiries WHERE id = ?`, [id]);
  return true;
}
